import {
  doublePrecision,
  integer,
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  primaryKey,
  geometry,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const reactionTypeEnum = pgEnum("reaction_type", [
  "like",
  "love",
  "care",
  "funny",
  "sad",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "deleted",
]);

export const followRequestStatusEnum = pgEnum("follow_request_status", [
  "pending",
  "accepted",
  "rejected",
]);

const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
};

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 30 }).notNull().unique(),
  bio: varchar({ length: 400 }),
  avatarUrl: varchar(),
  phoneNumber: varchar({ length: 25 }),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  status: userStatusEnum().notNull().default("active"),
  ...timestamps,
});

export const followersTable = pgTable(
  "followers",
  {
    leaderId: integer()
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),
    followerId: integer()
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [
    index("user_follows_follower_id_idx").on(table.followerId),
    index("user_follows_user_id_idx").on(table.leaderId),
    primaryKey({ columns: [table.followerId, table.leaderId] }),
    check(
      "user_follows_no_self_follow_chk",
      sql`${table.followerId} != ${table.leaderId}`
    ),
  ]
);

export const postsTable = pgTable(
  "posts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    contents: varchar().notNull(),
    url: varchar().notNull(),
    caption: varchar({ length: 240 }),
    location: geometry("location", { type: "point", mode: "xy", srid: 4326 }),
    userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    index("posts_location_gist").using("gist", table.location),
    check(
      "posts_location_lon_lat_chk",
      sql`ST_SRID(${table.location}) = 4326 AND ST_X(${table.location}) BETWEEN -180 AND 180 AND ST_Y(${table.location}) BETWEEN -90 AND 90`
    ),
  ]
);

export const hashtagsTable = pgTable("hashtags", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 50 }).notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const hashtagsPostsTable = pgTable(
  "hashtag_posts",
  {
    postId: integer()
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    hashtagId: integer()
      .notNull()
      .references(() => hashtagsTable.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    index("hashtag_posts_post_id_idx").on(table.postId),
    index("hashtag_posts_hashtag_id_idx").on(table.hashtagId),
    primaryKey({ columns: [table.postId, table.hashtagId] }),
  ]
);

export const photoTagsTable = pgTable(
  "photo_tags",
  {
    userId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    postId: integer()
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    x: doublePrecision().notNull(),
    y: doublePrecision().notNull(),
    ...timestamps,
  },
  (table) => [
    index("photo_tags_post_id_idx").on(table.postId),
    index("photo_tags_user_id_idx").on(table.userId),
    check(
      "photo_tags_xy_chk",
      sql`${table.x} BETWEEN 0 AND 1 AND ${table.y} BETWEEN 0 AND 1`
    ),
    primaryKey({ columns: [table.postId, table.userId] }),
  ]
);

export const captionTagsTable = pgTable(
  "caption_tags",
  {
    userId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    postId: integer()
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [
    index("caption_tags_post_id_idx").on(table.postId),
    index("caption_tags_user_id_idx").on(table.userId),
    primaryKey({ columns: [table.postId, table.userId] }),
  ]
);

export const commentsTable = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  contents: varchar({ length: 240 }).notNull(),
  postId: integer().references(() => postsTable.id, { onDelete: "cascade" }),
  userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const postReactionsTable = pgTable(
  "post_reactions",
  {
    type: reactionTypeEnum().notNull().default("like"),
    postId: integer().references(() => postsTable.id, { onDelete: "cascade" }),
    userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.postId, table.userId] })]
);

export const commentReactionsTable = pgTable(
  "comment_reactions",
  {
    type: reactionTypeEnum().notNull().default("like"),
    commentId: integer().references(() => commentsTable.id, {
      onDelete: "cascade",
    }),
    userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [primaryKey({ columns: [table.commentId, table.userId] })]
);
