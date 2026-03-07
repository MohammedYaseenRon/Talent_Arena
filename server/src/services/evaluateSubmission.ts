import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "../db/index.js";
import { challenges, frontendChallenges, submissions } from "../db/schema.js";
import { eq } from "drizzle-orm";



const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const evaluateSubmission  = async(submissionId: string, challengeId: string, codeJson: string) => {
    try{
        const [challenge] = await db
        .select()
        .from(frontendChallenges)
        .where(eq(frontendChallenges.challengeId, challengeId))
        .limit(1)

        if(!challenge){
            console.error("Challenge not found for evaluation:", challengeId);
            return;
        }

        const codeFiles = JSON.parse(codeJson);
        const codeString = Object.entries(codeFiles)
        .map(([path, code]) =>  `// FILE: ${path}\n${code}`)
        .join("\n\n---\n\n");

        const model = genAi.getGenerativeModel({model: "gemini-2.5-flash"});
        const prompt = `You are a Senior Frontend Engineer with 10+ years of experience and you are evaluation a frontend coding challenge submission.
        CHALLENGE REQUIREMENTS:
        Task: ${challenge.taskDescription}
        Required Features: ${challenge.features ?? "Not specified"}
        Optional Requirements: ${challenge.optionalRequirements ?? "None"}
        Tech Constraints: ${challenge.techConstraints ?? "None"}

        CANDIDATE'S CODE:
        ${codeString}

        Evaluate this submission and respond ONLY with a JSON object, no markdown, no explanation, just raw JSON:
        {
        "overallScore": <0-100>,
        "summary": "<2-3 sentence overall assessment>",
        "breakdown": {
            "requirements": <0-100>,
            "codeQuality": <0-100>,
            "features": <0-100>,
            "optionalFeatures": <0-100>
        },
        "strengths": ["<strength 1>", "<strength 2>"],
        "improvements": ["<improvement 1>", "<improvement 2>"],
        "featuresCompleted": ["<feature>"],
        "featuresMissing": ["<feature>"]
        }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = text.replace(/```json|```/g, "").trim();
        const evaluation = JSON.parse(cleaned);

        await db
        .update(submissions)
        .set({
            aiScore: evaluation.overallScore,
            aiSummary: evaluation.summary,
            aiBreakDown: evaluation.breakdown,
            aiStrengths: evaluation.strengths,
            aiImprovements: evaluation.improvements,
            featuresCompleted: evaluation.featuresCompleted,
            featuresMissing: evaluation.featuresMissing,
            evaluatedAt: new Date(),
        })
        .where(eq(submissions.id, submissionId));

        console.log(
        `Evaluated submission ${submissionId} — score: ${evaluation.overallScore}`
        );

    }catch(error){
        console.error("AI evaluation failed for submission:", submissionId, error);
    }
}