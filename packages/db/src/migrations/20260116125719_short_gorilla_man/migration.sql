ALTER TABLE "comment_reactions" RENAME TO "comment_likes";--> statement-breakpoint
ALTER TABLE "post_reactions" RENAME TO "post_likes";--> statement-breakpoint
ALTER TABLE "comment_likes" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "post_likes" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "post_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
DROP TYPE "reaction_type";