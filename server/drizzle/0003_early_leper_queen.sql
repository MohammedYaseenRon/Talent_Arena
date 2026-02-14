CREATE TYPE "public"."challenge_difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "public"."challenge_type" AS ENUM('FRONTEND', 'BACKEND', 'DSA', 'SYSTEM_DESIGN');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('SCHEDULED', 'LIVE', 'ENDED');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('PENDING', 'AC', 'WA', 'TLE', 'RE');--> statement-breakpoint
CREATE TABLE "challenge_problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"problem_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"score" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"statement" text NOT NULL,
	"problem_type" "challenge_type" NOT NULL,
	"difficulty" "challenge_difficulty" NOT NULL,
	"time_limit_ms" integer,
	"memory_limit_mb" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "test_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"input" text NOT NULL,
	"expected_output" text NOT NULL,
	"is_sample" boolean DEFAULT false,
	"is_hidden" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenge_sessions" DROP CONSTRAINT "challenge_sessions_recruiter_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "session_participants" DROP CONSTRAINT "session_participants_candidate_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_candidate_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "challenge_sessions" ALTER COLUMN "end_time" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ALTER COLUMN "difficulty" SET DATA TYPE "public"."challenge_difficulty" USING "difficulty"::"public"."challenge_difficulty";--> statement-breakpoint
ALTER TABLE "challenge_sessions" ADD COLUMN "status" "session_status" DEFAULT 'SCHEDULED' NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_sessions" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "challenge_type" "challenge_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "created_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session_participants" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "session_participants" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "session_participants" ADD COLUMN "finished_at" timestamp;--> statement-breakpoint
ALTER TABLE "session_participants" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "problem_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "status" "submission_status" DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "runtime_ms" integer;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "memory_mb" integer;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "submitted_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "challenge_problems" ADD CONSTRAINT "challenge_problems_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_problems" ADD CONSTRAINT "challenge_problems_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_session_user" ON "session_participants" USING btree ("session_id","user_id");--> statement-breakpoint
ALTER TABLE "challenge_sessions" DROP COLUMN "recruiter_id";--> statement-breakpoint
ALTER TABLE "challenge_sessions" DROP COLUMN "is_live";--> statement-breakpoint
ALTER TABLE "challenges" DROP COLUMN "problem_statement";--> statement-breakpoint
ALTER TABLE "challenges" DROP COLUMN "time_limit";--> statement-breakpoint
ALTER TABLE "session_participants" DROP COLUMN "candidate_id";--> statement-breakpoint
ALTER TABLE "session_participants" DROP COLUMN "joined_at";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "candidate_id";--> statement-breakpoint
ALTER TABLE "submissions" DROP COLUMN "created_at";