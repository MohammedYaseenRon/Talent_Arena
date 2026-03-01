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
  getAllChallenges,
} from "../controllers/challenge.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { createSession } from "../controllers/session.controller.js";

const router = Router();

router.post("/", authenticateToken, createChallenge);
router.post("/:challengeId/sessions", authenticateToken, createSession);
router.get("/", getAllChallenges);
router.post("/schedule", authenticateToken, scheduleChallenge);
router.patch("/:challengeId/publish", authenticateToken, publishChallenge);
router.post("/:challengeId/sessions", authenticateToken, scheduleChallenge);
router.get("/live", getLiveChallenges);
router.get("/upcoming", getUpcomingChallenges);

export default router;