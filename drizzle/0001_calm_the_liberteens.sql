ALTER TABLE `community_posts` MODIFY COLUMN `title` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `community_posts` MODIFY COLUMN `isAnonymous` boolean;--> statement-breakpoint
ALTER TABLE `community_posts` MODIFY COLUMN `isPinned` boolean;--> statement-breakpoint
ALTER TABLE `community_posts` MODIFY COLUMN `likeCount` int;--> statement-breakpoint
ALTER TABLE `community_posts` MODIFY COLUMN `commentCount` int;--> statement-breakpoint
ALTER TABLE `community_posts` MODIFY COLUMN `viewCount` int;--> statement-breakpoint
ALTER TABLE `community_spaces` MODIFY COLUMN `color` varchar(20) DEFAULT '#8B5CF6';--> statement-breakpoint
ALTER TABLE `community_spaces` MODIFY COLUMN `icon` varchar(50) DEFAULT '💬';--> statement-breakpoint
ALTER TABLE `member_profiles` MODIFY COLUMN `journeyStage` enum('researching','preparing','started','experienced','guide') DEFAULT 'researching';--> statement-breakpoint
ALTER TABLE `post_comments` MODIFY COLUMN `isAnonymous` boolean;--> statement-breakpoint
ALTER TABLE `post_comments` MODIFY COLUMN `likeCount` int;--> statement-breakpoint
ALTER TABLE `community_spaces` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `member_profiles` ADD `postCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `member_profiles` ADD `commentCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `member_profiles` ADD `joinedAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `community_spaces` DROP COLUMN `isDefault`;--> statement-breakpoint
ALTER TABLE `member_profiles` DROP COLUMN `createdAt`;--> statement-breakpoint
ALTER TABLE `post_comments` DROP COLUMN `parentId`;