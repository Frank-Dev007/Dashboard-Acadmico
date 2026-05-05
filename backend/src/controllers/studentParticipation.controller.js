import {
  getUserCourses,
  getCourseAssignments,
  getAssignmentStatus,
  getCourseQuizzes,
  getQuizUserAttempts,
  getUserGradeItemsInCourse,
} from "../services/moodle.service.js";

// GET /api/moodle/student/participation?userId=X
//
// Estrategia por tipo de actividad:
//   - Assignments : getCourseAssignments + getAssignmentStatus  → detecta entregas y tardías
//   - Quizzes     : getCourseQuizzes + getQuizUserAttempts      → detecta intentos terminados
//   - Foros       : grade items con itemmodule="forum"          → se cuenta si hay graderaw
//                   O si gradedatesubmitted / gradedategraded existe (participó pero no calificado aún)
export const getStudentParticipation = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, msg: "userId requerido" });

    const uid = parseInt(userId);
    const courses = await getUserCourses(uid);

    const cursosDetalle = [];
    const timelineItems = [];

    let totalEntregas = 0;
    let totalForos = 0;
    let entregasATiempo = 0;
    let entregasTardias = 0;

    for (const course of courses) {
      const courseName = course.fullname || course.shortname;

      let courseEntregas = 0;
      let courseForos = 0;
      let courseEvaluaciones = 0;
      let courseCompleted = 0;
      let courseTotalActividades = 0;

      // ── ASSIGNMENTS ────────────────────────────────────────────────────────
      try {
        const assignCourses = await getCourseAssignments([course.id]);
        const assignments = assignCourses[0]?.assignments ?? [];
        courseTotalActividades += assignments.length;

        for (const assign of assignments) {
          try {
            const statusRes = await getAssignmentStatus(assign.id, uid);
            const submission = statusRes?.lastattempt?.submission;

            // "submitted" o "graded" significan que el estudiante entregó
            const submitted =
              submission?.status === "submitted" ||
              submission?.status === "graded";

            if (!submitted) continue;

            courseEntregas++;
            totalEntregas++;
            courseCompleted++;

            const submitTime =
              submission.timemodified || submission.timecreated || 0;
            const duedate = assign.duedate ?? 0;
            const isLate =
              duedate > 0 && submitTime > 0 && submitTime > duedate;

            if (isLate) entregasTardias++;
            else entregasATiempo++;

            if (submitTime > 0) {
              timelineItems.push({
                tipo: "assignment",
                titulo: assign.name || "Tarea",
                curso: courseName,
                fecha: submitTime * 1000,
                estado: isLate ? "late" : "completed",
              });
            }
          } catch {
            // La assignment puede no tener entrega de este usuario — normal
          }
        }
      } catch (err) {
        console.warn(`⚠️ Assignments curso ${course.id}:`, err.message);
      }

      // ── QUIZZES ────────────────────────────────────────────────────────────
      try {
        const quizzes = await getCourseQuizzes([course.id]);
        courseTotalActividades += quizzes.length;

        for (const quiz of quizzes) {
          try {
            const attempts = await getQuizUserAttempts(quiz.id, uid);
            // Un intento está terminado si state === "finished"
            const finished = attempts.filter((a) => a.state === "finished");

            if (finished.length === 0) continue;

            courseEvaluaciones++;
            courseCompleted++;

            // Último intento terminado
            const last = finished[finished.length - 1];
            const finishTime = last.timefinish ?? 0;

            if (finishTime > 0) {
              timelineItems.push({
                tipo: "quiz",
                titulo: quiz.name || "Evaluación",
                curso: courseName,
                fecha: finishTime * 1000,
                estado: "completed",
              });
            }
          } catch {
            // El quiz puede no tener intentos — normal
          }
        }
      } catch (err) {
        console.warn(`⚠️ Quizzes curso ${course.id}:`, err.message);
      }

      // ── FOROS ──────────────────────────────────────────────────────────────
      // Los foros pueden o no tener calificación.
      // Usamos grade items con itemmodule="forum" y contamos si:
      //   1. graderaw != null  (calificado por el profesor)
      //   2. gradedatesubmitted > 0 (Moodle registró la participación)
      //   3. gradedategraded > 0   (el profesor lo calificó, aunque graderaw sea 0)
      try {
        const items = await getUserGradeItemsInCourse(uid, course.id);
        const forumItems = items.filter(
          (it) => it.itemtype === "mod" && it.itemmodule === "forum"
        );
        courseTotalActividades += forumItems.length;

        for (const item of forumItems) {
          const graderaw = parseFloat(item.graderaw);
          const hasGrade = !isNaN(graderaw);
          const dateSubmitted = item.gradedatesubmitted ?? 0;
          const dateGraded = item.gradedategraded ?? 0;

          const participated = hasGrade || dateSubmitted > 0 || dateGraded > 0;
          if (!participated) continue;

          courseForos++;
          totalForos++;
          courseCompleted++;

          const dateProxy = dateSubmitted || dateGraded;
          if (dateProxy > 0) {
            timelineItems.push({
              tipo: "forum",
              titulo: item.itemname || "Foro",
              curso: courseName,
              fecha: dateProxy * 1000,
              estado: "completed",
            });
          }
        }
      } catch (err) {
        console.warn(`⚠️ Foros curso ${course.id}:`, err.message);
      }

      cursosDetalle.push({
        id: course.id,
        nombre: courseName,
        entregas: courseEntregas,
        foros: courseForos,
        evaluaciones: courseEvaluaciones,
        completadas: courseCompleted,
        totalActividades: courseTotalActividades,
      });
    }

    timelineItems.sort((a, b) => b.fecha - a.fecha);

    return res.json({
      ok: true,
      totalEntregas,
      totalForos,
      entregasATiempo,
      entregasTardias,
      cursos: cursosDetalle,
      timeline: timelineItems.slice(0, 20),
    });
  } catch (error) {
    console.error("❌ Error participation:", error.message);
    return res.status(500).json({ ok: false, msg: "Error al obtener participación" });
  }
};
