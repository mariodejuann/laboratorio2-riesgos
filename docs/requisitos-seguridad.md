# Requisitos de seguridad (adaptación didáctica)

> Esta selección es una **adaptación didáctica** para el laboratorio. **No acredita
> conformidad completa** con el ENS ni con NIST SP 800-53 Rev. 5.

Las referencias son **orientativas** (ENS: op.acc.4, op.exp.2, mp.sw.1; NIST: IA-5, AC-6,
SI-10) y proceden de `docs/fuentes.md`. Cuando un requisito no se deriva claramente de una
referencia verificada, se indica como **requisito propio del laboratorio**.

Estados posibles: pendiente, implementado, verificado. Todos partieron de **pendiente**; la columna «Estado actual» recoge lo comprobado.

## Resumen

| ID | Requisito | Origen | Estado inicial | Estado actual |
|---|---|---|---|---|
| SEG-01 | Secretos fuera del código y del historial de Git | Derivado orientativo (NIST IA-5) | Pendiente | Verificado en local |
| SEG-02 | Secretos de servidor ausentes del navegador, respuestas y registros | Derivado orientativo (NIST IA-5) | Pendiente | Verificado en local |
| SEG-03 | Autorización en el servidor antes de modificar datos | Derivado orientativo (ENS op.acc.4; NIST AC-6) | Pendiente | Verificado en local; repetir en Preview |
| SEG-04 | Mínimo privilegio para la cuenta de base de datos | Derivado orientativo (ENS op.acc.4, mp.sw.1; NIST AC-6) | Pendiente | Verificado en BD local de prueba; repetir en el proveedor |
| SEG-05 | Validación de entradas en el servidor | Derivado orientativo (NIST SI-10) | Pendiente | Verificado en local |
| SEG-06 | Separación de configuración y datos entre desarrollo, Preview y producción | Derivado orientativo (ENS mp.sw.1) | Pendiente | Pendiente: requiere configurar variables por entorno en Vercel |
| SEG-07 | Errores sin credenciales ni detalles internos sensibles | Propio del laboratorio | Pendiente | Verificado en local |
| SEG-08 | Trazabilidad entre cambios, pruebas y despliegues | Propio del laboratorio | Pendiente | Implementado; se completa al registrar el despliegue |

Evidencias: `docs/pruebas.md`. «Verificado en local» significa probado contra la aplicación y
una base de datos PostgreSQL local; debe repetirse en Preview para la entrega.

## SEG-01 · Secretos fuera del código y del historial de Git

- **Finalidad:** evitar que una credencial quede expuesta a quien lea el repositorio.
- **Referencia concreta:** NIST IA-5 (proteger el contenido de los autenticadores frente a divulgación y gestionar los comprometidos). La relación es orientativa; IA-5 trata autenticadores en general, no repositorios de código.
- **Implementación prevista:** `.env*` en `.gitignore` salvo `.env.example` sin valores; secretos en Bitwarden y en variables de entorno de Vercel.
- **Prueba de aceptación:** buscar en archivos e historial (`git log -p`) valores con aspecto de credencial y comprobar que `git ls-files` no incluye ningún `.env`.
- **Evidencia esperada:** salida de la búsqueda sin coincidencias y listado de archivos versionados.
- **Estado inicial:** pendiente.

## SEG-02 · Secretos de servidor ausentes del navegador, respuestas y registros

- **Finalidad:** que el cliente nunca reciba cadenas de conexión, claves de sesión ni hashes.
- **Referencia concreta:** NIST IA-5 (protección del contenido de los autenticadores). Orientativa. No se ha verificado una medida ENS equivalente en la selección.
- **Implementación prevista:** variables sin prefijo `NEXT_PUBLIC_`, uso solo en código de servidor, y registros que nunca imprimen valores de entorno.
- **Prueba de aceptación:** buscar los valores de los secretos en la compilación del cliente (`.next/static`) y en las respuestas de la API.
- **Evidencia esperada:** resultado de la búsqueda sin coincidencias y capturas de respuestas de la API sin datos sensibles.
- **Estado inicial:** pendiente.

## SEG-03 · Autorización en el servidor antes de modificar datos

- **Finalidad:** que solo una sesión autorizada pueda crear, editar o borrar riesgos.
- **Referencia concreta:** ENS op.acc.4.1 (todo acceso prohibido salvo autorización expresa) y NIST AC-6 (solo accesos autorizados necesarios).
- **Implementación:** perfil único «gestor». Se eligió `node:crypto` (integrado en Node.js) en lugar de una biblioteca externa por las siguientes razones: (1) no introduce dependencias de terceros ni riesgo de cadena de suministro; (2) `scryptSync` para el hash de contraseña y HMAC-SHA256 para la firma de sesión son primitivos auditados y bien documentados; (3) para un único usuario con contraseña almacenada como hash en variable de entorno, la implementación resultante es más pequeña y legible que cualquier biblioteca de sesiones. La cookie tiene los atributos `HttpOnly`, `Secure` (en producción) y `SameSite=strict`. Cada operación de escritura comprueba la cookie en el servidor, independientemente de lo que muestre la interfaz.
- **Prueba de aceptación:** `POST`, `PUT` y `DELETE` sin sesión devuelven 401 y no cambian datos; con sesión válida funcionan.
- **Evidencia esperada:** resultado de las pruebas de escritura no autorizada (`docs/pruebas.md`).
- **Estado actual:** Verificado en local; repetir en Preview.

## SEG-04 · Mínimo privilegio para la cuenta de base de datos

- **Finalidad:** limitar el daño si la aplicación o su credencial se ven comprometidas.
- **Referencia concreta:** ENS op.acc.4.2 (privilegios mínimos imprescindibles), ENS mp.sw.1.r1.1 (aplicaciones con los privilegios indispensables) y NIST AC-6.
- **Implementación prevista:** una cuenta de aplicación con `SELECT, INSERT, UPDATE, DELETE` solo sobre la tabla `riesgos`, sin permisos de esquema (`db/permisos.sql`), distinta de la cuenta administradora que solo se usa para migrar.
- **Prueba de aceptación:** con la cuenta de aplicación, `CREATE TABLE`, `DROP TABLE`, `ALTER TABLE`, `TRUNCATE` y `CREATE ROLE` fallan por permisos (`node --env-file=.env.local scripts/probar-permisos.mjs`, que revierte cada intento y no modifica datos).
- **Evidencia esperada:** mensaje de permiso denegado.
- **Estado inicial:** pendiente.

## SEG-05 · Validación de entradas en el servidor

- **Finalidad:** aceptar únicamente datos con el tipo, longitud y valores permitidos.
- **Referencia concreta:** NIST SI-10 (validar sintaxis y semántica: longitud, rango numérico, valores aceptables).
- **Implementación prevista:** validación en el servidor de cada campo y recálculo de la puntuación; consultas parametrizadas. La validación del navegador es solo una ayuda.
- **Prueba de aceptación:** peticiones directas a la API con probabilidad 5, texto de longitud excesiva y valores fuera de lista son rechazadas con 400.
- **Evidencia esperada:** resultados de las pruebas automáticas y manuales.
- **Estado inicial:** pendiente.

## SEG-06 · Separación de configuración y datos entre entornos

- **Finalidad:** que desarrollo, Preview y producción no compartan credenciales ni datos.
- **Referencia concreta:** ENS mp.sw.1.1 (desarrollo en sistema separado del de producción, sin datos de producción en desarrollo). Orientativa; en el ENS aplica según categoría.
- **Implementación prevista:** variables distintas por entorno en Vercel (Development, Preview, Production) y una base o esquema distinto para Preview.
- **Prueba de aceptación:** revisar que cada entorno apunta a una `DATABASE_URL` distinta y que los datos creados en Preview no aparecen en producción.
- **Evidencia esperada:** captura de la configuración de Vercel con los valores ocultos.
- **Estado inicial:** pendiente.

## SEG-07 · Errores sin credenciales ni detalles internos sensibles

- **Finalidad:** no dar pistas a un atacante ni filtrar secretos.
- **Referencia concreta:** requisito propio del laboratorio, sin referencia verificada en la selección.
- **Implementación prevista:** respuestas públicas con mensajes genéricos; el detalle va solo al registro del servidor, sin valores secretos.
- **Prueba de aceptación:** provocar un fallo de base de datos y comprobar que la respuesta no contiene cadena de conexión, SQL ni traza.
- **Evidencia esperada:** respuesta de error de la API.
- **Estado inicial:** pendiente.

## SEG-08 · Trazabilidad entre cambios, pruebas y despliegues

- **Finalidad:** saber qué commit se desplegó y qué pruebas lo respaldan.
- **Referencia concreta:** requisito propio del laboratorio, sin referencia verificada en la selección.
- **Implementación prevista:** commits con mensajes descriptivos, `docs/pruebas.md` con resultados y `docs/despliegue.md` con URL, fecha y commit de origen.
- **Prueba de aceptación:** el commit registrado en `docs/despliegue.md` existe en el historial y coincide con la entrega.
- **Evidencia esperada:** identificador del commit y URL del despliegue.
- **Estado inicial:** pendiente.

## Decisiones pendientes

- Confirmar con el profesor qué referencias se aceptan para SEG-07 y SEG-08.
- Consultar las condiciones de reutilización del BOE (ver `docs/fuentes.md`).
