import { Router } from "express";
import { getProfileStats } from "../controllers/moodleStats.controller.js";
import { getStudentDashboard } from "../controllers/studentDashboard.controller.js";
import { getStudentPerformance } from "../controllers/studentPerformance.controller.js";
import { getStudentParticipation } from "../controllers/studentParticipation.controller.js";
import { getTeacherDashboard } from "../controllers/teacherDashboard.controller.js";
import { getTeacherActivities } from "../controllers/teacherActivities.controller.js";
import { getTeacherEvaluations } from "../controllers/teacherEvaluations.controller.js";
import { getTeacherRiskMap } from "../controllers/teacherRiskMap.controller.js";

const router = Router();

router.get("/stats", getProfileStats);
router.get("/student/dashboard", getStudentDashboard);
router.get("/student/performance", getStudentPerformance);
router.get("/student/participation", getStudentParticipation);
router.get("/teacher/dashboard", getTeacherDashboard);
router.get("/teacher/activities", getTeacherActivities);
router.get("/teacher/evaluations", getTeacherEvaluations);
router.get("/teacher/risk-map", getTeacherRiskMap);

export default router;
