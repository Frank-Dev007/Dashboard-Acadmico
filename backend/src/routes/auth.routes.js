import { Router } from "express";
import { login } from "../controllers/moodleAuth.controller.js";

const router = Router();

router.post("/login", login);

export default router;
