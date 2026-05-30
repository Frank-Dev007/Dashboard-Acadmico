import { Router } from "express";
import { getProfileStats } from "../controllers/moodleStats.controller.js";
import { getStudentDashboard } from "../controllers/studentDashboard.controller.js";
import { getStudentPerformance } from "../controllers/studentPerformance.controller.js";
import { getStudentParticipation } from "../controllers/studentParticipation.controller.js";
import { getTeacherDashboard } from "../controllers/teacherDashboard.controller.js";
import { getTeacherActivities } from "../controllers/teacherActivities.controller.js";
import { getTeacherEvaluations } from "../controllers/teacherEvaluations.controller.js";
import { getTeacherRiskMap } from "../controllers/teacherRiskMap.controller.js";
import { getJefeDepartamentoStats } from "../controllers/jefeDepartamentoStats.controller.js";
import { getJefeDepartamentoUsers } from "../controllers/jefeDepartamentoUsers.controller.js";
import { getJefeDepartamentoTeachers } from "../controllers/jefeDepartamentoTeachers.controller.js";
import {
  getJefeDepartamentoMovimientos,
  getJefeDepartamentoSemesters,
} from "../controllers/jefeDepartamentoMovimientos.controller.js";
import { cacheMiddleware } from "../utils/cache.js";

const router = Router();

// TTLs por tipo de endpoint (en ms)
const TTL_SHORT = 3 * 60 * 1000;   // 3 min — dashboards (datos frescos)
const TTL_MEDIUM = 5 * 60 * 1000;  // 5 min — endpoints normales
const TTL_LONG = 15 * 60 * 1000;   // 15 min — listas relativamente estáticas

// ─── Perfil ──────────────────────────────────────────────────────────────────
router.get(
  "/stats",
  cacheMiddleware(
    (req) => `profile-stats:${req.query.userId}:${req.query.role}`,
    TTL_MEDIUM
  ),
  getProfileStats
);

// ─── Estudiante ──────────────────────────────────────────────────────────────
router.get(
  "/student/dashboard",
  cacheMiddleware((req) => `student-dashboard:${req.query.userId}`, TTL_SHORT),
  getStudentDashboard
);
router.get(
  "/student/performance",
  cacheMiddleware((req) => `student-performance:${req.query.userId}`, TTL_MEDIUM),
  getStudentPerformance
);
router.get(
  "/student/participation",
  cacheMiddleware((req) => `student-participation:${req.query.userId}`, TTL_MEDIUM),
  getStudentParticipation
);

// ─── Profesor ────────────────────────────────────────────────────────────────
router.get(
  "/teacher/dashboard",
  cacheMiddleware((req) => `teacher-dashboard:${req.query.userId}`, TTL_SHORT),
  getTeacherDashboard
);
router.get(
  "/teacher/activities",
  cacheMiddleware((req) => `teacher-activities:${req.query.userId}`, TTL_MEDIUM),
  getTeacherActivities
);
router.get(
  "/teacher/evaluations",
  cacheMiddleware((req) => `teacher-evaluations:${req.query.userId}`, TTL_MEDIUM),
  getTeacherEvaluations
);
router.get(
  "/teacher/risk-map",
  cacheMiddleware((req) => `teacher-risk-map:${req.query.userId}`, TTL_MEDIUM),
  getTeacherRiskMap
);

// ─── Jefe de Departamento ────────────────────────────────────────────────────
router.get(
  "/jefe-departamento/stats",
  cacheMiddleware(
    (req) => `jefe-stats:${req.query.categoryName ?? ""}`,
    TTL_MEDIUM
  ),
  getJefeDepartamentoStats
);
router.get(
  "/jefe-departamento/users",
  cacheMiddleware(
    (req) => `jefe-users:${req.query.categoryName ?? ""}`,
    TTL_MEDIUM
  ),
  getJefeDepartamentoUsers
);
router.get(
  "/jefe-departamento/teachers",
  cacheMiddleware(
    (req) =>
      `jefe-teachers:${req.query.categoryName ?? ""}:${req.query.fromDate ?? ""}:${req.query.toDate ?? ""}`,
    TTL_MEDIUM
  ),
  getJefeDepartamentoTeachers
);
router.get(
  "/jefe-departamento/movimientos",
  cacheMiddleware(
    (req) =>
      `jefe-movimientos:${req.query.categoryName ?? ""}:${req.query.semester ?? "all"}`,
    TTL_MEDIUM
  ),
  getJefeDepartamentoMovimientos
);
router.get(
  "/jefe-departamento/movimientos/semesters",
  cacheMiddleware(
    (req) => `jefe-semesters:${req.query.categoryName ?? ""}`,
    TTL_LONG
  ),
  getJefeDepartamentoSemesters
);

export default router;
