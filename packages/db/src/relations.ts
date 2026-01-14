import * as schema from "./schema";
import { defineRelations } from "drizzle-orm";

export const relations = defineRelations(schema, (r) => ({
  usersTable: {
    posts: r.many.postsTable(),
    comments: r.many.commentsTable(),
  },
  postsTable: {
    user: r.one.usersTable({
      from: r.postsTable.userId,
      to: r.usersTable.id,
    }),
    comments: r.many.commentsTable(),
  },
  commentsTable: {
    post: r.one.postsTable({
      from: r.commentsTable.postId,
      to: r.postsTable.id,
    }),
    user: r.one.usersTable({
      from: r.commentsTable.userId,
      to: r.usersTable.id,
    }),
  },
}));
