import * as schema from "./schema";
import { defineRelations } from "drizzle-orm";

export const relations = defineRelations(schema, (r) => ({
  usersTable: {
    posts: r.many.postsTable(),
    comments: r.many.commentsTable(),
    postReactions: r.many.postReactionsTable(),
    commentReactions: r.many.commentReactionsTable(),
    photoTags: r.many.photoTagsTable(),
    captionTags: r.many.captionTagsTable(),
    following: r.many.followersTable({
      from: r.usersTable.id.through(r.followersTable.followerId),
      to: r.usersTable.id.through(r.followersTable.leaderId),
    }),
    followers: r.many.followersTable({
      from: r.usersTable.id.through(r.followersTable.leaderId),
      to: r.usersTable.id.through(r.followersTable.followerId),
    }),
  },
  postsTable: {
    user: r.one.usersTable({
      from: r.postsTable.userId,
      to: r.usersTable.id,
    }),
    comments: r.many.commentsTable(),
    postReactions: r.many.postReactionsTable(),
    commentReactions: r.many.commentReactionsTable(),
    photoTags: r.many.photoTagsTable(),
    captionTags: r.many.captionTagsTable(),
    hashtags: r.many.hashtagsTable({
      from: r.postsTable.id.through(r.hashtagsPostsTable.postId),
      to: r.hashtagsTable.id.through(r.hashtagsPostsTable.hashtagId),
    }),
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
  postReactionsTable: {
    post: r.one.postsTable({
      from: r.postReactionsTable.postId,
      to: r.postsTable.id,
    }),
    user: r.one.usersTable({
      from: r.postReactionsTable.userId,
      to: r.usersTable.id,
    }),
  },
  commentReactionsTable: {
    comment: r.one.commentsTable({
      from: r.commentReactionsTable.commentId,
      to: r.commentsTable.id,
    }),
    user: r.one.usersTable({
      from: r.commentReactionsTable.userId,
      to: r.usersTable.id,
    }),
  },
  photoTagsTable: {
    post: r.one.postsTable({
      from: r.photoTagsTable.postId,
      to: r.postsTable.id,
    }),
    taggedUser: r.one.usersTable({
      from: r.photoTagsTable.userId,
      to: r.usersTable.id,
    }),
  },
  captionTagsTable: {
    post: r.one.postsTable({
      from: r.captionTagsTable.postId,
      to: r.postsTable.id,
    }),
    user: r.one.usersTable({
      from: r.captionTagsTable.userId,
      to: r.usersTable.id,
    }),
  },
  hashtagsTable: {
    posts: r.many.postsTable({
      from: r.hashtagsTable.id.through(r.hashtagsPostsTable.hashtagId),
      to: r.postsTable.id.through(r.hashtagsPostsTable.postId),
    }),
  },
}));
