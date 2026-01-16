ALTER TABLE "user_follows" RENAME TO "followers";--> statement-breakpoint
ALTER TABLE "followers" RENAME COLUMN "following_id" TO "leader_id";--> statement-breakpoint
ALTER TABLE "photo_tags" RENAME COLUMN "tag_x" TO "x";--> statement-breakpoint
ALTER TABLE "photo_tags" RENAME COLUMN "tag_y" TO "y";--> statement-breakpoint
ALTER INDEX "user_follows_following_id_idx" RENAME TO "user_follows_user_id_idx";--> statement-breakpoint
ALTER TABLE "photo_tags" DROP CONSTRAINT "photo_tags_xy_chk", ADD CONSTRAINT "photo_tags_xy_chk" CHECK ("x" BETWEEN 0 AND 1 AND "y" BETWEEN 0 AND 1);--> statement-breakpoint
ALTER TABLE "followers" DROP CONSTRAINT "user_follows_no_self_follow_chk", ADD CONSTRAINT "user_follows_no_self_follow_chk" CHECK ("follower_id" != "leader_id");