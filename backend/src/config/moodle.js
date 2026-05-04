import dotenv from "dotenv";
dotenv.config();

export const MOODLE_BASE_URL = process.env.MOODLE_URL?.replace(/\/$/, "");
export const MOODLE_SERVICE = process.env.MOODLE_SERVICE || "moodle_mobile_app";
export const MOODLE_ADMIN_TOKEN = process.env.MOODLE_ADMIN_TOKEN;

// true  → usa el correo completo como username en Moodle (ej: juan@uni.edu.co)
// false → usa solo la parte antes del @ (ej: juan)
export const MOODLE_USERNAME_FROM_EMAIL =
  process.env.MOODLE_USERNAME_FROM_EMAIL === "true";
