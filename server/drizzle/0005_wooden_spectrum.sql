ALTER TABLE "challenges" ADD COLUMN "is_draft" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_frontend" ADD COLUMN "starter_code" text;--> statement-breakpoint
ALTER TABLE "challenge_frontend" ADD COLUMN "solution_template" text;--> statement-breakpoint
ALTER TABLE "challenge_frontend" ADD COLUMN "allowed_languages" jsonb;