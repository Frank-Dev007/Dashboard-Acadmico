import {
  getUserCourses,
  getCourseEnrolledUsers,
  getCourseAssignments,
  getAssignmentSubmissions,
  getAssignmentGrades,
  getCourseQuizzes,
  getQuizUserAttempts,
} from "../services/moodle.service.js";

// GET /api/moodle/teacher/activities?userId=X
//
// Devuelve:
//   resumen: { actividadesActivas, porCalificar, entregasATiempo, entregasTardias, sinEntregar }
//   puntualidadPorCurso: [{ curso, onTime, late, notSubmitted }]
//   actividades: [{ id, nombre, curso, tipo, fechaLimite, entregas, totalEstudiantes,
//                   porCalificar, tardias, sinEntregar }]
//
// Tipos de actividades incluidos: assignments (tareas) + quizzes (evaluaciones).
export const getTeacherActivities = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, msg: "userId requerido" });

    const uid = parseInt(userId);
    const courses = await getUserCourses(uid);
    const now = Math.floor(Date.now() / 1000);

    let actividadesActivas = 0;
    let porCalificar = 0;
    let entregasATiempo = 0;
    let entregasTardias = 0;
    let sinEntregar = 0;

    const puntualidadPorCurso = [];
    const actividades = [];

    for (const course of courses) {
      const courseName = course.fullname || course.shortname;

      // ── Estudiantes del curso ──────────────────────────────────────────────
      let students = [];
      try {
        const users = await getCourseEnrolledUsers(course.id);
        students = users.filter((u) =>
          (u.roles ?? []).some((r) => r.shortname === "student")
        );
      } catch {}
      const totalStudents = students.length;
      const studentIdSet = new Set(students.map((s) => s.id));

      let courseOnTime = 0;
      let courseLate = 0;
      let courseNotSubmitted = 0;

      // ── ASSIGNMENTS ────────────────────────────────────────────────────────
      let assignments = [];
      try {
        const ac = await getCourseAssignments([course.id]);
        assignments = ac[0]?.assignments ?? [];
      } catch {}

      const subsByAssign = new Map();
      const gradedSet = new Set();

      if (assignments.length > 0) {
        try {
          const bulk = await getAssignmentSubmissions(assignments.map((a) => a.id));
          for (const ag of bulk) {
            subsByAssign.set(
              ag.assignmentid,
              (ag.submissions ?? []).filter((s) => studentIdSet.has(s.userid))
            );
          }
        } catch {}

        try {
          const bulkG = await getAssignmentGrades(assignments.map((a) => a.id));
          for (const ag of bulkG) {
            for (const g of ag.grades ?? []) {
              const grade = parseFloat(g.grade);
              if (!isNaN(grade) && grade >= 0) {
                gradedSet.add(`${ag.assignmentid}_${g.userid}`);
              }
            }
          }
        } catch {}
      }

      for (const assign of assignments) {
        const due = assign.duedate ?? 0;
        const isActive = due === 0 || due > now;
        if (isActive) actividadesActivas++;

        const subs = subsByAssign.get(assign.id) ?? [];
        let onTime = 0;
        let late = 0;
        let pendingGrade = 0;

        for (const sub of subs) {
          if (sub.status !== "submitted" && sub.status !== "graded") continue;
          const t = sub.timemodified || sub.timecreated || 0;
          const isLate = due > 0 && t > 0 && t > due;
          if (isLate) {
            late++;
            entregasTardias++;
            courseLate++;
          } else {
            onTime++;
            entregasATiempo++;
            courseOnTime++;
          }
          if (!gradedSet.has(`${assign.id}_${sub.userid}`)) pendingGrade++;
        }

        const notSub = Math.max(0, totalStudents - (onTime + late));
        sinEntregar += notSub;
        courseNotSubmitted += notSub;
        porCalificar += pendingGrade;

        actividades.push({
          id: `assign-${assign.id}`,
          nombre: assign.name || "Tarea",
          curso: courseName,
          tipo: "assignment",
          fechaLimite: due > 0 ? due * 1000 : null,
          entregas: onTime + late,
          totalEstudiantes: totalStudents,
          porCalificar: pendingGrade,
          tardias: late,
          sinEntregar: notSub,
        });
      }

      // ── QUIZZES ────────────────────────────────────────────────────────────
      let quizzes = [];
      try {
        quizzes = await getCourseQuizzes([course.id]);
      } catch {}

      for (const quiz of quizzes) {
        const timeclose = quiz.timeclose ?? 0;
        const isActive = timeclose === 0 || timeclose > now;
        if (isActive) actividadesActivas++;

        let onTime = 0;
        let late = 0;

        for (const student of students) {
          try {
            const attempts = await getQuizUserAttempts(quiz.id, student.id);
            const finished = attempts.filter((a) => a.state === "finished");
            if (finished.length === 0) continue;
            const last = finished[finished.length - 1];
            const t = last.timefinish ?? 0;
            const isLate = timeclose > 0 && t > 0 && t > timeclose;
            if (isLate) {
              late++;
              entregasTardias++;
              courseLate++;
            } else {
              onTime++;
              entregasATiempo++;
              courseOnTime++;
            }
          } catch {}
        }

        const notSub = Math.max(0, totalStudents - (onTime + late));
        sinEntregar += notSub;
        courseNotSubmitted += notSub;

        actividades.push({
          id: `quiz-${quiz.id}`,
          nombre: quiz.name || "Evaluación",
          curso: courseName,
          tipo: "quiz",
          fechaLimite: timeclose > 0 ? timeclose * 1000 : null,
          entregas: onTime + late,
          totalEstudiantes: totalStudents,
          porCalificar: 0, // los quizzes se auto-califican
          tardias: late,
          sinEntregar: notSub,
        });
      }

      if (assignments.length > 0 || quizzes.length > 0) {
        puntualidadPorCurso.push({
          curso: courseName,
          onTime: courseOnTime,
          late: courseLate,
          notSubmitted: courseNotSubmitted,
        });
      }
    }

    // Ordenar actividades por fecha límite (las activas primero, las sin fecha al final)
    actividades.sort((a, b) => {
      if (a.fechaLimite === null && b.fechaLimite === null) return 0;
      if (a.fechaLimite === null) return 1;
      if (b.fechaLimite === null) return -1;
      return a.fechaLimite - b.fechaLimite;
    });

    return res.json({
      ok: true,
      resumen: {
        actividadesActivas,
        porCalificar,
        entregasATiempo,
        entregasTardias,
        sinEntregar,
      },
      puntualidadPorCurso,
      actividades,
    });
  } catch (error) {
    console.error("❌ Error teacher activities:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener actividades del profesor" });
  }
};
