import * as schema from "./schema";
import { defineRelations } from "drizzle-orm";

export const relations = defineRelations(schema, (r) => ({
  usersTable: {
    posts: r.many.postsTable(),
    comments: r.many.commentsTable(),
    postLikes: r.many.postLikesTable(),
    commentLikes: r.many.commentLikesTable(),
    photoTags: r.many.photoTagsTable(),
    captionTags: r.many.captionTagsTable(),
    following: r.many.usersTable({
      from: r.usersTable.id.through(r.followersTable.followerId),
      to: r.usersTable.id.through(r.followersTable.leaderId),
    }),
    followers: r.many.usersTable({
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
    postLikes: r.many.postLikesTable(),
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
    commentLikes: r.many.commentLikesTable(),
  },
  postLikesTable: {
    post: r.one.postsTable({
      from: r.postLikesTable.postId,
      to: r.postsTable.id,
    }),
    user: r.one.usersTable({
      from: r.postLikesTable.userId,
      to: r.usersTable.id,
    }),
  },
  commentLikesTable: {
    comment: r.one.commentsTable({
      from: r.commentLikesTable.commentId,
      to: r.commentsTable.id,
    }),
    user: r.one.usersTable({
      from: r.commentLikesTable.userId,
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
