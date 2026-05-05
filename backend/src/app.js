import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import sequelize from "./config/db.js";  // DB deshabilitada temporalmente

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// // Probar conexión a MySQL
// sequelize
//   .authenticate()
//   .then(() => console.log("✅ Conectado a MySQL"))
//   .catch((err) => console.error("❌ Error al conectar MySQL:", err));

// // Importar modelos y relaciones
// import "./models/index.js";

// // Sincronizar modelos con la base de datos
// sequelize
//   .sync({ alter: true })
//   .then(() => console.log("📌 Modelos sincronizados con la BD"))
//   .catch((err) => console.error("❌ Error al sincronizar modelos:", err));

// ----------------------
// Importar rutas
// ----------------------
// import userRoutes from "./routes/user.routes.js";
// import cursoRoutes from "./routes/curso.routes.js";
// import actividadRoutes from "./routes/actividad.routes.js";
// import notaRoutes from "./routes/nota.routes.js";
// import uploadRoutes from "./routes/upload.routes.js";
// import importRoutes from "./routes/import.routes.js";
// import cursoEstudianteImportRoutes from "./routes/cursoEstudianteImport.routes.js";
// import cursoEstudiantesRoutes from "./routes/cursoEstudiante.routes.js";
// import estudianteRoutes from "./routes/estudiante.routes.js";

import authRoutes from "./routes/auth.routes.js";
import moodleRoutes from "./routes/moodle.routes.js";

// ----------------------
// Registrar rutas
// ----------------------
// app.use("/api/users", userRoutes);
// app.use("/api/cursos", cursoRoutes);
// app.use("/api/actividades", actividadRoutes);
// app.use("/api/notas", notaRoutes);
// app.use("/api/upload", uploadRoutes);
// app.use("/api/import", importRoutes);
// app.use("/api/estudiantes", estudianteRoutes);
// app.use("/api/curso-estudiante/import", cursoEstudianteImportRoutes);
// app.use("/api/curso-estudiante", cursoEstudiantesRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/moodle", moodleRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API Backend funcionando correctamente ✔️");
});

export default app;
