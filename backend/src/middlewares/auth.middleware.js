import { verifyToken } from "../utils/jwt.js";
import { JWT_ACCESS_SECRET } from "../config/jwt.js";

// Middleware: exige un access token válido en el header Authorization: Bearer <token>.
// Adjunta el payload decodificado a req.user (incluye sub = userId y role).
export const verifyJWT = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res
      .status(401)
      .json({ ok: false, msg: "No autenticado: falta el token", code: "NO_TOKEN" });
  }

  try {
    const payload = verifyToken(token, JWT_ACCESS_SECRET);
    req.user = payload; // { sub, role, username, nombre, ... }
    next();
  } catch (err) {
    return res.status(401).json({
      ok: false,
      msg: err.expired ? "Token expirado" : "Token inválido",
      code: err.expired ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
    });
  }
};

// Middleware opcional: exige que el rol del usuario esté en la lista permitida.
// Uso: router.get('/x', verifyJWT, requireRole('docente','admin'), handler)
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ ok: false, msg: "No tienes permiso para este recurso", code: "FORBIDDEN" });
    }
    next();
  };
};
