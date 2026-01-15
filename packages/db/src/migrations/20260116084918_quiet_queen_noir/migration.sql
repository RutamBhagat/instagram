CREATE TABLE "tags" (
	"post_id" integer,
	"tagged_user_id" integer,
	"tag_x" double precision NOT NULL,
	"tag_y" double precision NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "tags_pkey" PRIMARY KEY("post_id","tagged_user_id"),
	CONSTRAINT "tags_tag_xy_chk" CHECK ("tag_x" BETWEEN 0 AND 1 AND "tag_y" BETWEEN 0 AND 1)
);
--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "post_reactions" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
CREATE INDEX "tags_post_id_idx" ON "tags" ("post_id");--> statement-breakpoint
CREATE INDEX "tags_user_id_idx" ON "tags" ("tagged_user_id");--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_post_id_posts_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_tagged_user_id_users_id_fkey" FOREIGN KEY ("tagged_user_id") REFERENCES "users"("id") ON DELETE CASCADE;