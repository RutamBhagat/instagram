import {
  integer,
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

export const reactionTypeEnum = pgEnum("reaction_type", [
  "like",
  "love",
  "care",
  "funny",
  "sad",
]);

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 30 }).notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp(),
});

export const postsTable = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  contents: varchar().notNull(),
  url: varchar().notNull(),
  userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp(),
});

export const commentsTable = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  contents: varchar({ length: 240 }).notNull(),
  postId: integer().references(() => postsTable.id, { onDelete: "cascade" }),
  userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp(),
});

export const postReactionsTable = pgTable(
  "post_reactions",
  {
    type: reactionTypeEnum().notNull().default("like"),
    postId: integer().references(() => postsTable.id, { onDelete: "cascade" }),
    userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp().notNull().defaultNow(),
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
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.commentId, table.userId] })]
);
