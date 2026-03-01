// controllers/session.controller.ts
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { challengeSessions, challenges } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const startSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Invalid session ID" });
    }    
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || role !== "RECRUITER") {
      return res.status(403).json({ error: "Only recruiters can start sessions" });
    }

    // Fetch session + challenge
    const [session] = await db
      .select({
        id: challengeSessions.id,
        status: challengeSessions.status,
        challengeId: challengeSessions.challengeId,
        createdBy: challenges.createdBy,
      })
      .from(challengeSessions)
      .innerJoin(challenges, eq(challengeSessions.challengeId, challenges.id))
      .where(eq(challengeSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.createdBy !== userId) {
      return res.status(403).json({ error: "You do not own this challenge" });
    }

    if (session.status !== "SCHEDULED") {
      return res
        .status(400)
        .json({ error: `Cannot start session in ${session.status} state` });
    }

    // Mark session LIVE
    const [updatedSession] = await db
      .update(challengeSessions)
      .set({
        status: "LIVE",
        updatedAt: new Date(),
      })
      .where(eq(challengeSessions.id, sessionId))
      .returning();

    /**
     * 🔔 WebSocket broadcast (important)
     * io.to(`challenge:${updatedSession.challengeId}`)
     *   .emit("SESSION_STATUS", { status: "LIVE" });
     */

    return res.status(200).json({
      message: "Session started successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error("Start session error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const challengeId = Array.isArray(req.params.challengeId)
      ? req.params.challengeId[0]
      : req.params.challengeId;

    const { startTime, endTime } = req.body;

    if (!challengeId) {
      return res.status(400).json({ error: "Challenge ID required" });
    }

    if (!startTime || !endTime) {
      return res.status(400).json({ error: "startTime and endTime are required" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (start >= end) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    if (start <= new Date()) {
      return res.status(400).json({ error: "Start time must be in the future" });
    }

    // Make sure challenge exists and is published
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    if (challenge.isDraft) {
      return res.status(400).json({ error: "Publish the challenge before scheduling a session" });
    }

    const [session] = await db
      .insert(challengeSessions)
      .values({
        challengeId,
        startTime: start,
        endTime: end,
        status: "SCHEDULED",
      })
      .returning();

    return res.status(201).json({
      message: "Session scheduled successfully",
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};