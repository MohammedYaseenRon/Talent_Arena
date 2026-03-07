ALTER TABLE "submissions" ADD COLUMN "ai_score" integer;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "ai_summary" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "ai_breakdown" jsonb;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "ai_strengths" jsonb;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "ai_improvements" jsonb;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "features_completed" jsonb;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "features_missing" jsonb;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "evaluated_at" timestamp;