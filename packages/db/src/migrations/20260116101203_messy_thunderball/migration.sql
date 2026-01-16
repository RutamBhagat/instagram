CREATE TABLE "hashtag_posts" (
	"post_id" integer,
	"hashtag_id" integer,
	CONSTRAINT "hashtag_posts_pkey" PRIMARY KEY("post_id","hashtag_id")
);
--> statement-breakpoint
CREATE TABLE "hashtags" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hashtags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(50) NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "hashtag_posts_post_id_idx" ON "hashtag_posts" ("post_id");--> statement-breakpoint
CREATE INDEX "hashtag_posts_hashtag_id_idx" ON "hashtag_posts" ("hashtag_id");--> statement-breakpoint
ALTER TABLE "hashtag_posts" ADD CONSTRAINT "hashtag_posts_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "hashtag_posts" ADD CONSTRAINT "hashtag_posts_hashtag_id_hashtags_id_fkey" FOREIGN KEY ("hashtag_id") REFERENCES "hashtags"("id") ON DELETE CASCADE;