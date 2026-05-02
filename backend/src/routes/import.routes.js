import { Router } from "express";
import upload from "../middlewares/upload.js";
import { importStudents } from "../controllers/import.controller.js";

const router = Router();

router.post("/estudiantes", upload.single("file"), importStudents);

export default router;
