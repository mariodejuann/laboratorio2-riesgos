"use client";

import { useState } from "react";
import type { Riesgo } from "@/lib/db";
import { EVALUACION_VACIA, type Evaluacion } from "@/lib/evaluacion";
import { IMPACTO, PROBABILIDAD } from "@/lib/escalas";
import {
  ACTIVOS,
  EJEMPLO,
  FORMULACION_VACIA,
  LIMITE_CORTO,
  LIMITE_LARGO,
  OBJETIVOS,
  camposFaltantes,
  partesFrase,
  type Formulacion,
} from "@/lib/formulacion";
import { ESTADOS_MEDIDA, MEDIDA_VACIA, PRIORIDADES, type Medida } from "@/lib/medida";
import { clasificar, esValor, puntuacion } from "@/lib/scoring";

type Props = {
  autenticado: boolean;
  editando: Riesgo | null;
  onGuardado: (r: Riesgo) => void;
  onCancelar: () => void;
};

function Contador({ valor, limite }: { valor: string; limite: number }) {
  return <div className="counter" aria-hidden="true">{valor.length}/{limite}</div>;
}

const fs = { border: 0, padding: 0, margin: 0 } as const;

export default function FormularioRiesgo({ autenticado, editando, onGuardado, onCancelar }: Props) {
  const [f, setF] = useState<Formulacion>(() =>
    editando
      ? {
          proceso: editando.proceso, activo: editando.activo, objetivo: editando.objetivo,
          condicion: editando.condicion, amenaza: editando.amenaza, evento: editando.evento,
          consecuencia: editando.consecuencia, supuesto: editando.supuesto,
        }
      : FORMULACION_VACIA,
  );
  const [ev, setEv] = useState<Evaluacion>(() =>
    editando
      ? {
          probabilidad: String(editando.probabilidad),
          justificacionProbabilidad: editando.justificacionProbabilidad,
          impacto: String(editando.impacto),
          justificacionImpacto: editando.justificacionImpacto,
        }
      : EVALUACION_VACIA,
  );
  const [m, setM] = useState<Medida>(() =>
    editando
      ? {
          descripcion: editando.medidaDescripcion, prioridad: editando.medidaPrioridad,
          responsable: editando.medidaResponsable, verificacion: editando.medidaVerificacion,
          estado: editando.medidaEstado,
        }
      : MEDIDA_VACIA,
  );
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const setForm = (clave: keyof Formulacion) => (e: { target: { value: string } }) =>
    setF((prev) => ({ ...prev, [clave]: e.target.value }));
  const setE = (clave: keyof Evaluacion) => (e: { target: { value: string } }) =>
    setEv((prev) => ({ ...prev, [clave]: e.target.value }));
  const setMed = (clave: keyof Medida) => (e: { target: { value: string } }) =>
    setM((prev) => ({ ...prev, [clave]: e.target.value }));

  const limpiar = () => {
    setF(FORMULACION_VACIA); setEv(EVALUACION_VACIA); setM(MEDIDA_VACIA);
    setErrores({}); setMensaje("");
  };

  const faltan = camposFaltantes(f);
  const partes = partesFrase(f);
  const p = Number(ev.probabilidad);
  const i = Number(ev.impacto);
  const calculo = esValor(p) && esValor(i) ? { puntos: puntuacion(p, i), nivel: clasificar(puntuacion(p, i)) } : null;
  const faltaJustificacion = ev.justificacionProbabilidad.trim() === "" || ev.justificacionImpacto.trim() === "";

  async function guardar() {
    setMensaje(""); setErrores({});
    const cuerpo = {
      ...f,
      probabilidad: Number(ev.probabilidad) || null,
      justificacionProbabilidad: ev.justificacionProbabilidad,
      impacto: Number(ev.impacto) || null,
      justificacionImpacto: ev.justificacionImpacto,
      medidaDescripcion: m.descripcion,
      medidaPrioridad: m.prioridad,
      medidaResponsable: m.responsable,
      medidaVerificacion: m.verificacion,
      medidaEstado: m.estado,
    };
    setEnviando(true);
    try {
      const res = await fetch(editando ? `/api/riesgos/${editando.id}` : "/api/riesgos", {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const datos = await res.json().catch(() => ({}));
      if (res.ok) {
        if (!editando) limpiar();
        setMensaje(editando ? "Riesgo actualizado." : "Riesgo guardado.");
        onGuardado(datos.riesgo);
      } else {
        setErrores(datos.campos ?? {});
        setMensaje(datos.error ?? "No se pudo guardar.");
      }
    } catch {
      setMensaje("No se pudo contactar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  const err = (id: string) => (errores[id] ? <p className="error" id={`${id}-error`}>{errores[id]}</p> : null);
  const describe = (id: string) => [`${id}-ayuda`, errores[id] ? `${id}-error` : ""].filter(Boolean).join(" ");

  const texto = (id: keyof Formulacion, etiqueta: string, ayuda: string, limite = LIMITE_CORTO, largo = false) => (
    <div>
      <label htmlFor={id}>{etiqueta}</label>
      <div className="help" id={`${id}-ayuda`}>{ayuda}</div>
      {largo ? (
        <textarea id={id} name={id} value={f[id]} onChange={setForm(id)} maxLength={limite} aria-describedby={describe(id)} aria-invalid={!!errores[id]} />
      ) : (
        <input type="text" id={id} name={id} value={f[id]} onChange={setForm(id)} maxLength={limite} aria-describedby={describe(id)} aria-invalid={!!errores[id]} />
      )}
      <Contador valor={f[id]} limite={limite} />
      {err(id)}
    </div>
  );

  const area = (id: string, etiqueta: string, ayuda: string, valor: string, onChange: (e: { target: { value: string } }) => void, limite = LIMITE_LARGO) => (
    <div>
      <label htmlFor={id}>{etiqueta}</label>
      <div className="help" id={`${id}-ayuda`}>{ayuda}</div>
      <textarea id={id} value={valor} onChange={onChange} maxLength={limite} aria-describedby={describe(id)} aria-invalid={!!errores[id]} />
      <Contador valor={valor} limite={limite} />
      {err(id)}
    </div>
  );

  const lista = (id: string, etiqueta: string, ayuda: string, valor: string, onChange: (e: { target: { value: string } }) => void, opciones: { v: string; t: string }[], vacio?: string) => (
    <div>
      <label htmlFor={id}>{etiqueta}</label>
      <div className="help" id={`${id}-ayuda`}>{ayuda}</div>
      <select id={id} value={valor} onChange={onChange} aria-describedby={describe(id)} aria-invalid={!!errores[id]}>
        {vacio ? <option value="">{vacio}</option> : null}
        {opciones.map((o) => <option key={o.v} value={o.v}>{o.t}</option>)}
      </select>
      {err(id)}
    </div>
  );

  return (
    <section className="card" aria-labelledby="identificar">
      <h2 id="identificar">{editando ? "Editar riesgo" : "Identificar un riesgo"}</h2>
      {!editando && !autenticado ? (
        <p className="help" role="status">
          Inicia sesión para poder guardar el riesgo. Los riesgos guardados aparecen en el listado inferior.
        </p>
      ) : null}

      <details>
        <summary>Ayuda: debilidad, amenaza, evento y consecuencia</summary>
        <ul className="clean">
          <li><strong>Debilidad:</strong> facilita que ocurra el daño.</li>
          <li><strong>Amenaza:</strong> puede provocar el daño.</li>
          <li><strong>Evento:</strong> lo que sucede.</li>
          <li><strong>Consecuencia:</strong> el efecto sobre la actividad y sus objetivos.</li>
        </ul>
      </details>

      {!editando ? (
        <div className="row">
          <button type="button" onClick={() => { setF(EJEMPLO); setErrores({}); setMensaje(""); }}>Cargar ejemplo</button>
          <button type="button" className="secondary" onClick={limpiar}>Limpiar formulario</button>
        </div>
      ) : null}

      <form onSubmit={(e) => { e.preventDefault(); if (autenticado) guardar(); }} noValidate>
        <fieldset style={fs}>
          <legend><h3>A. Qué queremos proteger</h3></legend>
          {texto("proceso", "Proceso o servicio", "Actividad de la organización que podría verse afectada. Ejemplo: matrícula.")}
          {lista("activo", "Activo afectado", "Plataforma web, base de datos o copias de seguridad.", f.activo, setForm("activo"), ACTIVOS.map((a) => ({ v: a, t: a })), "Selecciona un activo")}
          {lista("objetivo", "Objetivo afectado", "Completar solicitudes en plazo o conservar y recuperar registros.", f.objetivo, setForm("objetivo"), OBJETIVOS.map((o) => ({ v: o, t: o })), "Selecciona un objetivo")}
        </fieldset>

        <fieldset style={fs}>
          <legend><h3>B. Qué podría ocurrir y por qué</h3></legend>
          {texto("condicion", "Condición o debilidad conocida", "Hecho conocido que facilita el daño. Ejemplo: no se ha probado la restauración de las copias.")}
          {texto("amenaza", "Amenaza", "Qué podría provocar el daño. Ejemplo: fallo del almacenamiento.")}
          {texto("evento", "Evento", "Qué sucedería concretamente. Ejemplo: pérdida de acceso a los registros confirmados.")}
        </fieldset>

        <fieldset style={fs}>
          <legend><h3>C. Qué consecuencias tendría</h3></legend>
          {texto("consecuencia", "Consecuencia para la organización", "Efecto sobre la actividad y sus objetivos.")}
        </fieldset>

        <fieldset style={fs}>
          <legend><h3>D. Qué estamos suponiendo (opcional)</h3></legend>
          {texto("supuesto", "Supuestos o información pendiente", "Separa lo que se sabe de lo que se supone o se desconoce.", LIMITE_LARGO, true)}
        </fieldset>

        <h3>Vista previa del enunciado</h3>
        <div className="preview" aria-live="polite">
          <p>
            {partes.map((x, k) => (x.falta ? <span key={k} className="missing">{x.texto}</span> : <span key={k}>{x.texto}</span>))}
          </p>
          {faltan.length > 0 ? <p className="missing">Enunciado incompleto. Falta: {faltan.join(", ")}.</p> : null}
          {f.supuesto.trim() ? <p><strong>Supuesto o información pendiente:</strong> {f.supuesto}</p> : null}
          <p className="help">Revisa que la frase tenga sentido completo y que los elementos formen un escenario coherente antes de continuar.</p>
        </div>

        <fieldset style={fs}>
          <legend><h3>E. Evaluar el riesgo</h3></legend>
          <div className="help">Horizonte: la próxima campaña de matrícula. Cada valoración exige una justificación. Si falta información, regístrala como supuesto; no subas la probabilidad por defecto.</div>
          {lista("probabilidad", "Probabilidad", "Elige el descriptor que mejor encaje con lo que se sabe.", ev.probabilidad, setE("probabilidad"), PROBABILIDAD.map((x) => ({ v: String(x.valor), t: `${x.valor} ${x.nombre}: ${x.descriptor}` })), "Selecciona una probabilidad")}
          {area("justificacionProbabilidad", "Justificación de la probabilidad", "Por qué ese valor y no otro, con hechos del caso.", ev.justificacionProbabilidad, setE("justificacionProbabilidad"))}
          {lista("impacto", "Impacto", "Efecto sobre el objetivo durante la campaña.", ev.impacto, setE("impacto"), IMPACTO.map((x) => ({ v: String(x.valor), t: `${x.valor} ${x.nombre}: ${x.descriptor}` })), "Selecciona un impacto")}
          {area("justificacionImpacto", "Justificación del impacto", "Qué le pasaría al objetivo si ocurre el evento.", ev.justificacionImpacto, setE("justificacionImpacto"))}
        </fieldset>

        <h3>Nivel de riesgo</h3>
        <div className="preview" aria-live="polite">
          {calculo ? (
            <p>
              Puntuación: {p} × {i} = <strong>{calculo.puntos}</strong> ·{" "}
              <span className={`level ${calculo.nivel}`}>Riesgo {calculo.nivel}</span>
            </p>
          ) : (
            <p className="missing">Selecciona probabilidad e impacto para calcular el nivel.</p>
          )}
          {calculo && faltaJustificacion ? (
            <p className="missing">Falta la justificación de la probabilidad o del impacto: la valoración no está completa.</p>
          ) : null}
          {m.estado !== "verificada" ? (
            <p className="help">El nivel mostrado es el riesgo actual: la medida (estado «{m.estado}») todavía no lo reduce.</p>
          ) : null}
        </div>

        <fieldset style={fs}>
          <legend><h3>F. Medida de protección</h3></legend>
          <div className="help">Una medida propuesta no reduce el riesgo hasta que se implanta y se verifica. La valoración solo se revisa entonces.</div>
          {area("medidaDescripcion", "Medida concreta", "Qué se hará exactamente, de forma que pueda implantarse.", m.descripcion, setMed("descripcion"))}
          {lista("medidaPrioridad", "Prioridad", "Orden en que conviene implantarla.", m.prioridad, setMed("prioridad"), PRIORIDADES.map((x) => ({ v: x, t: x })), "Selecciona una prioridad")}
          <div>
            <label htmlFor="medidaResponsable">Responsable (ficticio, opcional)</label>
            <div className="help" id="medidaResponsable-ayuda">Rol, no nombre de persona real.</div>
            <input type="text" id="medidaResponsable" value={m.responsable} onChange={setMed("responsable")} maxLength={LIMITE_CORTO} aria-describedby={describe("medidaResponsable")} />
            <Contador valor={m.responsable} limite={LIMITE_CORTO} />
            {err("medidaResponsable")}
          </div>
          {area("medidaVerificacion", "Cómo se comprobará su eficacia", "Prueba observable que demuestre que protege el objetivo.", m.verificacion, setMed("verificacion"))}
          {lista("medidaEstado", "Estado de la medida", "Propuesta, implantada o verificada.", m.estado, setMed("estado"), ESTADOS_MEDIDA.map((x) => ({ v: x, t: x })))}
        </fieldset>

        <div className="row">
          <button type="submit" disabled={!autenticado || enviando}>
            {enviando ? "Guardando…" : editando ? "Guardar cambios" : "Guardar riesgo"}
          </button>
          {editando ? <button type="button" className="secondary" onClick={onCancelar}>Cancelar edición</button> : null}
        </div>
        {mensaje ? <p role="status" className={Object.keys(errores).length ? "error" : "help"}>{mensaje}</p> : null}
        {!autenticado ? <p className="help">Guardar requiere iniciar sesión: la autorización se comprueba en el servidor.</p> : null}
      </form>
    </section>
  );
}
