"use client";

import { useState } from "react";
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
        <button type="button" className="secondary" onClick={() => setF(FORMULACION_VACIA)}>Limpiar formulario</button>
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
    </section>
  );
}
