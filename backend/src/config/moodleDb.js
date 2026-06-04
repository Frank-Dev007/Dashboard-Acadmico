// Conexión directa a la base de datos de Moodle (MariaDB).
// Se usa para datos que la API REST de Moodle no expone (logs, descargas, etc.).
//
// Variables de entorno (configurar en backend/.env):
//   MOODLE_DB_HOST   = 127.0.0.1
//   MOODLE_DB_PORT   = 3306
//   MOODLE_DB_USER   = root
//   MOODLE_DB_PASS   = (vacío si no hay contraseña)
//   MOODLE_DB_NAME   = moodle
//   MOODLE_DB_PREFIX = mdl_   (prefijo de tablas, default de Moodle)
import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  host: process.env.MOODLE_DB_HOST || "127.0.0.1",
  port: parseInt(process.env.MOODLE_DB_PORT || "3306", 10),
  user: process.env.MOODLE_DB_USER || "root",
  password: process.env.MOODLE_DB_PASS || "",
  database: process.env.MOODLE_DB_NAME || "moodle",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export const TABLE_PREFIX = process.env.MOODLE_DB_PREFIX || "mdl_";

export default pool;
