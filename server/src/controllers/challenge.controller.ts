import e, { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  challenges,
  challengeSessions,
  frontendChallenges,
  sessionParticipants,
} from "../db/schema.js";
import { and, eq } from "drizzle-orm";

export const createChallenge = async (req: Request, res: Response) => {
  try {
    const { title, description, difficulty, challengeType, frontendDetails } =
      req.body;
    const createdBy = req.user?.userId ?? req.body.createdBy;
    if (!title || !difficulty || !challengeType || !createdBy) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (req.user?.role !== "RECRUITER") {
      return res.status(403).json({ error: "Only recruiters can create challenges" });
    }

    if (challengeType === "FRONTEND" && !frontendDetails) {
      return res.status(400).json({
        error: "Frontend details are required for frontend challenges",
      });
    }

    if (challengeType === "FRONTEND") {
      const { taskDescription, submissionInstructions } = frontendDetails;
      if (!taskDescription || !submissionInstructions) {
        return res.status(400).json({
          error: "taskDescription and submissionInstructions are required",
        });
      }
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

    if (challengeType === "FRONTEND" && frontendDetails) {
      const [frontendData] = await db
        .insert(frontendChallenges)
        .values({
          challengeId: draft.id,
          taskDescription: frontendDetails.taskDescription,
          features: frontendDetails.features || null,
          optionalRequirements: frontendDetails.optionalRequirements || null,
          apiDetails: frontendDetails.apiDetails || null,
          designReference: frontendDetails.designReference || null,
          submissionInstructions: frontendDetails.submissionInstructions,
          techConstraints: frontendDetails.techConstraints || null,
          starterCode: frontendDetails.starterCode || null,
          solutionTemplate: frontendDetails.solutionTemplate || null,
          allowedLanguages: frontendDetails.allowedLanguages || null,
        })
        .returning();
        return res.status(201).json({
          message: "Frontend challenge created",
          challenge: {
            ...draft,
            frontendDetails: frontendData,
          },
        });
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


export const scheduleChallengeSession = async (req: Request, res: Response) => {
  try {
    const challengeId = Array.isArray(req.params.challengeId)
      ? req.params.challengeId[0]
      : req.params.challengeId;

    const { startTime, endTime } = req.body;

    if (!challengeId || !startTime || !endTime) {
      return res
        .status(400)
        .json({ error: "Challenge ID, start and end times required" });
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

    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Prevent scheduling a draft
    if (challenge.isDraft) {
      return res.status(400).json({
        error: "Publish the challenge before scheduling a session",
      });
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
      message: "Challenge session scheduled successfully",
      session,
    });
  } catch (error) {
    console.error("Schedule session error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// getAllChallenges — paste this in challengeController.ts too
export const getAllChallenges = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const validStatuses = ["DRAFT", "PUBLISHED", "SCHEDULED", "LIVE", "ENDED"];

    const allChallenges = await db
      .select()
      .from(challenges)
      .orderBy(challenges.createdAt);

    const enriched = await Promise.all(
      allChallenges.map(async (challenge) => {
        const [activeSession] = await db
          .select()
          .from(challengeSessions)
          .where(eq(challengeSessions.challengeId, challenge.id))
          .orderBy(challengeSessions.startTime)
          .limit(1);

        const uiStatus = deriveUIStatus({
          isDraft: challenge.isDraft,
          status: activeSession?.status ?? null,
        });

        return {
          challengeId: challenge.id,
          title: challenge.title,
          description: challenge.description,
          difficulty: challenge.difficulty,
          challengeType: challenge.challengeType,
          isDraft: challenge.isDraft,
          createdAt: challenge.createdAt,
          sessionId: activeSession?.id ?? null,
          startTime: activeSession?.startTime ?? null,
          endTime: activeSession?.endTime ?? null,
          status: activeSession?.status ?? null,
          uiStatus,
        };
      })
    );

    const filtered =
      status && validStatuses.includes(status as string)
        ? enriched.filter((c) => c.uiStatus === status)
        : enriched;

    return res.status(200).json({
      challenges: filtered,
      total: filtered.length,
      filter: status ?? "ALL",
    });
  } catch (error) {
    console.error("Get all challenges error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

function deriveUIStatus(c: {
  isDraft: boolean;
  status: string | null;
}): string {
  if (c.isDraft) return "DRAFT";
  if (!c.status) return "PUBLISHED";
  if (c.status === "LIVE") return "LIVE";
  if (c.status === "SCHEDULED") return "SCHEDULED";
  if (c.status === "ENDED") return "ENDED";
  return "PUBLISHED";
}
export const joinChallenge = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const sessionIdParam = req.params.sessionId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!sessionIdParam || Array.isArray(sessionIdParam)) {
      return res.status(400).json({ error: "Invalid session ID" });
    }

    const sessionId = sessionIdParam as string;

    const [session] = await db
      .select()
      .from(challengeSessions)
      .where(eq(challengeSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return res.status(404).json({ error: "Challenge session not found" });
    }

    if (session.status !== "LIVE") {
      return res.status(400).json({ error: "Challenge is not currently live" });
    }

    if (new Date() > new Date(session.endTime)) {
      return res.status(400).json({ error: "Challenge session has ended" });
    }

    const [existingParticipation] = await db
      .select()
      .from(sessionParticipants)
      .where(
        and(
          eq(sessionParticipants.sessionId, sessionId),
          eq(sessionParticipants.userId, userId)
        )
      )
      .limit(1);

    if (existingParticipation) {
      return res.status(409).json({ error: "Already joined this challenge" });
    }

    const [participant] = await db
      .insert(sessionParticipants)
      .values({
        sessionId,
        userId,
        startedAt: new Date(),
      })
      .returning();

    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, session.challengeId))
      .limit(1);

    return res.status(200).json({
      message: "Successfully joined challenge",
      session,
      challenge,
      participation: participant,
    });
  } catch (error) {
    console.error("Join challenge error:", error);
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
      .where(eq(challengeSessions.status, "LIVE"));

    return res.status(200).json({ challenges: liveChallenges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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
      .where(eq(challengeSessions.status, "SCHEDULED"))
      .orderBy(challengeSessions.startTime);

    return res.status(200).json({ challenges: upcoming });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const scheduleChallenge = async (req: Request, res: Response) => {
  try {
    console.log("Received body:", req.body);  // ← Add this
    const { challengeId, startTime, endTime, notifyCandidates } = req.body;
    console.log("Parsed values:", { challengeId, startTime, endTime });  // ← Add this
    if (!challengeId || !startTime || !endTime) {
      return res
        .status(400)
        .json({ error: "Challenge ID, start and end times required" });
    }

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

    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
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
      message: "Challenge scheduled successfully",
      session,
    });
  } catch (error) {
    console.error("Schedule error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const publishChallenge = async (req: Request, res: Response) => {
  try {
    const challengeId = Array.isArray(req.params.challengeId)
      ? req.params.challengeId[0]
      : req.params.challengeId;

    if (!challengeId) {
      return res.status(400).json({ error: "Challenge ID required" });
    }

    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    if (!challenge.isDraft) {
      return res.status(400).json({ error: "Challenge is already published" });
    }

    const [updatedChallenge] = await db
      .update(challenges)
      .set({ isDraft: false, updatedAt: new Date() })
      .where(eq(challenges.id, challengeId))
      .returning();

    return res.status(200).json({
      message: "Challenge published successfully",
      challenge: updatedChallenge,
    });
  } catch (error) {
    console.error("Publish error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const saveDraft = async (req: Request, res: Response) => {
  try {
    const challengeId = Array.isArray(req.params.challengeId) 
      ? req.params.challengeId[0] 
      : req.params.challengeId;
    if (!challengeId) {
      return res.status(400).json({ error: "Challenge ID required" });
    }

    // Verify challenge exists and is already a draft
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId))
      .limit(1);

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    // Update timestamp
    const [updated] = await db
      .update(challenges)
      .set({ updatedAt: new Date() })
      .where(eq(challenges.id, challengeId))
      .returning();

    return res.status(200).json({
      message: "Challenge saved as draft",
      challenge: updated,
    });
  } catch (error) {
    console.error("Save draft error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
