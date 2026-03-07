import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { submitChallenge } from "../controllers/submissionController.js";

const router = Router();

router.post(
  "/:challengeId/sessions/:sessionId/submit",
  authenticateToken,
  submitChallenge
);

export default router;