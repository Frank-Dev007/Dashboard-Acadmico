import {
  getUserCourses,
  getCourseEnrolledUsers,
  getCourseQuizzes,
} from "../services/moodle.service.js";
import { computeCourseStats } from "../services/grades.service.js";

const APROBACION_MIN = 3.0;
const MEJOR_ESTUDIANTE_MIN = 4.2;
const ATENCION_MAX = 3.1;

// GET /api/moodle/teacher/evaluations?userId=X
//
// Devuelve:
//   tasaAprobacion           : % de estudiantes con promedio > 3.0 en los cursos del profesor
//   evaluacionesRealizadas   : total de quizzes/evaluaciones del profesor (todos los cursos)
//   distribucion             : [{ rango, cantidad, porcentaje }] sobre los promedios estudiante-curso
//   mejoresEstudiantes       : promedio (en cursos del profesor) > 4.2
//   requierenAtencion        : promedio (en cursos del profesor) < 3.1
export const getTeacherEvaluations = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, msg: "userId requerido" });

    const uid = parseInt(userId);
    const courses = await getUserCourses(uid);

    let evaluacionesRealizadas = 0;
    const allCourseAverages = [];          // cada elemento = promedio de un (estudiante, curso)
    const studentAvgsMap = new Map();      // studentId → { nombre, avgs: [] }

    for (const course of courses) {
      // ── Estudiantes del curso ──────────────────────────────────────────────
      let students = [];
      try {
        const users = await getCourseEnrolledUsers(course.id);
        students = users.filter((u) =>
          (u.roles ?? []).some((r) => r.shortname === "student")
        );
      } catch (err) {
        console.warn(`⚠️ Estudiantes curso ${course.id}:`, err.message);
        continue;
      }

      // ── Conteo de quizzes (evaluaciones realizadas) ────────────────────────
      try {
        const quizzes = await getCourseQuizzes([course.id]);
        evaluacionesRealizadas += quizzes.length;
      } catch {}

      // ── Promedio de cada estudiante en este curso ──────────────────────────
      for (const student of students) {
        try {
          const { promedio } = await computeCourseStats(student.id, course.id);
          if (promedio === null) continue;

          allCourseAverages.push(promedio);

          const nombre =
            student.fullname ||
            `${student.firstname ?? ""} ${student.lastname ?? ""}`.trim() ||
            `Usuario ${student.id}`;

          if (!studentAvgsMap.has(student.id)) {
            studentAvgsMap.set(student.id, { nombre, avgs: [] });
          }
          studentAvgsMap.get(student.id).avgs.push(promedio);
        } catch {}
      }
    }

    // ── Distribución por rangos (sobre los promedios estudiante-curso) ──────
    const ranges = [
      { rango: "0-1.9", min: 0, max: 1.9 },
      { rango: "2.0-2.9", min: 2.0, max: 2.9 },
      { rango: "3.0-3.9", min: 3.0, max: 3.9 },
      { rango: "4.0-4.5", min: 4.0, max: 4.5 },
      { rango: "4.6-5.0", min: 4.6, max: 5.0 },
    ];

    const totalCalif = allCourseAverages.length;
    const distribucion = ranges.map(({ rango, min, max }) => {
      const cantidad = allCourseAverages.filter(
        (avg) => avg >= min && avg <= max
      ).length;
      const porcentaje =
        totalCalif > 0 ? Math.round((cantidad / totalCalif) * 100) : 0;
      return { rango, cantidad, porcentaje };
    });

    // ── Promedio overall por estudiante (a través de los cursos del profesor)
    const studentOveralls = [];
    for (const [id, { nombre, avgs }] of studentAvgsMap) {
      const overall = avgs.reduce((a, b) => a + b, 0) / avgs.length;
      studentOveralls.push({
        id,
        nombre,
        promedio: Number(overall.toFixed(2)),
      });
    }

    // ── Tasa de aprobación: % estudiantes con promedio > 3.0 ────────────────
    const aprobados = studentOveralls.filter(
      (s) => s.promedio > APROBACION_MIN
    ).length;
    const tasaAprobacion =
      studentOveralls.length > 0
        ? Math.round((aprobados / studentOveralls.length) * 100)
        : 0;

    // ── Mejores estudiantes (> 4.2) y los que requieren atención (< 3.1) ────
    const mejoresEstudiantes = studentOveralls
      .filter((s) => s.promedio > MEJOR_ESTUDIANTE_MIN)
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 5);

    const requierenAtencion = studentOveralls
      .filter((s) => s.promedio < ATENCION_MAX)
      .sort((a, b) => a.promedio - b.promedio)
      .slice(0, 5);

    return res.json({
      ok: true,
      tasaAprobacion,
      evaluacionesRealizadas,
      distribucion,
      mejoresEstudiantes,
      requierenAtencion,
    });
  } catch (error) {
    console.error("❌ Error teacher evaluations:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener evaluaciones" });
  }
};
