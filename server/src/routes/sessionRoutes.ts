import { Router } from "express";

import { authenticateToken } from "../middleware/auth.middleware.js";
import { createSession } from "../controllers/session.controller.js";

const router = Router();
router.post("/:challengeId/sessions", authenticateToken, createSession);


export default router;