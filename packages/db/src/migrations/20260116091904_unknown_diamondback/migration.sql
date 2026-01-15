CREATE TABLE "caption_tags" (
	"user_id" integer,
	"post_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "caption_tags_pkey" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "photo_tags" (
	"user_id" integer,
	"post_id" integer,
	"tag_x" double precision NOT NULL,
	"tag_y" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "photo_tags_pkey" PRIMARY KEY("post_id","user_id"),
	CONSTRAINT "photo_tags_xy_chk" CHECK ("tag_x" BETWEEN 0 AND 1 AND "tag_y" BETWEEN 0 AND 1)
);
--> statement-breakpoint
DROP TABLE "tags";--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "caption" SET DATA TYPE varchar(240) USING "caption"::varchar(240);--> statement-breakpoint
CREATE INDEX "caption_tags_post_id_idx" ON "caption_tags" ("post_id");--> statement-breakpoint
CREATE INDEX "caption_tags_user_id_idx" ON "caption_tags" ("user_id");--> statement-breakpoint
CREATE INDEX "photo_tags_post_id_idx" ON "photo_tags" ("post_id");--> statement-breakpoint
CREATE INDEX "photo_tags_user_id_idx" ON "photo_tags" ("user_id");--> statement-breakpoint
ALTER TABLE "caption_tags" ADD CONSTRAINT "caption_tags_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "caption_tags" ADD CONSTRAINT "caption_tags_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;