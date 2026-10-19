import Aplicacion from "./aplicacion";
import { CLASIFICACION, IMPACTO, PROBABILIDAD } from "@/lib/escalas";


export default function Home() {
  return (
    <main>
      <span className="badge">Caso académico con datos ficticios</span>
      <h1>Laboratorio de gestión de riesgos</h1>
      <p className="subtitle">
        Identificar, evaluar y comunicar riesgos para priorizar medidas de protección.
      </p>

      <div className="notice" role="note">
        <strong>Condiciones ficticias.</strong> La organización y las condiciones que se
        describen a continuación pertenecen a un caso inventado para la práctica. No describen
        la configuración real de este proyecto ni de ninguna organización existente.
      </div>

      <section className="card" aria-labelledby="org">
        <h2 id="org">Organización y objetivo</h2>
        <p>
          La <strong>Academia Horizonte</strong> gestiona matrículas mediante una plataforma web.
          La campaña dura <strong>siete días</strong>.
        </p>
        <p>Su objetivo es que:</p>
        <ul className="clean">
          <li>las solicitudes puedan completarse dentro del plazo, y</li>
          <li>los registros confirmados se conserven y puedan recuperarse.</li>
        </ul>
        <p>
          <strong>Activos:</strong> plataforma web, base de datos de matrículas y copias de seguridad.
        </p>
      </section>

      <section className="card" aria-labelledby="cond">
        <h2 id="cond">Condiciones del caso</h2>
        <ul className="clean">
          <li>Hay una única instancia de base de datos y no se ha probado la restauración de las copias.</li>
          <li>La cuenta que utiliza la aplicación tiene permisos administrativos sobre la base de datos.</li>
        </ul>
      </section>

      <details className="card">
        <summary>Cómo evaluaremos los riesgos</summary>
        <p>Horizonte de evaluación: la próxima campaña de matrícula. Escalas didácticas del laboratorio; no se atribuyen a ENS ni a NIST.</p>
        <h3>Probabilidad</h3>
        <table>
          <thead><tr><th>Valor</th><th>Descriptor</th></tr></thead>
          <tbody>
            {PROBABILIDAD.map((p) => (
              <tr key={p.valor}><td>{p.valor} {p.nombre}</td><td>{p.descriptor}</td></tr>
            ))}
          </tbody>
        </table>
        <h3>Impacto</h3>
        <table>
          <thead><tr><th>Valor</th><th>Descriptor</th></tr></thead>
          <tbody>
            {IMPACTO.map((i) => (
              <tr key={i.valor}><td>{i.valor} {i.nombre}</td><td>{i.descriptor}</td></tr>
            ))}
          </tbody>
        </table>
        <h3>Puntuación y clasificación</h3>
        <p>Puntuación = probabilidad × impacto.</p>
        <table>
          <thead><tr><th>Puntuación</th><th>Clasificación</th></tr></thead>
          <tbody>
            {CLASIFICACION.map((c) => (
              <tr key={c.nivel}><td>{c.rango}</td><td style={{ textTransform: "capitalize" }}>{c.nivel}</td></tr>
            ))}
          </tbody>
        </table>
        <p>
          Cada valoración exige una justificación. La falta de información se registra como
          supuesto o información pendiente, sin convertirse automáticamente en probabilidad alta.
        </p>
      </details>

      <Aplicacion />
    </main>
  );
}
