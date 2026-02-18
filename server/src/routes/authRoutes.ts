import { Router } from "express";
import { login, registration, recruiterRegistration, listRecruiterProfiles,  } from "../controllers/auth.controller.js";

const router = Router();


router.post("/register", registration);
router.post("/recruiter/register", recruiterRegistration);
router.get("/recruiter/profiles", listRecruiterProfiles);
router.post("/login", login);

export default router;