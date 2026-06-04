import {
  getCategories,
  getCoursesByCategory,
  getCourseEnrolledUsers,
  getCourseAssignments,
  getCourseQuizzes,
  getCourseForums,
} from "../services/moodle.service.js";
import { computeCourseStats } from "../services/grades.service.js";
import {
  countTeacherMovementsInCourse,
  countTeacherResourcesUploaded,
  getTeacherCourseSessionFrequency,
} from "../services/moodleDb.service.js";

// Estudiantes en riesgo = riesgo medio (3.0 - 3.3) + alto (≤ 2.9)
// Equivalente a "promedio ≤ 3.3"
const RISK_THRESHOLD = 3.3;

// GET /api/moodle/jefe-departamento/teachers?categoryName=X&fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
//
// Devuelve UNA fila por cada (profesor × curso) en el departamento.
// Si un profesor dicta 3 cursos, aparece 3 veces. Cada fila incluye:
//   teacherId, teacherName, teacherEmail
//   courseId, courseName
//   totalActividades    = assignments + quizzes + foros del curso (sin importar fecha)
//   promedio            = promedio de los promedios de los estudiantes en el curso
//   estudiantesEnRiesgo = estudiantes con promedio ≤ 3.3 en el curso
//   totalEstudiantes    = estudiantes inscritos en el curso
//   totalAccesos        = movimientos del profesor en el curso (BD Moodle, en el rango)
//   recursosPublicados  = nuevos materiales publicados por el profesor (BD Moodle, en el rango)
//   fromTs, toTs        = rango usado (para que el front sepa qué se aplicó)
export const getJefeDepartamentoTeachers = async (req, res) => {
  try {
    const { categoryName, fromDate, toDate } = req.query;
    if (!categoryName) {
      return res.status(400).json({ ok: false, msg: "categoryName requerido" });
    }

    // Rango de fechas: por defecto últimos 30 días
    const nowSec = Math.floor(Date.now() / 1000);
    const fromTs = fromDate
      ? Math.floor(new Date(`${fromDate}T00:00:00`).getTime() / 1000)
      : nowSec - 30 * 24 * 3600;
    const toTs = toDate
      ? Math.floor(new Date(`${toDate}T23:59:59`).getTime() / 1000)
      : nowSec;

    const target = String(categoryName).toLowerCase().trim();
    const allCategories = await getCategories();
    const category = allCategories.find(
      (c) => (c.name ?? "").toLowerCase().trim() === target
    );

    if (!category) {
      return res
        .status(404)
        .json({ ok: false, msg: `Categoría "${categoryName}" no encontrada` });
    }

    const courses = await getCoursesByCategory(category.id);
    const rows = [];

    for (const course of courses) {
      const courseName = course.fullname || course.shortname;

      // Inscritos
      let users = [];
      try {
        users = await getCourseEnrolledUsers(course.id);
      } catch (err) {
        console.warn(`⚠️ Curso ${course.id}:`, err.message);
        continue;
      }

      const teachers = users.filter((u) =>
        (u.roles ?? []).some(
          (r) => r.shortname === "editingteacher" || r.shortname === "teacher"
        )
      );
      const students = users.filter((u) =>
        (u.roles ?? []).some((r) => r.shortname === "student")
      );

      // Total de actividades del curso (assignments + quizzes + foros)
      let totalActividades = 0;
      try {
        const ac = await getCourseAssignments([course.id]);
        totalActividades += (ac[0]?.assignments ?? []).length;
      } catch {}
      try {
        const quizzes = await getCourseQuizzes([course.id]);
        totalActividades += quizzes.length;
      } catch {}
      try {
        const forums = await getCourseForums([course.id]);
        totalActividades += forums.length;
      } catch {}

      // Promedio + estudiantes en riesgo
      const studentAverages = [];
      let atRisk = 0;
      for (const s of students) {
        try {
          const { promedio } = await computeCourseStats(s.id, course.id);
          if (promedio === null) continue;
          studentAverages.push(promedio);
          if (promedio <= RISK_THRESHOLD) atRisk++;
        } catch {}
      }

      const promedio =
        studentAverages.length > 0
          ? Number(
              (
                studentAverages.reduce((a, b) => a + b, 0) /
                studentAverages.length
              ).toFixed(2)
            )
          : null;

      // Una fila por cada profesor del curso
      for (const t of teachers) {
        // Datos directos de la BD de Moodle (logs)
        let totalAccesos = 0;
        let recursosPublicados = 0;
        let frecuenciaSesion = 0;
        let totalSesiones = 0;
        let sesionesConMovimiento = 0;
        try {
          totalAccesos = await countTeacherMovementsInCourse(
            t.id,
            course.id,
            fromTs,
            toTs
          );
          recursosPublicados = await countTeacherResourcesUploaded(
            t.id,
            course.id,
            fromTs,
            toTs
          );
          const freq = await getTeacherCourseSessionFrequency(
            t.id,
            course.id,
            fromTs,
            toTs
          );
          frecuenciaSesion = freq.percentage;
          totalSesiones = freq.totalSessions;
          sesionesConMovimiento = freq.sessionsWithMovement;
        } catch (err) {
          console.warn(
            `⚠️ DB Moodle no disponible para profesor=${t.id} curso=${course.id}:`,
            err.message
          );
        }

        rows.push({
          teacherId: t.id,
          teacherName:
            t.fullname ||
            `${t.firstname ?? ""} ${t.lastname ?? ""}`.trim() ||
            `Usuario ${t.id}`,
          teacherEmail: t.email ?? "",
          courseId: course.id,
          courseName,
          totalActividades,
          promedio,
          estudiantesEnRiesgo: atRisk,
          totalEstudiantes: students.length,
          totalAccesos,
          recursosPublicados,
          frecuenciaSesion,
          totalSesiones,
          sesionesConMovimiento,
        });
      }
    }

    // Ordenar: por nombre de profesor, luego por curso
    rows.sort((a, b) => {
      const t = a.teacherName.localeCompare(b.teacherName);
      if (t !== 0) return t;
      return a.courseName.localeCompare(b.courseName);
    });

    return res.json({
      ok: true,
      categoryId: category.id,
      categoryName: category.name,
      fromTs,
      toTs,
      rows,
    });
  } catch (error) {
    console.error("❌ Error jefe-departamento teachers:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener gestión docente" });
  }
};
