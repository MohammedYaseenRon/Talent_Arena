import { Router } from "express";
import {
  createChallenge,
  scheduleChallenge,
//   publishChallenge,
//   saveDraft,
  getLiveChallenges,
  getUpcomingChallenges,
  publishChallenge,
  saveDraft,
} from "../controllers/challenge.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticateToken, createChallenge);
router.post("/schedule", authenticateToken, scheduleChallenge);
router.post("/:challengeId/publish", authenticateToken, publishChallenge);
router.post("/:challengeId/draft", authenticateToken, saveDraft);
router.get("/live", authenticateToken, getLiveChallenges);
router.get("/upcoming", authenticateToken, getUpcomingChallenges);

export default router;