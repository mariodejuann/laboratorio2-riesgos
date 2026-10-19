// Comprueba el mínimo privilegio de la cuenta de la aplicación (SEG-04) sin necesitar psql.
// Uso (PowerShell o terminal, desde la raíz del proyecto):
//   node --env-file=.env.local scripts/probar-permisos.mjs
// Usa DATABASE_URL (cuenta app_riesgos). No muestra la cadena de conexión ni la contraseña.
// Cada intento se ejecuta dentro de una transacción que se revierte: no modifica nada.
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) { console.error("Falta DATABASE_URL (usa --env-file=.env.local)."); process.exit(2); }

const client = new pg.Client({ connectionString: url });
await client.connect();
const { rows } = await client.query("select current_user as usuario");
console.log(`Conectado como: ${rows[0].usuario}`);
if (rows[0].usuario !== "app_riesgos") {
  console.error("AVISO: no es app_riesgos. Usa la cadena de la cuenta de la aplicación, no la administradora.");
}

let ok = 0, ko = 0;
async function intento(nombre, sql, debeFallar) {
  await client.query("BEGIN");
  let fallo = null;
  try { await client.query(sql); } catch (e) { fallo = e.message; }
  await client.query("ROLLBACK");
  const pasa = debeFallar ? fallo !== null : fallo === null;
  console.log(`${pasa ? "PASA " : "FALLA"}  ${nombre}${fallo ? `  →  ${fallo}` : ""}`);
  pasa ? ok++ : ko++;
}

await intento("SELECT sobre riesgos (permitido)", "select count(*) from riesgos", false);
await intento("CREATE TABLE (debe estar denegado)", "create table prueba_permisos (x int)", true);
await intento("DROP TABLE riesgos (debe estar denegado)", "drop table riesgos", true);
await intento("ALTER TABLE riesgos (debe estar denegado)", "alter table riesgos add column x int", true);
await intento("TRUNCATE riesgos (debe estar denegado)", "truncate table riesgos", true);
await intento("CREATE ROLE (debe estar denegado)", "create role intruso", true);

await client.end();
console.log(`\nResultado: ${ok} pasan, ${ko} fallan`);
process.exit(ko ? 1 : 0);
