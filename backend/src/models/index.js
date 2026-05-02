import User from "./User.js";
import Curso from "./Curso.js";
import Actividad from "./Actividad.js";
import Nota from "./Nota.js";
import CursoEstudiante from "./CursoEstudiante.js";

// ======================================================
// RELACIONES ENTRE MODELOS
// ======================================================

// 1. Un profesor tiene muchos cursos
User.hasMany(Curso, { 
  foreignKey: "id_profesor",
  as: "cursosImpartidos"
});

Curso.belongsTo(User, { 
  foreignKey: "id_profesor",
  as: "profesor"   // ← ALIAS NECESARIO PARA TU DASHBOARD
});

// 2. Un curso tiene muchas actividades
Curso.hasMany(Actividad, { foreignKey: "id_curso" });
Actividad.belongsTo(Curso, { foreignKey: "id_curso" });

// 3. Una actividad tiene muchas notas
Actividad.hasMany(Nota, { foreignKey: "id_actividad" });
Nota.belongsTo(Actividad, { foreignKey: "id_actividad" });

// 4. Un estudiante tiene muchas notas
User.hasMany(Nota, { foreignKey: "id_estudiante" });
Nota.belongsTo(User, { foreignKey: "id_estudiante" });

// 5. Muchos estudiantes están en muchos cursos
Curso.belongsToMany(User, {
  through: CursoEstudiante,
  foreignKey: "id_curso",
  as: "estudiantes" // opcional pero recomendado
});

User.belongsToMany(Curso, {
  through: CursoEstudiante,
  foreignKey: "id_estudiante",
  as: "cursos" // opcional pero recomendado
});

// ======================================================
// EXPORTAR TODO
// ======================================================
export {
  User,
  Curso,
  Actividad,
  Nota,
  CursoEstudiante
};
