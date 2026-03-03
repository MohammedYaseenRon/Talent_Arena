// controllers/session.controller.ts
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { challengeSessions, challenges, sessionParticipants } from "../db/schema.js";
import { eq } from "drizzle-orm";


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