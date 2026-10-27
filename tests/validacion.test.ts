import { describe, expect, it } from "vitest";
import { esUuid, validarRiesgo } from "../lib/validacion";

const valido = {
  proceso: "matrícula",
  activo: "base de datos",
  objetivo: "conservar y recuperar registros",
  condicion: "no se ha probado la restauración de las copias",
  amenaza: "fallo del almacenamiento",
  evento: "pérdida de acceso a los registros confirmados",
  consecuencia: "imposibilidad de reconstruir parte de las matrículas",
  supuesto: "",
  probabilidad: 2,
  justificacionProbabilidad: "Plausible: única instancia sin restauración probada.",
  impacto: 3,
  justificacionImpacto: "Pérdida no recuperable de registros confirmados.",
  medidaDescripcion: "Probar la restauración de la copia en un entorno separado.",
  medidaPrioridad: "alta",
  medidaResponsable: "",
  medidaEfecto: "Reducir la probabilidad de pérdida irrecuperable de registros.",
  medidaVerificacion: "Recuento de registros restaurados igual al original.",
  medidaEstado: "propuesta",
};

describe("validación en servidor", () => {
  it("acepta un riesgo completo y válido", () => {
    const r = validarRiesgo(valido);
    expect(r.ok).toBe(true);
  });

  it("rechaza probabilidad fuera de escala o como texto", () => {
    for (const p of [0, 4, 5, "2", 2.5, null]) {
      const r = validarRiesgo({ ...valido, probabilidad: p });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errores.probabilidad).toBeDefined();
    }
  });

  it("rechaza textos demasiado largos", () => {
    const r = validarRiesgo({ ...valido, proceso: "x".repeat(121) });
    expect(r.ok).toBe(false);
  });

  it("rechaza valores fuera de las listas cerradas", () => {
    expect(validarRiesgo({ ...valido, activo: "servidor de correo" }).ok).toBe(false);
    expect(validarRiesgo({ ...valido, medidaPrioridad: "urgente" }).ok).toBe(false);
    expect(validarRiesgo({ ...valido, medidaEstado: "hecha" }).ok).toBe(false);
  });

  it("rechaza campos obligatorios vacíos y tipos incorrectos", () => {
    expect(validarRiesgo({ ...valido, evento: "   " }).ok).toBe(false);
    expect(validarRiesgo({ ...valido, amenaza: 123 }).ok).toBe(false);
    expect(validarRiesgo({ ...valido, justificacionImpacto: "" }).ok).toBe(false);
  });

  it("rechaza caracteres de control", () => {
    expect(validarRiesgo({ ...valido, proceso: "matr\u0000ícula" }).ok).toBe(false);
  });

  it("rechaza cuerpos que no son objetos", () => {
    for (const x of [null, [], "texto", 5]) expect(validarRiesgo(x).ok).toBe(false);
  });

  it("ignora campos desconocidos (no se guardan)", () => {
    const r = validarRiesgo({ ...valido, puntuacion: 9, admin: true });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect("puntuacion" in r.datos).toBe(false);
      expect("admin" in r.datos).toBe(false);
    }
  });

  it("trata el HTML como texto plano (se guarda tal cual, React lo escapa al mostrar)", () => {
    const r = validarRiesgo({ ...valido, proceso: "<b>matrícula</b>" });
    expect(r.ok).toBe(true);
  });

  it("valida identificadores UUID", () => {
    expect(esUuid("3f1c7a2e-9b4d-4c1e-8a2f-1b2c3d4e5f60")).toBe(true);
    expect(esUuid("1 OR 1=1")).toBe(false);
  });
});
