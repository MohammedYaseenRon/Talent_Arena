import e, { Request, Response } from "express";
import { db } from "../db/index.js";
import { challenges, challengeSessions, users } from "../db/schema.js";
import { and, eq } from "drizzle-orm";

export const createChallenge = async (req: Request, res: Response) => {
  try {
    const { title, description, difficulty, challengeType } = req.body;
    const createdBy = req.user?.userId;
    if (!title || !difficulty || !challengeType || !createdBy) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [existingChallenge] = await db
      .select()
      .from(challenges)
      .where(
        and(eq(challenges.title, title), eq(challenges.createdBy, createdBy)),
      );

    if (existingChallenge) {
      return res.status(409).json({ error: "Challenge already exists" });
    }
    const [draft] = await db
      .insert(challenges)
      .values({
        title,
        description: description || null,
        difficulty,
        challengeType,
        createdBy,
      })
      .returning();
    if (!draft) {
      return res.status(500).json({ error: "Failed to draft challenge" });
    }

    return res.status(201).json({
      message: "Draft Created",
      challenge: draft,
    });
  } catch (error) {
    console.error("Create challenge error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const scheduleChallenge = async (req: Request, res: Response) => {
  try {
    const { challengeId, startTime, endTime } = req.body;

    if (!challengeId || !startTime || !endTime) {
      return res
        .status(400)
        .json({ error: "Challenge ID, start and end times required" });
    }

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res
        .status(400)
        .json({ error: "End time must be after start time" });
    }

    if (start <= new Date()) {
      return res
        .status(400)
        .json({ error: "Start time must be in the future" });
    }

    // Create scheduled session
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
      message: "Challenge scheduled",
      session,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLiveChallenges = async (req: Request, res: Response) => {
  try {
    const liveChallenges = await db
    .select({
      sessionId: challengeSessions.id,
      challengeId: challenges.id,
      title: challenges.title,
      description: challenges.description,
      difficulty: challenges.difficulty,
      challengeType: challenges.challengeType,
      startTime: challengeSessions.startTime,
      endTime: challengeSessions.endTime,
      status: challengeSessions.status,
    })
    .from(challengeSessions)
    .innerJoin(challenges, eq(challengeSessions.challengeId, challenges.id))
    .where(eq(challengeSessions.status,  "LIVE"))

    return res.status(200).json({challenges: liveChallenges});
  } catch (error) {
    console.error(error);
    res.status(500).json({error : "Internal server error"});
  }
};

export const getUpcomingChallenges = async (req: Request, res: Response) => {
  try {
    const upcoming = await db
    .select({
      sessionId: challengeSessions.id,
      challengeId: challenges.id,
      title: challenges.title,
      description: challenges.description,
      difficulty: challenges.difficulty,
      challengeType: challenges.challengeType,
      startTime: challengeSessions.startTime,
      endTime: challengeSessions.endTime,
      status: challengeSessions.status,
    })
    .from(challengeSessions)
    .innerJoin(challenges, eq(challengeSessions.challengeId, challenges.id))
    .where(eq(challengeSessions.status,  "SCHEDULED"))
    .orderBy(challengeSessions.startTime)

    return res.status(200).json({challenges: upcoming});
  } catch (error) {
    console.error(error);
    res.status(500).json({error : "Internal server error"});
  }
};




