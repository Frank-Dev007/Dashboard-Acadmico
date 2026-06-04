import { Router } from "express";
import { login, refresh, logout, me } from "../controllers/moodleAuth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", verifyJWT, me);

export default router;
