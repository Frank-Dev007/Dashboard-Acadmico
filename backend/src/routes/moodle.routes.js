import { Router } from "express";
import { getProfileStats } from "../controllers/moodleStats.controller.js";
import { getStudentDashboard } from "../controllers/studentDashboard.controller.js";
import { getStudentPerformance } from "../controllers/studentPerformance.controller.js";
import { getStudentParticipation } from "../controllers/studentParticipation.controller.js";

const router = Router();

router.get("/stats", getProfileStats);
router.get("/student/dashboard", getStudentDashboard);
router.get("/student/performance", getStudentPerformance);
router.get("/student/participation", getStudentParticipation);

export default router;
