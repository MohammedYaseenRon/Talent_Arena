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
  joinChallenge,
  checkParticipant,
  getAttemptData,
  getSessionSubmission,
  getAllChallengeSubmissions,
} from "../controllers/challenge.controller.js";
import { createSession } from "../controllers/session.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { uploadDesignImages } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/live", getLiveChallenges);
router.get("/upcoming", getUpcomingChallenges);
router.get("/ended", getEndedChallenges);

router.get("/", authenticateToken, getAllChallenges);
router.get("/submissions/all", authenticateToken, getAllChallengeSubmissions);
router.post("/", uploadDesignImages, authenticateToken, createChallenge);


router.get("/:challengeId/submissions",authenticateToken,getSessionSubmission);
router.get("/:challengeId/attempt-data", authenticateToken, getAttemptData);
router.get("/:challengeId/instructions", authenticateToken, getChallenegeInstruction);
router.patch("/:challengeId/publish", authenticateToken, publishChallenge);
router.post("/:challengeId/sessions", authenticateToken, createSession);
router.get("/:challengeId/sessions", authenticateToken, getSessionsByChallenge);


router.post("/sessions/:sessionId/join", authenticateToken, joinChallenge);
router.get("/sessions/:sessionId/participant", authenticateToken, checkParticipant);

router.get("/:challengeId", authenticateToken, getChallengeById);


export default router;
