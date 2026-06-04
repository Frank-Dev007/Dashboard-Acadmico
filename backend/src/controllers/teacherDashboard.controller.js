import {
  getUserCourses,
  getCourseEnrolledUsers,
  getCourseAssignments,
  getAssignmentSubmissions,
  getAssignmentGrades,
  getCourseQuizzes,
  getQuizUserAttempts,
} from "../services/moodle.service.js";
import { computeCourseStats } from "../services/grades.service.js";

const RISK_THRESHOLD = 3.2;
const RECENT_LIMIT = 15;

// GET /api/moodle/teacher/dashboard?userId=X
export const getTeacherDashboard = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, msg: "userId requerido" });

    const uid = parseInt(userId);
    const courses = await getUserCourses(uid);

    const uniqueStudents = new Set();
    const studentsAtRisk = new Set();
    const courseAverages = [];
    const recentActivity = [];
    const tareasPorCalificar = [];

    let entregasEsperadas = 0;
    let entregasRecibidas = 0;

    for (const course of courses) {
      const courseName = course.fullname || course.shortname;

      // ── Estudiantes ────────────────────────────────────────────────────────
      let students = [];
      try {
        const users = await getCourseEnrolledUsers(course.id);
        students = users.filter((u) =>
          (u.roles ?? []).some((r) => r.shortname === "student")
        );
        for (const s of students) uniqueStudents.add(s.id);
      } catch (err) {
        console.warn(`⚠️ Estudiantes curso ${course.id}:`, err.message);
        continue;
      }

      const studentIdSet = new Set(students.map((s) => s.id));
      const studentMap = new Map(
        students.map((s) => [
          s.id,
          s.fullname || `${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() || `Usuario ${s.id}`,
        ])
      );

      // ── Actividades del curso ──────────────────────────────────────────────
      let assignments = [];
      let quizzes = [];
      try {
        const ac = await getCourseAssignments([course.id]);
        assignments = ac[0]?.assignments ?? [];
      } catch {}
      try {
        quizzes = await getCourseQuizzes([course.id]);
      } catch {}

      const totalActivities = assignments.length + quizzes.length;
      entregasEsperadas += students.length * totalActivities;

      // ── ASSIGNMENTS: submissions + grades en bulk ──────────────────────────
      let assignSubsByAssign = new Map(); // assignmentid → [submissions]
      let gradedSet = new Set();           // "assignmentid_userid"

      if (assignments.length > 0) {
        try {
          const bulkSubs = await getAssignmentSubmissions(
            assignments.map((a) => a.id)
          );
          for (const ag of bulkSubs) {
            assignSubsByAssign.set(
              ag.assignmentid,
              (ag.submissions ?? []).filter((s) => studentIdSet.has(s.userid))
            );
          }
        } catch (err) {
          console.warn(`⚠️ Submissions curso ${course.id}:`, err.message);
        }

        try {
          const bulkGrades = await getAssignmentGrades(
            assignments.map((a) => a.id)
          );
          for (const ag of bulkGrades) {
            for (const g of ag.grades ?? []) {
              const grade = parseFloat(g.grade);
              // Moodle usa "-1" o "" para sin calificar
              if (!isNaN(grade) && grade >= 0) {
                gradedSet.add(`${ag.assignmentid}_${g.userid}`);
              }
            }
          }
        } catch (err) {
          console.warn(`⚠️ Grades curso ${course.id}:`, err.message);
        }
      }

      // Recorrer assignments para contar entregas, recientes y "por calificar"
      for (const assign of assignments) {
        const subs = assignSubsByAssign.get(assign.id) ?? [];
        let pendingGrade = 0;

        for (const sub of subs) {
          const isSubmitted =
            sub.status === "submitted" || sub.status === "graded";
          if (!isSubmitted) continue;

          entregasRecibidas++;

          // Recent activity
          const t = sub.timemodified || sub.timecreated || 0;
          if (t > 0) {
            recentActivity.push({
              tipo: "submission",
              estudiante: studentMap.get(sub.userid) || `Usuario ${sub.userid}`,
              accion: `Entregó ${assign.name}`,
              curso: courseName,
              fecha: t * 1000,
            });
          }

          // Tareas por calificar: submitted pero NO en gradedSet
          if (!gradedSet.has(`${assign.id}_${sub.userid}`)) {
            pendingGrade++;
          }
        }

        if (pendingGrade > 0) {
          tareasPorCalificar.push({
            actividad: `Calificar ${assign.name}`,
            curso: courseName,
            fecha: assign.duedate > 0 ? assign.duedate * 1000 : null,
            count: pendingGrade,
          });
        }
      }

      // ── QUIZZES + Promedios por estudiante ─────────────────────────────────
      const studentAverages = [];
      for (const student of students) {
        for (const q of quizzes) {
          try {
            const attempts = await getQuizUserAttempts(q.id, student.id);
            const finished = attempts.filter((a) => a.state === "finished");
            if (finished.length === 0) continue;

            entregasRecibidas++;
            const last = finished[finished.length - 1];
            const t = last.timefinish ?? 0;
            if (t > 0) {
              recentActivity.push({
                tipo: "quiz",
                estudiante:
                  studentMap.get(student.id) || `Usuario ${student.id}`,
                accion: `Realizó ${q.name}`,
                curso: courseName,
                fecha: t * 1000,
              });
            }
          } catch {}
        }

        try {
          const { promedio } = await computeCourseStats(student.id, course.id);
          if (promedio !== null) {
            studentAverages.push(promedio);
            if (promedio <= RISK_THRESHOLD) studentsAtRisk.add(student.id);
          }
        } catch {}
      }

      if (studentAverages.length > 0) {
        const avg =
          studentAverages.reduce((a, b) => a + b, 0) / studentAverages.length;
        courseAverages.push(avg);
      }
    }

    // Ordenar recent activity más nuevo primero, recortar al tope
    recentActivity.sort((a, b) => b.fecha - a.fecha);
    const recentTop = recentActivity.slice(0, RECENT_LIMIT);

    // Ordenar tareas por calificar por fecha (las que tienen fecha primero, asc)
    tareasPorCalificar.sort((a, b) => {
      if (a.fecha === null && b.fecha === null) return 0;
      if (a.fecha === null) return 1;
      if (b.fecha === null) return -1;
      return a.fecha - b.fecha;
    });

    const promedioGeneral =
      courseAverages.length > 0
        ? Number(
            (
              courseAverages.reduce((a, b) => a + b, 0) / courseAverages.length
            ).toFixed(2)
          )
        : null;

    const completitudPercent =
      entregasEsperadas > 0
        ? Math.round((entregasRecibidas / entregasEsperadas) * 100)
        : 0;

    return res.json({
      ok: true,
      estudiantesInscritos: uniqueStudents.size,
      entregasRecibidas,
      entregasEsperadas,
      completitudPercent,
      promedioGeneral,
      estudiantesEnRiesgo: studentsAtRisk.size,
      actividadReciente: recentTop,
      tareasPorCalificar,
    });
  } catch (error) {
    console.error("❌ Error teacher dashboard:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener dashboard del profesor" });
  }
};
