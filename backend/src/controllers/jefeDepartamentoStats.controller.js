import {
  getCategories,
  getCoursesByCategory,
  getCourseEnrolledUsers,
} from "../services/moodle.service.js";
import { computeCourseStats } from "../services/grades.service.js";

// GET /api/moodle/jefe-departamento/stats?categoryName=Ingenieria%20de%20sistemas
//
// Devuelve estadísticas del departamento (categoría de Moodle):
//   - totalCursos           : total de cursos en la categoría
//   - cursosActivos         : cursos con visible !== 0
//   - totalProfesores       : profesores únicos (roles editingteacher / teacher)
//   - totalEstudiantes      : estudiantes únicos (rol student)
//   - promedioInstitucional : promedio de los promedios estudiante-curso
//   - tasaAprobacion        : % estudiantes con promedio overall > 3.0
//   - estudiantesEnRiesgo   : estudiantes con promedio overall < 3.0
//   - courses               : [{ id, nombre, shortname, estudiantes, promedio }]
export const getJefeDepartamentoStats = async (req, res) => {
  try {
    const { categoryName } = req.query;
    if (!categoryName) {
      return res.status(400).json({ ok: false, msg: "categoryName requerido" });
    }

    const target = String(categoryName).toLowerCase().trim();

    // Buscar la categoría por nombre
    const allCategories = await getCategories();
    const category = allCategories.find(
      (c) => (c.name ?? "").toLowerCase().trim() === target
    );

    if (!category) {
      console.warn(
        `⚠️ Categoría "${categoryName}" no encontrada. Disponibles:`,
        allCategories.map((c) => c.name)
      );
      return res
        .status(404)
        .json({ ok: false, msg: `Categoría "${categoryName}" no encontrada` });
    }

    // Cursos de la categoría
    const courses = await getCoursesByCategory(category.id);
    const activeCourses = courses.filter((c) => c.visible !== 0);

    // Acumuladores
    const teacherIds = new Set();
    const studentIds = new Set();
    const allAverages = [];                  // promedio por cada (estudiante, curso)
    const studentAvgsMap = new Map();        // studentId → [avgs]
    const courseAvgsMap = new Map();         // courseId → [avgs]
    const courseStudentsMap = new Map();     // courseId → studentCount

    for (const course of courses) {
      let users = [];
      try {
        users = await getCourseEnrolledUsers(course.id);
      } catch (err) {
        console.warn(`⚠️ Curso ${course.id}:`, err.message);
        continue;
      }

      // Clasificar por rol y acumular IDs únicos
      const studentsInCourse = [];
      for (const u of users) {
        const roles = u.roles ?? [];
        const isTeacher = roles.some(
          (r) => r.shortname === "editingteacher" || r.shortname === "teacher"
        );
        const isStudent = roles.some((r) => r.shortname === "student");

        if (isTeacher) teacherIds.add(u.id);
        if (isStudent) {
          studentIds.add(u.id);
          studentsInCourse.push(u);
        }
      }

      courseStudentsMap.set(course.id, studentsInCourse.length);

      // Promedio de cada estudiante en este curso
      for (const s of studentsInCourse) {
        try {
          const { promedio } = await computeCourseStats(s.id, course.id);
          if (promedio !== null) {
            allAverages.push(promedio);
            if (!studentAvgsMap.has(s.id)) studentAvgsMap.set(s.id, []);
            studentAvgsMap.get(s.id).push(promedio);

            if (!courseAvgsMap.has(course.id)) courseAvgsMap.set(course.id, []);
            courseAvgsMap.get(course.id).push(promedio);
          }
        } catch {}
      }
    }

    // Detalle por curso para el dashboard
    const coursesDetail = courses.map((c) => {
      const avgs = courseAvgsMap.get(c.id) ?? [];
      return {
        id: c.id,
        nombre: c.fullname || c.shortname,
        shortname: c.shortname || c.fullname,
        visible: c.visible !== 0,
        estudiantes: courseStudentsMap.get(c.id) ?? 0,
        promedio:
          avgs.length > 0
            ? Number((avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2))
            : null,
      };
    });

    const promedioInstitucional =
      allAverages.length > 0
        ? Number(
            (
              allAverages.reduce((a, b) => a + b, 0) / allAverages.length
            ).toFixed(2)
          )
        : null;

    // Tasa de aprobación y estudiantes en riesgo (sobre el promedio overall por estudiante)
    let aprobados = 0;
    let estudiantesEnRiesgo = 0;
    let estudiantesConPromedio = 0;

    for (const [, avgs] of studentAvgsMap) {
      if (avgs.length === 0) continue;
      const overall = avgs.reduce((a, b) => a + b, 0) / avgs.length;
      estudiantesConPromedio++;
      if (overall > 3.0) aprobados++;
      if (overall < 3.0) estudiantesEnRiesgo++;
    }

    const tasaAprobacion =
      estudiantesConPromedio > 0
        ? Math.round((aprobados / estudiantesConPromedio) * 100)
        : 0;

    return res.json({
      ok: true,
      categoryId: category.id,
      categoryName: category.name,
      totalCursos: courses.length,
      cursosActivos: activeCourses.length,
      totalProfesores: teacherIds.size,
      totalEstudiantes: studentIds.size,
      promedioInstitucional,
      tasaAprobacion,
      estudiantesEnRiesgo,
      courses: coursesDetail,
    });
  } catch (error) {
    console.error("❌ Error jefe-departamento stats:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener estadísticas del departamento" });
  }
};
