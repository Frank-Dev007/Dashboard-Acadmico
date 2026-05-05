import {
  getUserCourses,
  getCourseEnrolledUsers,
} from "../services/moodle.service.js";
import { computeCourseStats } from "../services/grades.service.js";

// GET /api/moodle/stats?userId=4&role=docente|estudiante
export const getProfileStats = async (req, res) => {
  try {
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({ ok: false, msg: "userId y role son requeridos" });
    }

    const uid = parseInt(userId);
    const courses = await getUserCourses(uid);
    const cursosActivos = courses.length;

    // ── DOCENTE ────────────────────────────────────────────────────────────
    if (role === "docente") {
      let totalEstudiantes = 0;
      const courseAverages = [];

      for (const course of courses) {
        try {
          const users = await getCourseEnrolledUsers(course.id);
          const students = users.filter((u) =>
            (u.roles ?? []).some((r) => r.shortname === "student")
          );
          totalEstudiantes += students.length;

          // Promedio del curso = promedio de promedios de cada estudiante
          const studentAverages = [];
          for (const s of students) {
            try {
              const { promedio } = await computeCourseStats(s.id, course.id);
              if (promedio !== null) studentAverages.push(promedio);
            } catch {}
          }
          if (studentAverages.length > 0) {
            const avg =
              studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length;
            courseAverages.push(avg);
          }
        } catch {
          totalEstudiantes += course.enrolledusercount ?? 0;
        }
      }

      const promedioCurso =
        courseAverages.length > 0
          ? (courseAverages.reduce((a, b) => a + b, 0) / courseAverages.length).toFixed(2)
          : null;

      return res.json({
        ok: true,
        cursosActivos,
        totalEstudiantes,
        promedioCurso,
        satisfaccion: null,
      });
    }

    // ── ESTUDIANTE ─────────────────────────────────────────────────────────
    if (role === "estudiante") {
      const courseAverages = [];

      for (const course of courses) {
        try {
          const { promedio } = await computeCourseStats(uid, course.id);
          if (promedio !== null) courseAverages.push(promedio);
        } catch {}
      }

      const promedioGeneral =
        courseAverages.length > 0
          ? (courseAverages.reduce((a, b) => a + b, 0) / courseAverages.length).toFixed(2)
          : null;

      return res.json({
        ok: true,
        cursosActivos,
        promedioGeneral,
        creditosCompletados: null,
        posicionGrupo: null,
      });
    }

    return res.json({ ok: true, cursosActivos });
  } catch (error) {
    console.error("❌ Error stats:", error.message);
    return res.status(500).json({ ok: false, msg: "Error al obtener estadísticas" });
  }
};
