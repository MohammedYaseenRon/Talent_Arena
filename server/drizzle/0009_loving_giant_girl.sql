CREATE INDEX "idx_sessions_status" ON "challenge_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sessions_challenge_id" ON "challenge_sessions" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "idx_challenges_created_by" ON "challenges" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "idx_submissions_ai_score" ON "submissions" USING btree ("ai_score");--> statement-breakpoint
CREATE INDEX "idx_submissions_submitted_at" ON "submissions" USING btree ("submitted_at");--> statement-breakpoint
CREATE INDEX "idx_submissions_user_id" ON "submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_session_id" ON "submissions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_submissions_challenge_id" ON "submissions" USING btree ("challenge_id");