CREATE TYPE "user_status" AS ENUM('active', 'inactive', 'deleted');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" varchar(400);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" varchar(25);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "user_status" DEFAULT 'active'::"user_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE("email");