import {
  getUserCourses,
  getCourseEnrolledUsers,
  getCourseAssignments,
  getAssignmentSubmissions,
  getCourseQuizzes,
  getQuizUserAttempts,
} from "../services/moodle.service.js";
import { computeCourseStats } from "../services/grades.service.js";

// GET /api/moodle/teacher/risk-map?userId=X
//
// Categorización de riesgo (sobre el promedio del estudiante en los cursos del profesor):
//   high   : 0.0 – 2.9
//   medium : 3.0 – 3.3
//   low    : 3.4 – 3.7
//   (>= 3.8 no aparece en el mapa de riesgo)
//
// Alertas activas según reglas:
//   "Bajo rendimiento"                    → siempre que sea high risk
//   "Entregas tardías"                    → > 3 entregas tardías (cualquier nivel de riesgo)
//   "Bajo rendimiento en evaluaciones"    → high risk + > 2 evaluaciones perdidas
//   "No entregadas"                       → > 1 actividad vencida sin entregar (cualquier nivel)
export const getTeacherRiskMap = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, msg: "userId requerido" });

    const uid = parseInt(userId);
    const courses = await getUserCourses(uid);
    const now = Math.floor(Date.now() / 1000);

    // Acumulador por estudiante a través de los cursos del profesor
    const studentMap = new Map();

    const upsertStudent = (s) => {
      if (!studentMap.has(s.id)) {
        studentMap.set(s.id, {
          id: s.id,
          nombre:
            s.fullname ||
            `${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() ||
            `Usuario ${s.id}`,
          email: s.email || "",
          avgs: [],
          lateSubmissions: 0,
          notSubmitted: 0,
          lostQuizzes: 0,
          lastActivity: 0,
        });
      }
      return studentMap.get(s.id);
    };

    for (const course of courses) {
      // ── Estudiantes ──────────────────────────────────────────────────────
      let students = [];
      try {
        const users = await getCourseEnrolledUsers(course.id);
        students = users.filter((u) =>
          (u.roles ?? []).some((r) => r.shortname === "student")
        );
        for (const s of students) upsertStudent(s);
      } catch (err) {
        console.warn(`⚠️ Estudiantes curso ${course.id}:`, err.message);
        continue;
      }

      const studentIdSet = new Set(students.map((s) => s.id));

      // ── Promedio por estudiante en este curso ────────────────────────────
      for (const s of students) {
        try {
          const { promedio } = await computeCourseStats(s.id, course.id);
          if (promedio !== null) studentMap.get(s.id).avgs.push(promedio);
        } catch {}
      }

      // ── ASSIGNMENTS: tardías y no entregadas ─────────────────────────────
      let assignments = [];
      try {
        const ac = await getCourseAssignments([course.id]);
        assignments = ac[0]?.assignments ?? [];
      } catch {}

      if (assignments.length > 0) {
        let bulk = [];
        try {
          bulk = await getAssignmentSubmissions(assignments.map((a) => a.id));
        } catch {}

        for (const ag of bulk) {
          const assign = assignments.find((a) => a.id === ag.assignmentid);
          const due = assign?.duedate ?? 0;
          const submittedUsers = new Set();

          for (const sub of ag.submissions ?? []) {
            if (!studentIdSet.has(sub.userid)) continue;
            if (sub.status !== "submitted" && sub.status !== "graded") continue;

            submittedUsers.add(sub.userid);
            const rec = studentMap.get(sub.userid);
            const t = sub.timemodified || sub.timecreated || 0;

            if (due > 0 && t > 0 && t > due) rec.lateSubmissions++;
            if (t > rec.lastActivity) rec.lastActivity = t;
          }

          // Past due sin entrega → no entregada
          if (due > 0 && now > due) {
            for (const sid of studentIdSet) {
              if (!submittedUsers.has(sid)) {
                studentMap.get(sid).notSubmitted++;
              }
            }
          }
        }
      }

      // ── QUIZZES: tardíos, no presentados y perdidos ──────────────────────
      let quizzes = [];
      try {
        quizzes = await getCourseQuizzes([course.id]);
      } catch {}

      for (const quiz of quizzes) {
        const timeclose = quiz.timeclose ?? 0;
        const quizMax = parseFloat(quiz.sumgrades) || parseFloat(quiz.grade) || 0;

        for (const s of students) {
          const rec = studentMap.get(s.id);
          try {
            const attempts = await getQuizUserAttempts(quiz.id, s.id);
            const finished = attempts.filter((a) => a.state === "finished");

            if (finished.length === 0) {
              if (timeclose > 0 && now > timeclose) {
                rec.notSubmitted++;
                rec.lostQuizzes++; // no presentado y vencido = perdido
              }
            } else {
              const last = finished[finished.length - 1];
              const t = last.timefinish ?? 0;

              if (timeclose > 0 && t > timeclose) rec.lateSubmissions++;
              if (t > rec.lastActivity) rec.lastActivity = t;

              // Verificar si "perdió" el quiz por nota (< 3.0 normalizado a /5)
              const grade = parseFloat(last.sumgrades);
              if (!isNaN(grade) && quizMax > 0) {
                const normalized = (grade / quizMax) * 5;
                if (normalized < 3.0) rec.lostQuizzes++;
              }
            }
          } catch {}
        }
      }
    }

    // ── Clasificación + alertas ────────────────────────────────────────────
    const studentsList = [];
    for (const [, rec] of studentMap) {
      if (rec.avgs.length === 0) continue;

      const overall = rec.avgs.reduce((a, b) => a + b, 0) / rec.avgs.length;
      let riskLevel = null;
      if (overall <= 2.9) riskLevel = "high";
      else if (overall >= 3.0 && overall <= 3.3) riskLevel = "medium";
      else if (overall >= 3.4 && overall <= 3.7) riskLevel = "low";
      else continue; // >= 3.8 no entra en mapa de riesgo

      const alerts = [];

      if (riskLevel === "high") {
        alerts.push("Bajo rendimiento");
      }

      if (rec.lateSubmissions > 3) {
        alerts.push("Entregas tardías");
      }

      if (riskLevel === "high" && rec.lostQuizzes > 2) {
        alerts.push("Bajo rendimiento en evaluaciones");
      }

      if (rec.notSubmitted > 1) {
        alerts.push("No entregadas");
      }

      studentsList.push({
        id: rec.id,
        nombre: rec.nombre,
        email: rec.email,
        promedio: Number(overall.toFixed(2)),
        riskLevel,
        lastActivity: rec.lastActivity > 0 ? rec.lastActivity * 1000 : null,
        alerts,
      });
    }

    // Orden: high → medium → low; dentro del nivel, peor promedio primero
    const order = { high: 0, medium: 1, low: 2 };
    studentsList.sort((a, b) => {
      const r = order[a.riskLevel] - order[b.riskLevel];
      if (r !== 0) return r;
      return a.promedio - b.promedio;
    });

    const counts = {
      high: studentsList.filter((s) => s.riskLevel === "high").length,
      medium: studentsList.filter((s) => s.riskLevel === "medium").length,
      low: studentsList.filter((s) => s.riskLevel === "low").length,
    };

    return res.json({ ok: true, counts, students: studentsList });
  } catch (error) {
    console.error("❌ Error teacher risk-map:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener mapa de riesgo" });
  }
};
