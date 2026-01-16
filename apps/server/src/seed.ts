import { faker } from "@faker-js/faker";
import { db } from "@instagram/db";
import * as schema from "@instagram/db/schema";
import { sql } from "@instagram/db/index";

const shown = {
  users: 20,
  postsPerUserMin: 1,
  postsPerUserMax: 4,
  hashtags: 12,
  maxHashtagsPerPost: 3,
  maxFollowersPerUser: 5,
  maxCommentsPerPost: 5,
  maxLikesPerPost: 6,
  maxLikesPerComment: 4,
  maxPhotoTagsPerPost: 2,
  maxCaptionTagsPerPost: 2,
};

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
  const value = base.slice(0, 45) || `tag${index}`;
  return value;
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
    const status = faker.helpers.arrayElement([
      "active",
      "active",
      "active",
      "inactive",
    ] as const);

    return {
      username,
      bio: faker.helpers.arrayElement([
        null,
        faker.lorem.sentence({ min: 6, max: 14 }),
      ]),
      avatarUrl: faker.image.avatar(),
      phoneNumber: faker.helpers.arrayElement([null, faker.phone.number()]),
      email: `${username}@example.test`,
      password: faker.internet.password(),
      status,
    };
  });

  return db.insert(schema.usersTable).values(users).returning();
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
        caption: faker.helpers.arrayElement([
          null,
          faker.lorem.sentence({ min: 4, max: 10 }),
        ]),
        location: includeLocation
          ? sql`ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326)`
          : null,
        userId,
      };
    });
  });

  return posts.length
    ? db.insert(schema.postsTable).values(posts).returning()
    : [];
}

async function seedHashtags() {
  const tags: { title: string }[] = [];
  const seen = new Set<string>();

  while (tags.length < shown.hashtags) {
    const title = makeHashtag(tags.length + 1);
    if (seen.has(title)) continue;
    seen.add(title);
    tags.push({ title });
  }

  return db.insert(schema.hashtagsTable).values(tags).returning();
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
    await db.insert(schema.hashtagsPostsTable).values(entries);
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
    await db.insert(schema.followersTable).values(entries);
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
    ? db.insert(schema.commentsTable).values(entries).returning()
    : [];
}

async function seedPhotoTags(userIds: number[], postIds: number[]) {
  const entries: { userId: number; postId: number; x: number; y: number }[] =
    [];
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
    await db.insert(schema.photoTagsTable).values(entries);
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
    await db.insert(schema.captionTagsTable).values(entries);
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
    await db.insert(schema.postLikesTable).values(entries);
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
    await db.insert(schema.commentLikesTable).values(entries);
  }
}

async function main() {
  faker.seed(12345);

  await clearTables();

  const users = await seedUsers();
  const userIds = users.map((user) => user.id);

  const posts = await seedPosts(userIds);
  const postIds = posts.map((post) => post.id);

  const hashtags = await seedHashtags();
  const hashtagIds = hashtags.map((tag) => tag.id);

  await seedHashtagPosts(postIds, hashtagIds);
  await seedFollowers(userIds);

  const comments = await seedComments(userIds, postIds);
  const commentIds = comments.map((comment) => comment.id);

  await seedPhotoTags(userIds, postIds);
  await seedCaptionTags(userIds, postIds);
  await seedPostLikes(userIds, postIds);
  await seedCommentLikes(userIds, commentIds);

  console.log(
    `Seeded ${userIds.length} users, ${postIds.length} posts, ${commentIds.length} comments.`
  );
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
