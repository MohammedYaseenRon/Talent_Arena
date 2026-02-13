import { Router } from "express";
import { login, registration } from "../controllers/auth.controller.js";

const router = Router();


router.post("/register", registration);
router.post("/login", login);

export default router;