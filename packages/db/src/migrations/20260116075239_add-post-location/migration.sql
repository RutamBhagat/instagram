CREATE TYPE "reaction_type" AS ENUM('like', 'love', 'care', 'funny', 'sad');--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint
CREATE TABLE "comment_reactions" (
	"type" "reaction_type" DEFAULT 'like'::"reaction_type" NOT NULL,
	"comment_id" integer,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comment_reactions_pkey" PRIMARY KEY("comment_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"type" "reaction_type" DEFAULT 'like'::"reaction_type" NOT NULL,
	"post_id" integer,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_reactions_pkey" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "caption" varchar;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "location" geometry(point,4326);--> statement-breakpoint
CREATE INDEX "posts_location_gist" ON "posts" USING gist ("location");--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
