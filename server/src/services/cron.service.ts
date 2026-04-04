import cron from "node-cron";
import { db } from "../db/index.js";
import { challengeSessions } from "../db/schema.js";
import { eq, and, lte } from "drizzle-orm";
import { getIO } from "../lib/socket.js";


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

    for(const session of goingLive) {
      getIO().to(`session: ${session.id}`).emit("session: status", {
        status: "LIVE",
        sessionId: session.id,
      });
      console.log(`[CRON] Session ${session.id} -> LIVE`);
    }

    for (const session of ending) {
      getIO().to(`session:${session.id}`).emit("session:status", {
        status: "ENDED",
        sessionId: session.id,
      });
      console.log(`[CRON] Session ${session.id} → ENDED`);
    }

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