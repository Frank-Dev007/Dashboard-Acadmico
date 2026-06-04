import {
  getUserCourses,
  getCourseEnrolledUsers,
} from "../services/moodle.service.js";
import { computeCourseStats } from "../services/grades.service.js";

// GET /api/moodle/student/performance?userId=X
// Devuelve por cada curso: promedio del estudiante, promedio del grupo y ranking.
export const getStudentPerformance = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, msg: "userId requerido" });

    const uid = parseInt(userId);
    const courses = await getUserCourses(uid);

    const cursosDetalle = [];
    const allAverages = [];

    for (const course of courses) {
      try {
        const { promedio: miPromedio } = await computeCourseStats(uid, course.id);
        if (miPromedio !== null) allAverages.push(miPromedio);

        // Obtener todos los estudiantes inscritos en el curso
        const enrolledUsers = await getCourseEnrolledUsers(course.id);
        const students = enrolledUsers.filter((u) =>
          (u.roles ?? []).some((r) => r.shortname === "student")
        );

        // Calcular promedio de cada estudiante en este curso
        const studentAverages = [];
        for (const s of students) {
          try {
            const { promedio } = await computeCourseStats(s.id, course.id);
            studentAverages.push({ id: s.id, promedio: promedio ?? 0 });
          } catch {
            studentAverages.push({ id: s.id, promedio: 0 });
          }
        }

        // Ordenar de mayor a menor para obtener ranking
        studentAverages.sort((a, b) => b.promedio - a.promedio);
        const miPuesto = studentAverages.findIndex((s) => s.id === uid) + 1;
        const totalEstudiantes = studentAverages.length;

        const promedioGrupo =
          totalEstudiantes > 0
            ? studentAverages.reduce((sum, s) => sum + s.promedio, 0) / totalEstudiantes
            : null;

        // Top X%: posición 1 de 10 → Top 10%
        const topPercent =
          miPuesto > 0 && totalEstudiantes > 0
            ? Math.ceil((miPuesto / totalEstudiantes) * 100)
            : null;

        cursosDetalle.push({
          id: course.id,
          nombre: course.fullname || course.shortname,
          miPromedio: miPromedio !== null ? Number(miPromedio.toFixed(2)) : null,
          promedioGrupo: promedioGrupo !== null ? Number(promedioGrupo.toFixed(2)) : null,
          miPuesto: miPuesto > 0 ? miPuesto : null,
          totalEstudiantes,
          topPercent,
        });
      } catch (err) {
        console.warn(`⚠️ Performance curso ${course.id}:`, err.message);
        cursosDetalle.push({
          id: course.id,
          nombre: course.fullname || course.shortname,
          miPromedio: null,
          promedioGrupo: null,
          miPuesto: null,
          totalEstudiantes: 0,
          topPercent: null,
        });
      }
    }

    const promedioActual =
      allAverages.length > 0
        ? Number((allAverages.reduce((a, b) => a + b, 0) / allAverages.length).toFixed(2))
        : null;

    return res.json({ ok: true, promedioActual, cursos: cursosDetalle });
  } catch (error) {
    console.error("❌ Error student performance:", error.message);
    return res.status(500).json({ ok: false, msg: "Error al obtener desempeño" });
  }
};
