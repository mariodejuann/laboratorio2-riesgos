// Genera un valor aleatorio para SESSION_SECRET. Uso: node scripts/session-secret.mjs
import { randomBytes } from "node:crypto";
console.log(randomBytes(48).toString("base64url"));
