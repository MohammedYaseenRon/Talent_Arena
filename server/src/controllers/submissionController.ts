import { Request, Response } from "express";
import { error } from "node:console";
import { challengeSessions, sessionParticipants, submissions } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { evaluateSubmission } from "../services/evaluateSubmission.js";

export const submitChallenge = async(req: Request, res: Response) => {
    try{
        const userId = req.user?.userId;
        const { challengeId, sessionId } = req.params as {
            challengeId: string;
            sessionId: string;
        };
        const {code, language} = req.body;
        if(!code || !language) {
            return res.status(400).json({error: "code and language are required"});
        }
        if(!userId) {
            return res.status(401).json({error : "Unauthorized"});
        }
        if(!challengeId || !sessionId) {
            return res.status(400).json({error: "challengeId and sessionId are required"});
        }

        const [session] = await db
        .select()
        .from(challengeSessions)
        .where(eq(challengeSessions.id, sessionId))
        .limit(1);

        if(!session) {
            return res.status(404).json({error: "Session not found"});
        }

        if(session.status === "ENDED"){
            return res.status(403).json({ error: "Session has ended" });
        }
        if(session.status === "SCHEDULED") {
            return res.status(403).json({ error: "Session has not started yet" });
        }

        const [participant] = await db
        .select()
        .from(sessionParticipants)
        .where(
            and(
                eq(sessionParticipants.sessionId, sessionId),
                eq(sessionParticipants.userId, userId)
            )
        )
        .limit(1)

        if(!participant){
            return res.status(403).json({ error: "Not registered for this session" });
        }

        const [exisitingSubmission] = await db
        .select()
        .from(submissions)
        .where(
            and(
                eq(submissions.sessionId, sessionId),
                eq(submissions.userId, userId),
                eq(submissions.challengeId, challengeId)
            )
        )
        .limit(1)

        if (exisitingSubmission) {
            return res.status(409).json({ error: "Already submitted" });
        }

        const [submission] = await db
        .insert(submissions)
        .values({
            sessionId, 
            userId, 
            challengeId,
            language,
            code,
            status: "PENDING",
            autoSubmitted:req.body.autoSubmitted ?? false,
        })
        .returning();

        if(!submission) {
            return res.status(500).json({ error: "Failed to save submission" });
        }

        await db.update(sessionParticipants)
        .set({finishedAt: new Date()})
        .where(
            and(
                eq(sessionParticipants.sessionId, sessionId),
                eq(sessionParticipants.userId, userId)
            )
        );

        evaluateSubmission(submission.id, challengeId, code).catch(console.error);
        return res.status(201).json({
            message: "Submitted successfully",
            submissionId: submission.id,
        });
    }catch(error) {
        console.error("Submit error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}