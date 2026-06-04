// Implementación mínima de JWT (HS256) usando solo el módulo `crypto` de Node.
// Evita dependencias externas. Formato estándar: header.payload.signature
import crypto from "crypto";

const base64url = (input) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64urlJson = (obj) => base64url(JSON.stringify(obj));

const fromBase64url = (str) => {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf-8");
};

const sign = (data, secret) =>
  crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

// Genera un token. payload = objeto (ej. { sub, role, ... }); ttlSec en segundos.
export const signToken = (payload, secret, ttlSec) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: now,
    exp: now + ttlSec,
    jti: crypto.randomUUID(), // id único del token (para invalidación)
  };
  const headerB64 = base64urlJson(header);
  const payloadB64 = base64urlJson(body);
  const signature = sign(`${headerB64}.${payloadB64}`, secret);
  return `${headerB64}.${payloadB64}.${signature}`;
};

// Verifica firma y expiración. Devuelve el payload o lanza un Error.
export const verifyToken = (token, secret) => {
  if (!token || typeof token !== "string") throw new Error("Token ausente");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Token mal formado");

  const [headerB64, payloadB64, signature] = parts;
  const expected = sign(`${headerB64}.${payloadB64}`, secret);

  // Comparación en tiempo constante para evitar timing attacks
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("Firma inválida");
  }

  const payload = JSON.parse(fromBase64url(payloadB64));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now > payload.exp) {
    const err = new Error("Token expirado");
    err.expired = true;
    throw err;
  }
  return payload;
};
