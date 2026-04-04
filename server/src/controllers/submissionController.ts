import { Request, Response } from "express";
import { error } from "node:console";
import { challenges, challengeSessions, sessionParticipants, submissions, users } from "../db/schema.js";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { evaluateSubmission } from "../services/evaluateSubmission.js";
import { getIO } from "../lib/socket.js";
import { promise } from "zod";

export const submitChallenge = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { challengeId, sessionId } = req.params as { challengeId: string; sessionId: string };
    const { code, language } = req.body;
 
    if (!code || !language) return res.status(400).json({ error: "code and language are required" });
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!challengeId || !sessionId) return res.status(400).json({ error: "challengeId and sessionId are required" });
 
    const [session] = await db.select().from(challengeSessions).where(eq(challengeSessions.id, sessionId)).limit(1);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status === "ENDED") return res.status(403).json({ error: "Session has ended" });
    if (session.status === "SCHEDULED") return res.status(403).json({ error: "Session has not started yet" });
 
    const [participant] = await db
      .select()
      .from(sessionParticipants)
      .where(and(eq(sessionParticipants.sessionId, sessionId), eq(sessionParticipants.userId, userId)))
      .limit(1);
    if (!participant) return res.status(403).json({ error: "Not registered for this session" });
 
    const [existingSubmission] = await db
      .select()
      .from(submissions)
      .where(and(eq(submissions.sessionId, sessionId), eq(submissions.userId, userId), eq(submissions.challengeId, challengeId)))
      .limit(1);
    if (existingSubmission) return res.status(409).json({ error: "Already submitted" });
 
    // Save submission
    const [submission] = await db
      .insert(submissions)
      .values({ sessionId, userId, challengeId, language, code, status: "PENDING", autoSubmitted: req.body.autoSubmitted ?? false })
      .returning();
    if (!submission) return res.status(500).json({ error: "Failed to save submission" });
 
    // Update finishedAt
    await db
      .update(sessionParticipants)
      .set({ finishedAt: new Date() })
      .where(and(eq(sessionParticipants.sessionId, sessionId), eq(sessionParticipants.userId, userId)));
 
    // Get candidate name for socket emit
    const [candidateUser] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
 
    // Emit to leaderboard room — candidate submitted
    getIO().to(`leaderboard:${challengeId}`).emit("submission:new", {
      challengeId,
      sessionId,
      userId,
      name: candidateUser?.name ?? "Unknown",
      email: candidateUser?.email ?? "",
      submittedAt: new Date().toISOString(),
    });
 
    evaluateSubmission(submission.id, challengeId, userId, code).catch(console.error);
 
    return res.status(201).json({ message: "Submitted successfully", submissionId: submission.id });
  } catch (error) {
    console.error("Submit error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// export const getSessionSubmission = async(req: Request, res: Response) => {
//     try{
//         const recruiterId = req.user?.userId;
//         const { challengeId, sessionId } = req.params as {
//             challengeId: string;
//             sessionId: string;
//         };

//         if(!recruiterId){
//             return res.status(401).json({error: "Unauthorized"});
//         }

//         const [challenge] = await db
//         .select()
//         .from(challenges)
//         .where(
//             and(
//                 eq(challenges.id, challengeId),
//                 eq(challenges.createdBy, recruiterId)
//             )
//         )
//         .limit(1)


//         if (!challenge) {
//         return res.status(403).json({ error: "Not authorized" });
//         }

//         const participants = await db
//         .select({
//             userId: users.id,
//             name: users.name,
//             email: users.email,
//             startedAt: sessionParticipants.startedAt,
//             finishedAt: sessionParticipants.finishedAt,
//             submissionId: submissions.id,
//             submittedAt: submissions.submittedAt,
//             autoSubmitted: submissions.autoSubmitted,
//             aiScore: submissions.aiScore,
//             aiSummary: submissions.aiSummary,
//             aiBreakdown: submissions.aiBreakDown,
//             aiStrengths: submissions.aiStrengths,
//             aiImprovements: submissions.aiImprovements,
//             featuresCompleted: submissions.featuresCompleted,
//             featuresMissing: submissions.featuresMissing,
//             evaluatedAt: submissions.evaluatedAt,
//         })
//         .from(sessionParticipants)
//         .innerJoin(users, eq(sessionParticipants.userId, users.id))
//         .leftJoin(
//             submissions,
//             and(
//                 eq(submissions.sessionId, sessionId),
//                 eq(submissions.userId, sessionParticipants.userId)
//             )
//         )
//         .where(eq(sessionParticipants.sessionId, sessionId))
//         .orderBy(submissions.aiScore);

//         const result = participants.map((p) => ({
//         ...p,
//         status: p.submissionId
//             ? p.evaluatedAt
//             ? "EVALUATED"
//             : "PENDING"
//             : p.startedAt
//             ? "IN_PROGRESS"
//             : "REGISTERED",
//         }));

//         return res.status(200).json({
//         challengeTitle: challenge.title,
//         sessionId,
//         total: result.length,
//         submissions: result,
//         });
//     }catch(error){
//         return res.status(500).json({error: "Internal server error"});
//     }
// }

export const getCandidateSubmission = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.user?.userId;
    const { challengeId, userId } = req.params as {
      challengeId: string;
      userId: string;
    };
    const sessionId = req.query.session as string;

    if (!recruiterId) return res.status(401).json({ error: "Unauthorized" });
    if (!sessionId) return res.status(400).json({ error: "session is required" });

    const [challenge] = await db
      .select()
      .from(challenges)
      .where(
        and(
          eq(challenges.id, challengeId),
          eq(challenges.createdBy, recruiterId)
        )
      )
      .limit(1);

    if (!challenge) return res.status(403).json({ error: "Not authorized" });
    const [submission] = await db
      .select({
        submissionId: submissions.id,
        code: submissions.code,
        language: submissions.language,
        status: submissions.status,
        autoSubmitted: submissions.autoSubmitted,
        submittedAt: submissions.submittedAt,
        aiScore: submissions.aiScore,
        aiSummary: submissions.aiSummary,
        aiBreakdown: submissions.aiBreakDown,
        aiStrengths: submissions.aiStrengths,
        aiImprovements: submissions.aiImprovements,
        featuresCompleted: submissions.featuresCompleted,
        featuresMissing: submissions.featuresMissing,
        evaluatedAt: submissions.evaluatedAt,
        candidateName: users.name,
        candidateEmail: users.email,
      })
      .from(submissions)
      .innerJoin(users, eq(submissions.userId, users.id))
      .where(
        and(
          eq(submissions.challengeId, challengeId),
          eq(submissions.sessionId, sessionId),
          eq(submissions.userId, userId)
        )
      )
      .limit(1);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const codeFiles = JSON.parse(submission.code);

    return res.status(200).json({
      challengeTitle: challenge.title,
      submission: {
        ...submission,
        codeFiles,
      },
    });
  } catch (error) {
    console.error("Get candidate submission error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecruiterDashboardData = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.user?.userId;
    if (!recruiterId) return res.status(401).json({ error: "Unauthorized" });

    const [
      challengeCounts,
      sessionCounts,
      scoreStats,
      topPerformers,
      recentSubmissions,
      upcomingSessions,
      totalParticipants,
    ] = await Promise.all([

      db
        .select({ isDraft: challenges.isDraft, count: sql<number>`count(*)::int` })
        .from(challenges)
        .where(eq(challenges.createdBy, recruiterId))
        .groupBy(challenges.isDraft),

      db
        .select({ status: challengeSessions.status, count: sql<number>`count(*)::int` })
        .from(challengeSessions)
        .innerJoin(challenges, eq(challengeSessions.challengeId, challenges.id))
        .where(eq(challenges.createdBy, recruiterId))
        .groupBy(challengeSessions.status),

      db
        .select({
          avgScore:      sql<number>`round(avg(${submissions.aiScore}))::int`,
          totalEvaluated: sql<number>`count(*)::int`,
          high:          sql<number>`count(*) filter (where ${submissions.aiScore} >= 80)::int`,
          mid:           sql<number>`count(*) filter (where ${submissions.aiScore} >= 60 and ${submissions.aiScore} < 80)::int`,
          low:           sql<number>`count(*) filter (where ${submissions.aiScore} < 60)::int`,
        })
        .from(submissions)
        .innerJoin(challengeSessions, eq(submissions.sessionId, challengeSessions.id))
        .innerJoin(challenges, eq(challengeSessions.challengeId, challenges.id))
        .where(
          and(
            eq(challenges.createdBy, recruiterId),
            isNotNull(submissions.aiScore)
          )
        ),

      db
        .select({
          userId:         users.id,
          name:           users.name,
          aiScore:        submissions.aiScore,
          challengeId:    challenges.id,
          challengeTitle: challenges.title,
          sessionId:      challengeSessions.id,
          autoSubmitted:  submissions.autoSubmitted,
        })
        .from(submissions)
        .innerJoin(users,             eq(submissions.userId,            users.id))
        .innerJoin(challengeSessions, eq(submissions.sessionId,         challengeSessions.id))
        .innerJoin(challenges,        eq(challengeSessions.challengeId, challenges.id))
        .where(
          and(
            eq(challenges.createdBy, recruiterId),
            isNotNull(submissions.aiScore)
          )
        )
        .orderBy(desc(submissions.aiScore))
        .limit(5),

      db
        .select({
          userId:         users.id,
          name:           users.name,
          aiScore:        submissions.aiScore,
          challengeId:    challenges.id,
          challengeTitle: challenges.title,
          sessionId:      challengeSessions.id,
          submittedAt:    submissions.submittedAt,
        })
        .from(submissions)
        .innerJoin(users,             eq(submissions.userId,            users.id))
        .innerJoin(challengeSessions, eq(submissions.sessionId,         challengeSessions.id))
        .innerJoin(challenges,        eq(challengeSessions.challengeId, challenges.id))
        .where(eq(challenges.createdBy, recruiterId))
        .orderBy(desc(submissions.submittedAt))
        .limit(5),

      db
        .select({
          challengeId:      challenges.id,
          sessionId:        challengeSessions.id,
          title:            challenges.title,
          difficulty:       challenges.difficulty,
          startTime:        challengeSessions.startTime,
          participantCount: sql<number>`count(${sessionParticipants.id})::int`,
        })
        .from(challengeSessions)
        .innerJoin(challenges,         eq(challengeSessions.challengeId,   challenges.id))
        .leftJoin(sessionParticipants, eq(sessionParticipants.sessionId,   challengeSessions.id))
        .where(
          and(
            eq(challenges.createdBy, recruiterId),
            eq(challengeSessions.status, "SCHEDULED")
          )
        )
        .groupBy(challenges.id, challengeSessions.id)
        .orderBy(challengeSessions.startTime)
        .limit(4),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(sessionParticipants)
        .innerJoin(challengeSessions, eq(sessionParticipants.sessionId,    challengeSessions.id))
        .innerJoin(challenges,        eq(challengeSessions.challengeId,    challenges.id))
        .where(eq(challenges.createdBy, recruiterId)),
    ]);

    const counts = { DRAFT: 0, PUBLISHED: 0, SCHEDULED: 0, LIVE: 0, ENDED: 0 };
    for (const r of challengeCounts) {
      if (r.isDraft) counts.DRAFT += r.count;
      else           counts.PUBLISHED += r.count;
    }
    for (const r of sessionCounts) {
      counts[r.status] = r.count;
    }

    const stats = scoreStats[0];

    return res.status(200).json({
      counts,
      totalChallenges:   Object.values(counts).reduce((a, b) => a + b, 0),
      totalParticipants: totalParticipants[0]?.count ?? 0,
      totalSubmitted:    recentSubmissions.length, // frontend only uses this for display
      totalEvaluated:    stats?.totalEvaluated ?? 0,
      avgScore:          stats?.avgScore ?? null,
      scoreHigh:         stats?.high ?? 0,
      scoreMid:          stats?.mid  ?? 0,
      scoreLow:          stats?.low  ?? 0,
      topPerformers,
      recentSubs:        recentSubmissions,  
      upcoming:          upcomingSessions,   
      live:              counts.LIVE > 0 ? [{ count: counts.LIVE }] : [], 
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
