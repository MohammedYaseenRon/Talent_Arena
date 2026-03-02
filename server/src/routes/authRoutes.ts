import { Router } from "express";
import { login, registration, recruiterRegistration, listRecruiterProfiles, refreshTokenHandler, getAuthMe, logout,  } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();


router.post("/register", registration);
router.post("/recruiter/register", recruiterRegistration);
router.get("/recruiter/profiles", listRecruiterProfiles);
router.get("/me", authenticateToken, getAuthMe);
router.post("/refresh", refreshTokenHandler);
router.post("/login", login);
router.post("/logout", logout);


export default router;