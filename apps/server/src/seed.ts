import { faker } from "@faker-js/faker";
import { db } from "@instagram/db";
import * as schema from "@instagram/db/schema";
import { sql } from "@instagram/db/index";

const shown = {
  users: 5345,
  postsPerUserMin: 2,
  postsPerUserMax: 6,
  hashtags: 3207,
  maxHashtagsPerPost: 5,
  maxFollowersPerUser: 10,
  maxCommentsPerPost: 8,
  maxLikesPerPost: 19,
  maxLikesPerComment: 13,
  maxPhotoTagsPerPost: 3,
  maxCaptionTagsPerPost: 3,
};

const INSERT_CHUNK_SIZE = 1000;

type UserRow = typeof schema.usersTable.$inferSelect;
type PostRow = typeof schema.postsTable.$inferSelect;
type HashtagRow = typeof schema.hashtagsTable.$inferSelect;
type CommentRow = typeof schema.commentsTable.$inferSelect;

function chunkArray<T>(items: T[], size: number) {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function insertReturning<TReturn>(
  table: unknown,
  rows: unknown[],
  label?: string,
) {
  const results: TReturn[] = [];
  let chunkIndex = 0;
  const chunks = chunkArray(rows, INSERT_CHUNK_SIZE);
  const totalChunks = chunks.length;
  for (const chunk of chunks) {
    const inserted = await db.insert(table as never).values(chunk as never).returning();
    results.push(...(inserted as TReturn[]));
    if (label) {
      chunkIndex += 1;
      console.log(`${label}: ${chunkIndex}/${totalChunks}`);
    }
  }
  return results;
}

async function insertInChunks<T>(table: unknown, rows: T[], label?: string) {
  let chunkIndex = 0;
  const chunks = chunkArray(rows, INSERT_CHUNK_SIZE);
  const totalChunks = chunks.length;
  for (const chunk of chunks) {
    await db.insert(table as never).values(chunk as never);
    if (label) {
      chunkIndex += 1;
      console.log(`${label}: ${chunkIndex}/${totalChunks}`);
    }
  }
}

function makeUsername(index: number) {
  const base = faker.internet
    .username()
    .replace(/[^a-zA-Z0-9_]/g, "")
    .slice(0, 20);
  return `${base || "user"}_${index}`.toLowerCase();
}

function makeHashtag(index: number) {
  const word = faker.word.noun();
  const base = word.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  const suffix = `_${index}`;
  const head = (base || "tag").slice(0, Math.max(0, 45 - suffix.length));
  return `${head}${suffix}`;
}

async function clearTables() {
  const tables = [
    schema.commentLikesTable,
    schema.postLikesTable,
    schema.photoTagsTable,
    schema.captionTagsTable,
    schema.hashtagsPostsTable,
    schema.commentsTable,
    schema.postsTable,
    schema.followersTable,
    schema.hashtagsTable,
    schema.usersTable,
  ];

  for (const table of tables) {
    await db.delete(table);
  }
}

async function seedUsers() {
  const users = Array.from({ length: shown.users }, (_, index) => {
    const username = makeUsername(index + 1);
    const status = faker.helpers.arrayElement(["active", "active", "active", "inactive"] as const);

    return {
      username,
      bio: faker.helpers.arrayElement([null, faker.lorem.sentence({ min: 6, max: 14 })]),
      avatarUrl: faker.image.avatar(),
      phoneNumber: faker.helpers.arrayElement([null, faker.phone.number()]),
      email: `${username}@example.test`,
      password: faker.internet.password(),
      status,
    };
  });

  return insertReturning<UserRow>(schema.usersTable, users, "users");
}

async function seedPosts(userIds: number[]) {
  const posts = userIds.flatMap((userId) => {
    const count = faker.number.int({
      min: shown.postsPerUserMin,
      max: shown.postsPerUserMax,
    });

    return Array.from({ length: count }, () => {
      const includeLocation = faker.number.int({ min: 0, max: 9 }) < 6;
      const lon = faker.number.float({
        min: -180,
        max: 180,
        fractionDigits: 6,
      });
      const lat = faker.number.float({ min: -90, max: 90, fractionDigits: 6 });

      return {
        contents: faker.lorem.paragraph({ min: 1, max: 3 }),
        url: faker.image.url(),
        caption: faker.helpers.arrayElement([null, faker.lorem.sentence({ min: 4, max: 10 })]),
        location: includeLocation ? sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)` : null,
        userId,
      };
    });
  });

  return posts.length ? insertReturning<PostRow>(schema.postsTable, posts, "posts") : [];
}

async function seedHashtags() {
  const tags: { title: string }[] = Array.from(
    { length: shown.hashtags },
    (_, index) => ({ title: makeHashtag(index + 1) }),
  );

  return insertReturning<HashtagRow>(schema.hashtagsTable, tags, "hashtags");
}

async function seedHashtagPosts(postIds: number[], hashtagIds: number[]) {
  const entries: { postId: number; hashtagId: number }[] = [];
  const seen = new Set<string>();

  for (const postId of postIds) {
    const count = faker.number.int({ min: 0, max: shown.maxHashtagsPerPost });
    const picked = faker.helpers.arrayElements(hashtagIds, count);
    for (const hashtagId of picked) {
      const key = `${postId}:${hashtagId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ postId, hashtagId });
    }
  }

  if (entries.length) {
    await insertInChunks(schema.hashtagsPostsTable, entries, "hashtags_posts");
  }
}

async function seedFollowers(userIds: number[]) {
  const entries: { followerId: number; leaderId: number }[] = [];
  const seen = new Set<string>();

  for (const followerId of userIds) {
    const count = faker.number.int({ min: 0, max: shown.maxFollowersPerUser });
    const candidates = userIds.filter((id) => id !== followerId);
    const picked = faker.helpers.arrayElements(candidates, count);
    for (const leaderId of picked) {
      const key = `${followerId}:${leaderId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ followerId, leaderId });
    }
  }

  if (entries.length) {
    await insertInChunks(schema.followersTable, entries, "followers");
  }
}

async function seedComments(userIds: number[], postIds: number[]) {
  const entries: { contents: string; postId: number; userId: number }[] = [];

  for (const postId of postIds) {
    const count = faker.number.int({ min: 0, max: shown.maxCommentsPerPost });
    for (let i = 0; i < count; i += 1) {
      const userId = faker.helpers.arrayElement(userIds);
      entries.push({
        contents: faker.lorem.sentence({ min: 5, max: 15 }),
        postId,
        userId,
      });
    }
  }

  return entries.length
    ? insertReturning<CommentRow>(schema.commentsTable, entries, "comments")
    : [];
}

async function seedPhotoTags(userIds: number[], postIds: number[]) {
  const entries: { userId: number; postId: number; x: number; y: number }[] = [];
  const seen = new Set<string>();

  for (const postId of postIds) {
    const count = faker.number.int({ min: 0, max: shown.maxPhotoTagsPerPost });
    const pickedUsers = faker.helpers.arrayElements(userIds, count);

    for (const userId of pickedUsers) {
      const key = `${postId}:${userId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({
        userId,
        postId,
        x: faker.number.float({ min: 0, max: 1, fractionDigits: 3 }),
        y: faker.number.float({ min: 0, max: 1, fractionDigits: 3 }),
      });
    }
  }

  if (entries.length) {
    await insertInChunks(schema.photoTagsTable, entries, "photo_tags");
  }
}

async function seedCaptionTags(userIds: number[], postIds: number[]) {
  const entries: { userId: number; postId: number }[] = [];
  const seen = new Set<string>();

  for (const postId of postIds) {
    const count = faker.number.int({
      min: 0,
      max: shown.maxCaptionTagsPerPost,
    });
    const pickedUsers = faker.helpers.arrayElements(userIds, count);

    for (const userId of pickedUsers) {
      const key = `${postId}:${userId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ userId, postId });
    }
  }

  if (entries.length) {
    await insertInChunks(schema.captionTagsTable, entries, "caption_tags");
  }
}

async function seedPostLikes(userIds: number[], postIds: number[]) {
  const entries: { postId: number; userId: number }[] = [];
  const seen = new Set<string>();

  for (const postId of postIds) {
    const count = faker.number.int({ min: 0, max: shown.maxLikesPerPost });
    const pickedUsers = faker.helpers.arrayElements(userIds, count);

    for (const userId of pickedUsers) {
      const key = `${postId}:${userId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ postId, userId });
    }
  }

  if (entries.length) {
    await insertInChunks(schema.postLikesTable, entries, "post_likes");
  }
}

async function seedCommentLikes(userIds: number[], commentIds: number[]) {
  const entries: { commentId: number; userId: number }[] = [];
  const seen = new Set<string>();

  for (const commentId of commentIds) {
    const count = faker.number.int({
      min: 0,
      max: shown.maxLikesPerComment,
    });
    const pickedUsers = faker.helpers.arrayElements(userIds, count);

    for (const userId of pickedUsers) {
      const key = `${commentId}:${userId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ commentId, userId });
    }
  }

  if (entries.length) {
    await insertInChunks(schema.commentLikesTable, entries, "comment_likes");
  }
}

async function main() {
  faker.seed(12345);

  console.time("seed:total");

  await clearTables();

  console.time("seed:users");
  const users = await seedUsers();
  console.timeEnd("seed:users");
  const userIds = users.map((user) => user.id);

  console.time("seed:posts");
  const posts = await seedPosts(userIds);
  console.timeEnd("seed:posts");
  const postIds = posts.map((post) => post.id);

  console.time("seed:hashtags");
  const hashtags = await seedHashtags();
  console.timeEnd("seed:hashtags");
  const hashtagIds = hashtags.map((tag) => tag.id);

  console.time("seed:hashtagsPosts");
  await seedHashtagPosts(postIds, hashtagIds);
  console.timeEnd("seed:hashtagsPosts");
  console.time("seed:followers");
  await seedFollowers(userIds);
  console.timeEnd("seed:followers");

  console.time("seed:comments");
  const comments = await seedComments(userIds, postIds);
  console.timeEnd("seed:comments");
  const commentIds = comments.map((comment) => comment.id);

  console.time("seed:photoTags");
  await seedPhotoTags(userIds, postIds);
  console.timeEnd("seed:photoTags");
  console.time("seed:captionTags");
  await seedCaptionTags(userIds, postIds);
  console.timeEnd("seed:captionTags");
  console.time("seed:postLikes");
  await seedPostLikes(userIds, postIds);
  console.timeEnd("seed:postLikes");
  console.time("seed:commentLikes");
  await seedCommentLikes(userIds, commentIds);
  console.timeEnd("seed:commentLikes");

  console.log(
    `Seeded ${userIds.length} users, ${postIds.length} posts, ${commentIds.length} comments.`,
  );

  console.timeEnd("seed:total");
}

try {
  await main();
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  const client = (db as { $client?: { end?: () => Promise<void> } }).$client;
  if (client?.end) {
    await client.end();
  }
}
