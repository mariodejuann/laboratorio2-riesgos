"use client";

import { useState } from "react";
import { EVALUACION_VACIA, type Evaluacion } from "@/lib/evaluacion";
import { ESTADOS_MEDIDA, MEDIDA_VACIA, PRIORIDADES, type Medida } from "@/lib/medida";
import { IMPACTO, PROBABILIDAD } from "@/lib/escalas";
import { clasificar, puntuacion, esValor } from "@/lib/scoring";
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

function Contador({ valor, limite }: { valor: string; limite: number }) {
  return <div className="counter" aria-hidden="true">{valor.length}/{limite}</div>;
}

export default function FormularioRiesgo() {
  const [f, setF] = useState<Formulacion>(FORMULACION_VACIA);
  const [ev, setEv] = useState<Evaluacion>(EVALUACION_VACIA);
  const setE = (clave: keyof Evaluacion) => (e: { target: { value: string } }) =>
    setEv((prev) => ({ ...prev, [clave]: e.target.value }));
  const [m, setM] = useState<Medida>(MEDIDA_VACIA);
  const setMed = (clave: keyof Medida) => (e: { target: { value: string } }) =>
    setM((prev) => ({ ...prev, [clave]: e.target.value }));
  const limpiar = () => { setF(FORMULACION_VACIA); setEv(EVALUACION_VACIA); setM(MEDIDA_VACIA); };

  const p = Number(ev.probabilidad);
  const i = Number(ev.impacto);
  const calculo = esValor(p) && esValor(i) ? { puntos: puntuacion(p, i), nivel: clasificar(puntuacion(p, i)) } : null;
  const faltaJustificacion =
    ev.justificacionProbabilidad.trim() === "" || ev.justificacionImpacto.trim() === "";

  const set = (clave: keyof Formulacion) => (e: { target: { value: string } }) =>
    setF((prev) => ({ ...prev, [clave]: e.target.value }));

  const faltan = camposFaltantes(f);
  const partes = partesFrase(f);

  const texto = (id: keyof Formulacion, etiqueta: string, ayuda: string, limite = LIMITE_CORTO, largo = false) => (
    <div>
      <label htmlFor={id}>{etiqueta}</label>
      <div className="help" id={`${id}-ayuda`}>{ayuda}</div>
      {largo ? (
        <textarea id={id} name={id} value={f[id]} onChange={set(id)} maxLength={limite} aria-describedby={`${id}-ayuda`} />
      ) : (
        <input type="text" id={id} name={id} value={f[id]} onChange={set(id)} maxLength={limite} aria-describedby={`${id}-ayuda`} />
      )}
      <Contador valor={f[id]} limite={limite} />
    </div>
  );

  return (
    <section className="card" aria-labelledby="identificar">
      <h2 id="identificar">Identificar un riesgo</h2>
      <p className="temp" role="status">Borrador temporal. No se guarda al recargar.</p>

      <details>
        <summary>Ayuda: debilidad, amenaza, evento y consecuencia</summary>
        <ul className="clean">
          <li><strong>Debilidad:</strong> facilita que ocurra el daño.</li>
          <li><strong>Amenaza:</strong> puede provocar el daño.</li>
          <li><strong>Evento:</strong> lo que sucede.</li>
          <li><strong>Consecuencia:</strong> el efecto sobre la actividad y sus objetivos.</li>
        </ul>
      </details>

      <div className="row">
        <button type="button" onClick={() => setF(EJEMPLO)}>Cargar ejemplo</button>
        <button type="button" className="secondary" onClick={limpiar}>Limpiar formulario</button>
      </div>

      <form onSubmit={(e) => e.preventDefault()} noValidate>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend><h3>A. Qué queremos proteger</h3></legend>
          {texto("proceso", "Proceso o servicio", "Actividad de la organización que podría verse afectada. Ejemplo: matrícula.")}
          <div>
            <label htmlFor="activo">Activo afectado</label>
            <div className="help" id="activo-ayuda">Plataforma web, base de datos o copias de seguridad.</div>
            <select id="activo" name="activo" value={f.activo} onChange={set("activo")} aria-describedby="activo-ayuda">
              <option value="">Selecciona un activo</option>
              {ACTIVOS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="objetivo">Objetivo afectado</label>
            <div className="help" id="objetivo-ayuda">Completar solicitudes en plazo o conservar y recuperar registros.</div>
            <select id="objetivo" name="objetivo" value={f.objetivo} onChange={set("objetivo")} aria-describedby="objetivo-ayuda">
              <option value="">Selecciona un objetivo</option>
              {OBJETIVOS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend><h3>B. Qué podría ocurrir y por qué</h3></legend>
          {texto("condicion", "Condición o debilidad conocida", "Hecho conocido que facilita el daño. Ejemplo: no se ha probado la restauración de las copias.")}
          {texto("amenaza", "Amenaza", "Qué podría provocar el daño. Ejemplo: fallo del almacenamiento.")}
          {texto("evento", "Evento", "Qué sucedería concretamente. Ejemplo: pérdida de acceso a los registros confirmados.")}
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend><h3>C. Qué consecuencias tendría</h3></legend>
          {texto("consecuencia", "Consecuencia para la organización", "Efecto sobre la actividad y sus objetivos.")}
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend><h3>D. Qué estamos suponiendo (opcional)</h3></legend>
          {texto("supuesto", "Supuestos o información pendiente", "Separa lo que se sabe de lo que se supone o se desconoce.", LIMITE_LARGO, true)}
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend><h3>E. Evaluar el riesgo</h3></legend>
          <div className="help">Horizonte: la próxima campaña de matrícula. Cada valoración exige una justificación. Si falta información, regístrala como supuesto; no subas la probabilidad por defecto.</div>
          <div>
            <label htmlFor="probabilidad">Probabilidad</label>
            <select id="probabilidad" name="probabilidad" value={ev.probabilidad} onChange={setE("probabilidad")}>
              <option value="">Selecciona una probabilidad</option>
              {PROBABILIDAD.map((x) => <option key={x.valor} value={x.valor}>{x.valor} {x.nombre}: {x.descriptor}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="justificacionProbabilidad">Justificación de la probabilidad</label>
            <textarea id="justificacionProbabilidad" name="justificacionProbabilidad" value={ev.justificacionProbabilidad} onChange={setE("justificacionProbabilidad")} maxLength={LIMITE_LARGO} />
            <Contador valor={ev.justificacionProbabilidad} limite={LIMITE_LARGO} />
          </div>
          <div>
            <label htmlFor="impacto">Impacto</label>
            <select id="impacto" name="impacto" value={ev.impacto} onChange={setE("impacto")}>
              <option value="">Selecciona un impacto</option>
              {IMPACTO.map((x) => <option key={x.valor} value={x.valor}>{x.valor} {x.nombre}: {x.descriptor}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="justificacionImpacto">Justificación del impacto</label>
            <textarea id="justificacionImpacto" name="justificacionImpacto" value={ev.justificacionImpacto} onChange={setE("justificacionImpacto")} maxLength={LIMITE_LARGO} />
            <Contador valor={ev.justificacionImpacto} limite={LIMITE_LARGO} />
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend><h3>F. Medida de protección</h3></legend>
          <div className="help">Una medida propuesta no reduce el riesgo hasta que se implanta y se verifica. La valoración solo se revisa entonces.</div>
          <div>
            <label htmlFor="medidaDescripcion">Medida concreta</label>
            <textarea id="medidaDescripcion" value={m.descripcion} onChange={setMed("descripcion")} maxLength={LIMITE_LARGO} />
            <Contador valor={m.descripcion} limite={LIMITE_LARGO} />
          </div>
          <div>
            <label htmlFor="medidaPrioridad">Prioridad</label>
            <select id="medidaPrioridad" value={m.prioridad} onChange={setMed("prioridad")}>
              <option value="">Selecciona una prioridad</option>
              {PRIORIDADES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="medidaResponsable">Responsable (ficticio)</label>
            <input type="text" id="medidaResponsable" value={m.responsable} onChange={setMed("responsable")} maxLength={LIMITE_CORTO} />
            <Contador valor={m.responsable} limite={LIMITE_CORTO} />
          </div>
          <div>
            <label htmlFor="medidaVerificacion">Cómo se comprobará su eficacia</label>
            <textarea id="medidaVerificacion" value={m.verificacion} onChange={setMed("verificacion")} maxLength={LIMITE_LARGO} />
            <Contador valor={m.verificacion} limite={LIMITE_LARGO} />
          </div>
          <div>
            <label htmlFor="medidaEstado">Estado de la medida</label>
            <select id="medidaEstado" value={m.estado} onChange={setMed("estado")}>
              {ESTADOS_MEDIDA.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
        </fieldset>
      </form>

      <h3>Vista previa del enunciado</h3>
      <div className="preview" aria-live="polite">
        <p>
          {partes.map((p, i) =>
            p.falta ? <span key={i} className="missing">{p.texto}</span> : <span key={i}>{p.texto}</span>,
          )}
        </p>
        {faltan.length > 0 ? (
          <p className="missing">Enunciado incompleto. Falta: {faltan.join(", ")}.</p>
        ) : null}
        {f.supuesto.trim() ? <p><strong>Supuesto o información pendiente:</strong> {f.supuesto}</p> : null}
        <p className="help">Revisa que la frase tenga sentido completo y que los elementos formen un escenario coherente antes de continuar.</p>
      </div>

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
        {m.estado !== "verificada" ? (
          <p className="help">El nivel mostrado es el riesgo actual: la medida (estado «{m.estado}») todavía no lo reduce.</p>
        ) : null}
        {calculo && faltaJustificacion ? (
          <p className="missing">Falta la justificación de la probabilidad o del impacto: la valoración no está completa.</p>
        ) : null}
      </div>
    </section>
  );
}
