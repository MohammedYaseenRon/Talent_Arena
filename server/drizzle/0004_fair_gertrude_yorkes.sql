CREATE TABLE "challenge_frontend" (
	"challenge_id" uuid PRIMARY KEY NOT NULL,
	"task_description" text NOT NULL,
	"features" text,
	"optional_requirements" text,
	"api_details" text,
	"design_reference" varchar(500),
	"submission_instructions" text NOT NULL,
	"tech_constraints" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "problem_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "challenge_id" uuid;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "auto_submitted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "challenge_frontend" ADD CONSTRAINT "challenge_frontend_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;