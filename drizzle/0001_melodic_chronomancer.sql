CREATE TABLE `audit_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_staff_id` integer NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`details_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`actor_staff_id`) REFERENCES `staff_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_events_actor_created_idx` ON `audit_events` (`actor_staff_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `management_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`category` text DEFAULT 'administrative' NOT NULL,
	`assigned_role_key` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`due_date` text,
	`created_by_staff_id` integer NOT NULL,
	`updated_by_staff_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`assigned_role_key`) REFERENCES `staff_roles`(`key`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by_staff_id`) REFERENCES `staff_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by_staff_id`) REFERENCES `staff_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `management_tasks_role_status_idx` ON `management_tasks` (`assigned_role_key`,`status`);--> statement-breakpoint
CREATE TABLE `school_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`slug` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`event_date` text,
	`event_time` text,
	`location` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_by_staff_id` integer NOT NULL,
	`published_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by_staff_id`) REFERENCES `staff_users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `school_posts_slug_unique` ON `school_posts` (`slug`);--> statement-breakpoint
CREATE INDEX `school_posts_type_status_date_idx` ON `school_posts` (`type`,`status`,`event_date`);--> statement-breakpoint
CREATE TABLE `staff_roles` (
	`key` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`permissions_json` text NOT NULL,
	`responsibilities_json` text DEFAULT '[]' NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `staff_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`role_key` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_by_email` text,
	`last_login_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`role_key`) REFERENCES `staff_roles`(`key`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_users_email_unique` ON `staff_users` (`email`);--> statement-breakpoint
CREATE INDEX `staff_users_role_active_idx` ON `staff_users` (`role_key`,`active`);