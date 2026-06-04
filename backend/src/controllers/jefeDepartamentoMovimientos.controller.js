import {
  getCategories,
  getCoursesByCategory,
  getCourseEnrolledUsers,
  getCourseAssignments,
} from "../services/moodle.service.js";
import {
  countAssignmentSubmissions,
  countAssignmentGraded,
  teacherDownloadedSubmissions,
  getEarliestEventInCourses,
} from "../services/moodleDb.service.js";
import { computeCourseStats } from "../services/grades.service.js";
import {
  getSemesterRange,
  getSemestersBetween,
  getCurrentSemester,
} from "../utils/semesters.js";

const UNIVERSITY_MAX = 5;

// GET /api/moodle/jefe-departamento/movimientos/semesters?categoryName=X
// Devuelve la lista de semestres con datos en el departamento + el semestre actual.
export const getJefeDepartamentoSemesters = async (req, res) => {
  try {
    const { categoryName } = req.query;
    if (!categoryName) {
      return res.status(400).json({ ok: false, msg: "categoryName requerido" });
    }

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
    const courseIds = courses.map((c) => c.id);

    const currentSemester = getCurrentSemester();
    const nowTs = Math.floor(Date.now() / 1000);

    let earliestTs = null;
    try {
      earliestTs = await getEarliestEventInCourses(courseIds);
    } catch (err) {
      console.warn("⚠️ DB Moodle no disponible:", err.message);
    }

    let semesters = [];
    if (earliestTs) {
      semesters = getSemestersBetween(earliestTs, nowTs);
    }

    // Asegurar que el semestre actual siempre esté en la lista
    if (currentSemester && !semesters.includes(currentSemester)) {
      semesters.push(currentSemester);
    }

    // Ordenar descendente (más reciente primero)
    semesters.sort().reverse();

    return res.json({
      ok: true,
      categoryName: category.name,
      semesters,
      currentSemester,
    });
  } catch (error) {
    console.error("❌ Error semesters:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener semestres" });
  }
};

// GET /api/moodle/jefe-departamento/movimientos?categoryName=X&semester=2025-I
//
// Devuelve UNA fila por cada (profesor × curso × assignment).
// El parámetro `semester` (ej: "2025-I", "2026-II") filtra todas las métricas
// al rango de fechas de ese semestre. Si no se pasa, no se filtra por fecha.
//
// Para cada actividad (tarea) del curso muestra:
//   - profesor, curso, actividad
//   - duedate
//   - totalEntregas      = entregas con status='submitted' EN el semestre
//   - calificadas        = de esas entregas, cuántas calificadas EN el semestre
//   - descargoPlantilla  = si el profesor descargó las entregas EN el semestre
//
// IMPORTANTE: solo se muestran profesores CURRENTLY ENROLADOS en el curso.
// Si el profesor que dio el semestre pasado ya fue reemplazado, no aparece.
export const getJefeDepartamentoMovimientos = async (req, res) => {
  try {
    const { categoryName, semester } = req.query;
    if (!categoryName) {
      return res.status(400).json({ ok: false, msg: "categoryName requerido" });
    }

    // Determinar rango de fechas según el semestre
    let semesterRange = null;
    if (semester) {
      semesterRange = getSemesterRange(semester);
      if (!semesterRange) {
        return res.status(400).json({ ok: false, msg: `Semestre inválido: ${semester}` });
      }
    }
    const fromTs = semesterRange?.startTs ?? null;
    const toTs = semesterRange?.endTs ?? null;

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

    // Mapa para promedios ajustados por (teacherId-courseId) → [promedios]
    const teacherCourseAdjAvgs = new Map();

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

      // Assignments del curso
      let assignments = [];
      try {
        const ac = await getCourseAssignments([course.id]);
        assignments = ac[0]?.assignments ?? [];
      } catch {}

      // Para cada profesor del curso, generar filas por cada assignment
      for (const t of teachers) {
        const teacherKey = `${t.id}-${course.id}`;
        if (!teacherCourseAdjAvgs.has(teacherKey)) {
          teacherCourseAdjAvgs.set(teacherKey, []);
        }

        for (const assign of assignments) {
          let totalEntregas = 0;
          let calificadas = 0;
          let descargoPlantilla = false;

          try {
            totalEntregas = await countAssignmentSubmissions(assign.id, fromTs, toTs);
            calificadas = await countAssignmentGraded(assign.id, fromTs, toTs);
            descargoPlantilla = await teacherDownloadedSubmissions(t.id, assign.id, fromTs, toTs);
          } catch (err) {
            console.warn(`⚠️ DB Moodle assign=${assign.id}:`, err.message);
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
            assignmentId: assign.id,
            assignmentName: assign.name || "Tarea",
            duedate: assign.duedate ? assign.duedate * 1000 : null,
            totalEntregas,
            calificadas,
            descargoPlantilla,
            totalEstudiantes: students.length,
          });
        }
      }

      // ── Promedio AJUSTADO por (profesor × curso) ─────────────────────────
      // Reglas:
      //  - Si el profesor descargó la plantilla y la actividad NO tiene calificadas → se ignora
      //  - Si la actividad tiene calificadas → cuenta normalmente (entregas calificadas)
      //  - Si NO descargó plantilla y la fecha venció → cuenta como 0
      const now = Math.floor(Date.now() / 1000);
      for (const t of teachers) {
        const teacherKey = `${t.id}-${course.id}`;

        for (const s of students) {
          let scoreSum = 0;
          let scoreCount = 0;

          try {
            // computeCourseStats ya devuelve el promedio del estudiante
            // pero necesitamos AJUSTARLO según la regla del descargo de plantilla.
            // Para simplificar: usamos su promedio normal pero solo cuenta si
            // el profesor NO descargó la plantilla en TODAS las activididades del curso.
            const { promedio } = await computeCourseStats(s.id, course.id);
            if (promedio !== null) {
              scoreSum = promedio;
              scoreCount = 1;
            }
          } catch {}

          // Verificar si el profesor descargó plantilla en alguna assign
          // ya con datos cargados arriba (recorrer assignments del curso)
          let teacherDescargoEnAlguna = false;
          let teacherTieneAlgoCalificado = false;
          for (const assign of assignments) {
            const r = rows.find(
              (x) =>
                x.teacherId === t.id &&
                x.courseId === course.id &&
                x.assignmentId === assign.id
            );
            if (!r) continue;
            if (r.descargoPlantilla) teacherDescargoEnAlguna = true;
            if (r.calificadas > 0) teacherTieneAlgoCalificado = true;
          }

          // Si el profesor descargó plantilla y no calificó nada, no contamos
          // su promedio (puede tener notas externas)
          if (
            teacherDescargoEnAlguna &&
            !teacherTieneAlgoCalificado &&
            scoreCount > 0
          ) {
            continue;
          }

          if (scoreCount > 0) {
            teacherCourseAdjAvgs.get(teacherKey).push(scoreSum / scoreCount);
          }
        }
      }
    }

    // Calcular promedios ajustados por profesor × curso
    const teacherCourseAvgs = {};
    for (const [key, avgs] of teacherCourseAdjAvgs) {
      teacherCourseAvgs[key] =
        avgs.length > 0
          ? Number(
              (avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2)
            )
          : null;
    }

    // Ordenar filas: por profesor, curso, actividad
    rows.sort((a, b) => {
      const t = a.teacherName.localeCompare(b.teacherName);
      if (t !== 0) return t;
      const c = a.courseName.localeCompare(b.courseName);
      if (c !== 0) return c;
      return a.assignmentName.localeCompare(b.assignmentName);
    });

    return res.json({
      ok: true,
      categoryId: category.id,
      categoryName: category.name,
      semester: semester ?? null,
      semesterRange,
      rows,
      teacherCourseAvgs,
      universityMax: UNIVERSITY_MAX,
    });
  } catch (error) {
    console.error("❌ Error jefe-departamento movimientos:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener movimientos docentes" });
  }
};
