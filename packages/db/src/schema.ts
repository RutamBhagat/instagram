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

const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
};

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 30 }).notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().$onUpdate(() => new Date()),
});

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

export const photoTagsTable = pgTable(
  "photo_tags",
  {
    userId: integer()
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    postId: integer()
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    x: doublePrecision("tag_x").notNull(),
    y: doublePrecision("tag_y").notNull(),
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
