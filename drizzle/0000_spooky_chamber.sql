-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `walls_account` (
	`user_id` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`provider_account_id` varchar(255) NOT NULL,
	`refresh_token` text DEFAULT 'NULL',
	`access_token` text DEFAULT 'NULL',
	`expires_at` int(11) DEFAULT 'NULL',
	`token_type` varchar(255) DEFAULT 'NULL',
	`scope` varchar(255) DEFAULT 'NULL',
	`id_token` text DEFAULT 'NULL',
	`session_state` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `walls_file` (
	`id` bigint(20) unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`blob` binary(1) NOT NULL,
	`uploaded_by` varchar(255) NOT NULL,
	`uploaded_at` timestamp NOT NULL,
	CONSTRAINT `walls_file_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `walls_session` (
	`session_token` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `walls_user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) DEFAULT 'NULL',
	`email` varchar(255) NOT NULL,
	`email_verified` timestamp(3) DEFAULT 'current_timestamp(3)',
	`image` varchar(255) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `walls_verification_token` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE `walls_account` ADD CONSTRAINT `walls_account_user_id_walls_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `walls_user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walls_file` ADD CONSTRAINT `walls_file_uploaded_by_walls_user_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `walls_user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `walls_session` ADD CONSTRAINT `walls_session_user_id_walls_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `walls_user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `walls_account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `walls_session` (`user_id`);
*/