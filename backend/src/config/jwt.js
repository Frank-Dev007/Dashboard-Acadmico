// Configuración de JWT. Los secretos deben venir de variables de entorno en
// producción. Aquí hay defaults para desarrollo.
import "dotenv/config";

export const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "dev_access_secret_cambia_esto_en_produccion";
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_cambia_esto_en_produccion";

// Duración de los tokens (en segundos)
export const ACCESS_TTL_SEC = 60 * 60;            // 1 hora
export const REFRESH_TTL_SEC = 7 * 24 * 60 * 60;  // 7 días
