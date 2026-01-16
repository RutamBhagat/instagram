CREATE TYPE "follow_request_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "user_follows" (
	"follower_id" integer,
	"following_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_follows_pkey" PRIMARY KEY("follower_id","following_id"),
	CONSTRAINT "user_follows_no_self_follow_chk" CHECK ("follower_id" != "following_id")
);
--> statement-breakpoint
CREATE INDEX "user_follows_follower_id_idx" ON "user_follows" ("follower_id");--> statement-breakpoint
CREATE INDEX "user_follows_following_id_idx" ON "user_follows" ("following_id");--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_users_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE;