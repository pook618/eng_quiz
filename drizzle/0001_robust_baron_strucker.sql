CREATE TABLE `quiz_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`studentId` varchar(100) NOT NULL,
	`activityType` varchar(50) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`details` text,
	CONSTRAINT `quiz_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` varchar(100) NOT NULL,
	`quizId` varchar(100) NOT NULL,
	`answers` text NOT NULL,
	`score` int,
	`percentage` int,
	`totalQuestions` int NOT NULL,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_submissions_id` PRIMARY KEY(`id`)
);
