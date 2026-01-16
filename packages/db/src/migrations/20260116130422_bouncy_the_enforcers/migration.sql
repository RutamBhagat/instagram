ALTER INDEX "caption_tags_post_id_idx" RENAME TO "caption_tags_post_id_index";--> statement-breakpoint
ALTER INDEX "caption_tags_user_id_idx" RENAME TO "caption_tags_user_id_index";--> statement-breakpoint
ALTER INDEX "user_follows_follower_id_idx" RENAME TO "followers_follower_id_index";--> statement-breakpoint
ALTER INDEX "user_follows_user_id_idx" RENAME TO "followers_leader_id_index";--> statement-breakpoint
ALTER INDEX "hashtag_posts_post_id_idx" RENAME TO "hashtag_posts_post_id_index";--> statement-breakpoint
ALTER INDEX "hashtag_posts_hashtag_id_idx" RENAME TO "hashtag_posts_hashtag_id_index";--> statement-breakpoint
ALTER INDEX "photo_tags_post_id_idx" RENAME TO "photo_tags_post_id_index";--> statement-breakpoint
ALTER INDEX "photo_tags_user_id_idx" RENAME TO "photo_tags_user_id_index";--> statement-breakpoint
ALTER INDEX "posts_location_gist" RENAME TO "posts_location_index";