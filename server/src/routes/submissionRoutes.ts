import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getCandidateSubmission, getRecruiterDashboardData, submitChallenge } from "../controllers/submissionController.js";

const router = Router();
router.get("/dashboard", authenticateToken, getRecruiterDashboardData);
router.post("/:challengeId/sessions/:sessionId/submit",authenticateToken,submitChallenge);
router.get("/:challengeId/submissions/:userId",authenticateToken, getCandidateSubmission);
export default router;