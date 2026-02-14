import { Request, Response } from "express";
import { db } from "../db/index.js";
import { challenges, users } from "../db/schema.js";
import { eq } from "drizzle-orm";


export const createChallenge = async (req: Request, res: Response) => {
    try {
        const {title, description, difficulty, challengeType} = req.body;
        const createdBy = req.user?.userId;
        if(!title || !difficulty || !challengeType) {
            return res.status(400).json({error : "All fields are required"});
        }
        
        const [existingChallenge] = await db
        .select()
        .from(challenges)
        .where(eq(challenges.title, title));

        if(existingChallenge) {
            return res.status(409).json({error: "Challenge already exists"});
        }
        const [newChallenge] = await db
        .insert(challenges)
        .values({
            title,
            description: description || null,
            difficulty,
            challengeType,
            createdBy,
        })
        .returning();
        if (!newChallenge) {
            return res.status(500).json({error: "Failed to create challenge"});
        }

        return res.status(201).json({
            message: "Challenge created successfully", 
            challenge: newChallenge
        });

    } catch(error) {
        console.error("Create challenge error:", error);
        return res.status(500).json({error : "Internal server error"});
    }
}

