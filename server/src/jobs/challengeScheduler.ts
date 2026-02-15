import cron from "node-cron";
import { db } from "../db/index.js";
import { challengeSessions } from "../db/schema.js";
import { eq, and, lte, gte } from "drizzle-orm";

export function startChallengeScheduler() {
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();

            // Make SCHEDULED challenges LIVE
            await db
                .update(challengeSessions)
                .set({ status: "LIVE" })
                .where(
                    and(
                        eq(challengeSessions.status, "SCHEDULED"),
                        lte(challengeSessions.startTime, now)
                    )
                );

            // End LIVE challenges
            await db
                .update(challengeSessions)
                .set({ status: "ENDED" })
                .where(
                    and(
                        eq(challengeSessions.status, "LIVE"),
                        lte(challengeSessions.endTime, now)
                    )
                );

            console.log("Challenge scheduler ran");
        } catch (error) {
            console.error("Scheduler error:", error);
        }
    });
}