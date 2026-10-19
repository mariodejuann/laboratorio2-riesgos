# Fuentes oficiales

Resúmenes redactados con palabras propias a partir de los documentos oficiales.
No se reproducen ni redistribuyen los documentos completos.

Fecha de consulta de todas las fuentes: **19/10/2026**.

## 1. ENS — Real Decreto 311/2022

| Campo | Valor |
|---|---|
| Título | Real Decreto 311/2022, de 3 de mayo, por el que se regula el Esquema Nacional de Seguridad |
| Versión consultada | Texto consolidado del BOE (BOE-A-2022-7191), última modificación indicada en el documento: 06/11/2024 |
| Enlace | https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191 |
| Consulta | Copia en PDF del texto consolidado, revisada el 19/10/2026 |

**Apartados utilizados (Anexo II, Medidas de seguridad):**

| Medida | Apartado | Resumen propio |
|---|---|---|
| op.acc.4 | 4.2.4 Proceso de gestión de derechos de acceso | Todo acceso está prohibido salvo autorización expresa (op.acc.4.1) y los privilegios se reducen al mínimo imprescindible (op.acc.4.2). Solo personal competente puede conceder o alterar accesos (op.acc.4.4). |
| op.exp.2 | 4.3.2 Configuración de seguridad | Antes de entrar en operación se retiran cuentas y contraseñas estándar (op.exp.2.1), se aplica «mínima funcionalidad» (op.exp.2.2) y «seguridad por defecto» (op.exp.2.3). |
| mp.sw.1 | 5.6.1 Desarrollo de aplicaciones | El desarrollo se hace en un sistema separado del de producción, sin datos ni herramientas de desarrollo en producción ni datos de producción en desarrollo (mp.sw.1.1). Los refuerzos incluyen mínimo privilegio (R1) y preferencia por no usar datos reales en pruebas (R4). |

**Observación verificada:** en el texto consultado, mp.sw.1 figura como «n.a.» en la
categoría BÁSICA y se aplica con refuerzos en las categorías MEDIA y ALTA. En este
laboratorio se usa solo como referencia orientativa, sin asignar una categoría ENS al sistema.

**Condiciones de reutilización:** no se han consultado las condiciones de reutilización
del BOE; queda pendiente. Por ello solo se incluyen enlaces y resúmenes propios.

## 2. NIST SP 800-53 Rev. 5

| Campo | Valor |
|---|---|
| Título | Security and Privacy Controls for Information Systems and Organizations (NIST Special Publication 800-53, Revision 5) |
| Versión consultada | Revisión 5, septiembre de 2020, «Includes updates as of 12-10-2020» (coincide con la versión upd1 del enlace) |
| Enlace | https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final |
| Consulta | Copia en PDF de la publicación, revisada el 19/10/2026 |

**Controles utilizados:**

| Control | Página (numeración impresa) | Resumen propio |
|---|---|---|
| IA-5 Authenticator Management | 138 | Gestión de autenticadores (contraseñas, certificados, etc.): fortaleza suficiente, cambio de los predeterminados antes del primer uso, procedimientos para los perdidos o comprometidos y protección de su contenido frente a divulgación o modificación. |
| AC-6 Least Privilege | 36 | Principio de mínimo privilegio: solo los accesos autorizados que sean necesarios para las tareas asignadas, aplicado también a procesos del sistema. |
| SI-10 Information Input Validation | 349 | Comprobar la validez de las entradas (sintaxis y semántica: juego de caracteres, longitud, rango numérico y valores aceptables) antes de usarlas. |

## 3. Condiciones de uso de las publicaciones de NIST

| Campo | Valor |
|---|---|
| Título | Copyright, Fair Use, and Licensing Statements for SRD, Data, Software, and Technical Series Publications |
| Versión consultada | Página web vigente el 19/10/2026 |
| Enlace | https://www.nist.gov/open/copyright-fair-use-and-licensing-statements-srd-data-software-and-technical-series-publications |

**Resumen propio:** las obras escritas por empleados de NIST no tienen protección de
copyright en EE. UU.; fuera de EE. UU. NIST concede un derecho no exclusivo, perpetuo y
gratuito de reimpresión, con la cita en el formato recomendado y la frase «Republished
courtesy of the National Institute of Standards and Technology». Algunas obras pueden
tener autores externos y requerir comprobación individual.

## Referencias no verificadas

Ninguna referencia de este proyecto se ha dado por válida sin comprobarla en los
documentos anteriores. Lo que no se pudo comprobar se señala en cada documento como
«pendiente» o «sin referencia verificada».
