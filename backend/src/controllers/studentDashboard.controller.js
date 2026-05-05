import {
  getUserCourses,
  getCourseAssignments,
} from "../services/moodle.service.js";
import { computeCourseStats } from "../services/grades.service.js";

// GET /api/moodle/student/dashboard?userId=X
export const getStudentDashboard = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ ok: false, msg: "userId requerido" });
    }

    const uid = parseInt(userId);
    const courses = await getUserCourses(uid);
    const courseIds = courses.map((c) => c.id);

    // Próximas entregas globales
    let allAssignments = [];
    try {
      const assignmentCourses = await getCourseAssignments(courseIds);
      for (const ac of assignmentCourses) {
        for (const a of ac.assignments ?? []) {
          allAssignments.push({
            assignmentId: a.id,
            courseId: ac.id,
            courseName: ac.fullname ?? "",
            name: a.name,
            duedate: a.duedate,
          });
        }
      }
    } catch (err) {
      console.warn("⚠️ assignments no disponibles:", err.message);
    }

    const cursosDetalle = [];
    let totalPending = 0;
    const allCourseAverages = [];
    const now = Math.floor(Date.now() / 1000);

    for (const course of courses) {
      try {
        const { promedio, pendingCount } = await computeCourseStats(uid, course.id);
        if (promedio !== null) allCourseAverages.push(promedio);
        totalPending += pendingCount;

        const upcoming = allAssignments
          .filter((a) => a.courseId === course.id && a.duedate > now)
          .sort((a, b) => a.duedate - b.duedate)[0];

        cursosDetalle.push({
          id: course.id,
          nombre: course.fullname || course.shortname,
          promedio: promedio !== null ? Number(promedio.toFixed(2)) : null,
          progreso: course.progress ?? null,
          proximaEntrega: upcoming
            ? { nombre: upcoming.name, fecha: upcoming.duedate * 1000 }
            : null,
        });
      } catch (err) {
        console.warn(`⚠️ Curso ${course.id}:`, err.message);
        cursosDetalle.push({
          id: course.id,
          nombre: course.fullname || course.shortname,
          promedio: null,
          progreso: course.progress ?? null,
          proximaEntrega: null,
        });
      }
    }

    const promedioGeneral =
      allCourseAverages.length > 0
        ? Number(
            (
              allCourseAverages.reduce((a, b) => a + b, 0) / allCourseAverages.length
            ).toFixed(2)
          )
        : null;

    const proximasEntregas = allAssignments
      .filter((a) => a.duedate > now)
      .sort((a, b) => a.duedate - b.duedate)
      .slice(0, 6)
      .map((a) => ({
        id: a.assignmentId,
        nombre: a.name,
        curso: a.courseName,
        fecha: a.duedate * 1000,
      }));

    return res.json({
      ok: true,
      promedioGeneral,
      cursosActivos: courses.length,
      tareasPendientes: totalPending,
      cursos: cursosDetalle,
      proximasEntregas,
    });
  } catch (error) {
    console.error("❌ Error student dashboard:", error.message);
    return res.status(500).json({ ok: false, msg: "Error al obtener dashboard" });
  }
};
