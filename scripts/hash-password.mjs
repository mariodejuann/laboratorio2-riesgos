// Genera el valor de ADMIN_PASSWORD_HASH sin guardar la contraseña.
// Uso:  node scripts/hash-password.mjs
// Escribe la contraseña cuando se pida (no se muestra). Copia la salida a Vercel
// y a .env.local; guarda la contraseña en Bitwarden. No pegues nada en el chat.
import { randomBytes, scryptSync } from "node:crypto";
import readline from "node:readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
rl._writeToOutput = (s) => { if (s.includes("Contraseña")) process.stdout.write(s); };
rl.question("Contraseña de administración (mín. 12 caracteres): ", (c) => {
  rl.close();
  process.stdout.write("\n");
  if (c.length < 12) { console.error("Demasiado corta."); process.exit(1); }
  const sal = randomBytes(16);
  const hash = scryptSync(c, sal, 64);
  console.log(`scrypt$${sal.toString("hex")}$${hash.toString("hex")}`);
});
