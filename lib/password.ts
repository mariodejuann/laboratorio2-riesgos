// Verificación de contraseñas con scrypt. Sin dependencias de Next.js para poder probarla.
import { scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Formato actual:  scrypt:<sal hex>:<hash hex>
 * Formato antiguo: scrypt$<sal hex>$<hash hex>
 * Se evita «$» porque Next.js lo interpreta como variable al leer .env.local
 * (borraría el hash). El formato antiguo solo funciona si la variable llega sin expandir
 * (por ejemplo, desde el panel de Vercel).
 */
export function verificarContrasena(contrasena: string, almacenado: string | undefined): boolean {
  if (!almacenado) return false;
  const separador = almacenado.startsWith("scrypt:") ? ":" : almacenado.startsWith("scrypt$") ? "$" : null;
  if (!separador) return false;
  const partes = almacenado.split(separador);
  if (partes.length !== 3) return false;
  const sal = Buffer.from(partes[1], "hex");
  const esperado = Buffer.from(partes[2], "hex");
  if (sal.length < 16 || esperado.length !== 64) return false;
  const calculado = scryptSync(contrasena, sal, 64);
  return timingSafeEqual(calculado, esperado);
}
