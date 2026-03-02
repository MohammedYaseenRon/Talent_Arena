import { Router } from "express";
import {
  createChallenge,
  publishChallenge,
  getAllChallenges,
  getChallengeById,
  getLiveChallenges,
  getUpcomingChallenges,
  getSessionsByChallenge,
  getEndedChallenges,
  getChallenegeInstruction,
} from "../controllers/challenge.controller.js";
import { createSession } from "../controllers/session.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/live", getLiveChallenges);
router.get("/upcoming", getUpcomingChallenges);
router.get("/ended", getEndedChallenges);

router.get("/", authenticateToken, getAllChallenges);
router.post("/", authenticateToken, createChallenge);
router.get("/:challengeId", authenticateToken, getChallengeById);
router.get("/:challengeId/instructions", authenticateToken, getChallenegeInstruction);
router.patch("/:challengeId/publish", authenticateToken, publishChallenge);

router.post("/:challengeId/sessions", authenticateToken, createSession);
router.get("/:challengeId/sessions", authenticateToken, getSessionsByChallenge);

export default router;
