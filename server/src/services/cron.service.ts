import cron from "node-cron";
import { db } from "../db/index.js";
import { challengeSessions } from "../db/schema.js";
import { eq, and, lte } from "drizzle-orm";


export const updateChallengeStatuses = async () => {
  try {
    const now = new Date();
    console.log(`[CRON] Running status update at ${now.toISOString()}`);

    const goingLive = await db
      .update(challengeSessions)
      .set({ status: "LIVE", updatedAt: now })
      .where(
        and(
          eq(challengeSessions.status, "SCHEDULED"),
          lte(challengeSessions.startTime, now)
        )
      )
      .returning();

    const ending = await db
      .update(challengeSessions)
      .set({ status: "ENDED", updatedAt: now })
      .where(
        and(
          eq(challengeSessions.status, "LIVE"),
          lte(challengeSessions.endTime, now)
        )
      )
      .returning();

    console.log(`[CRON] Updated: ${goingLive.length} to LIVE, ${ending.length} to ENDED`);
  } catch (error) {
    console.error("[CRON] Error updating challenge statuses:", error);
  }
};


export const startCronJobs = () => {
  cron.schedule("* * * * *", () => {
    updateChallengeStatuses();
  });

  console.log("[CRON] Cron jobs started - checking every minute");
};