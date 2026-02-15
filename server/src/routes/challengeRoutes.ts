import { Router } from "express";
import { 
    createChallenge, 
    scheduleChallenge,
    getLiveChallenges,
    getUpcomingChallenges
} from "../controllers/challenge.controller.js";

const router = Router();

router.post("/create", createChallenge);
router.post("/schedule", scheduleChallenge);
router.get("/live", getLiveChallenges);
router.get("/upcoming", getUpcomingChallenges);

export default router;