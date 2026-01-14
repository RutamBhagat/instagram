import { integer, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp(),
};

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: varchar({ length: 30 }).notNull().unique(),
  ...timestamps,
});

export const postsTable = pgTable("posts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  contents: varchar().notNull(),
  url: varchar().notNull(),
  userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
  ...timestamps,
});

export const commentsTable = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  contents: varchar({ length: 240 }).notNull(),
  postId: integer().references(() => postsTable.id, { onDelete: "cascade" }),
  userId: integer().references(() => usersTable.id, { onDelete: "cascade" }),
  ...timestamps,
});
