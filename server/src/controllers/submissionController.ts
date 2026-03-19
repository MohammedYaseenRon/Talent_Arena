import { Request, Response } from "express";
import { error } from "node:console";
import { challenges, challengeSessions, sessionParticipants, submissions, users } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { evaluateSubmission } from "../services/evaluateSubmission.js";
import { getIO } from "../lib/socket.js";

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