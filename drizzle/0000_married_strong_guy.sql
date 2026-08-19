CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`category` text NOT NULL,
	`total_copies` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reservation_id` integer,
	`recipient` text NOT NULL,
	`channel` text NOT NULL,
	`template` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`scheduled_for` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`student_name` text NOT NULL,
	`class_name` text NOT NULL,
	`phone` text NOT NULL,
	`status` text NOT NULL,
	`queue_position` integer,
	`pickup_deadline` text,
	`due_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reservations_book_status_idx` ON `reservations` (`book_id`,`status`);
--> statement-breakpoint
CREATE INDEX `reservations_phone_idx` ON `reservations` (`phone`);
--> statement-breakpoint
CREATE INDEX `notifications_status_idx` ON `notifications` (`status`,`scheduled_for`);
--> statement-breakpoint
INSERT INTO `books` (`title`, `author`, `category`, `total_copies`) VALUES
('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 'Literatura', 3),
('Quarto de Despejo', 'Carolina Maria de Jesus', 'Literatura brasileira', 2),
('Dom Casmurro', 'Machado de Assis', 'Clássicos', 4),
('Capitães da Areia', 'Jorge Amado', 'Literatura brasileira', 2),
('Extraordinário', 'R. J. Palacio', 'Juvenil', 2),
('Torto Arado', 'Itamar Vieira Junior', 'Contemporâneo', 3);
