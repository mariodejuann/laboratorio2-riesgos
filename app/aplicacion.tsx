"use client";

import { useCallback, useEffect, useState } from "react";
import type { Riesgo } from "@/lib/db";
import type { Nivel } from "@/lib/escalas";
import { fraseTexto } from "@/lib/formulacion";
import FormularioRiesgo from "./formulario-riesgo";

const ORDEN_PRIORIDAD: Record<string, number> = { alta: 0, media: 1, baja: 2 };

function Nivel({ nivel }: { nivel: Nivel }) {
  return <span className={`level ${nivel}`}>Riesgo {nivel}</span>;
}

function celdaCsv(v: unknown): string {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // evita inyección de fórmulas al abrir en hojas de cálculo
  return `"${s.replace(/"/g, '""')}"`;
}

function exportarCsv(riesgos: Riesgo[]) {
  const cols: (keyof Riesgo)[] = [
    "proceso", "activo", "objetivo", "condicion", "amenaza", "evento", "consecuencia", "supuesto",
    "probabilidad", "justificacionProbabilidad", "impacto", "justificacionImpacto", "puntuacion", "nivel",
    "medidaDescripcion", "medidaPrioridad", "medidaResponsable", "medidaVerificacion", "medidaEstado",
    "creadoEn", "actualizadoEn",
  ];
  const csv = [cols.join(";"), ...riesgos.map((r) => cols.map((c) => celdaCsv(r[c])).join(";"))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "riesgos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Aplicacion() {
  const [autenticado, setAutenticado] = useState(false);
  const [comprobado, setComprobado] = useState(false);
  const [riesgos, setRiesgos] = useState<Riesgo[]>([]);
  const [conteo, setConteo] = useState<Record<Nivel, number> | null>(null);
  const [editando, setEditando] = useState<Riesgo | null>(null);
  const [estado, setEstado] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [msgLogin, setMsgLogin] = useState("");

  const cargar = useCallback(async () => {
    if (!comprobado) return;
    try {
      if (autenticado) {
        const res = await fetch("/api/riesgos", { cache: "no-store" });
        if (res.status === 401) { setAutenticado(false); return; }
        const d = await res.json();
        if (res.ok) { setRiesgos(d.riesgos); setEstado(""); } else setEstado(d.error ?? "No se pudieron cargar los riesgos.");
      } else {
        const res = await fetch("/api/resumen", { cache: "no-store" });
        const d = await res.json();
        if (res.ok) { setConteo(d.niveles); setEstado(""); } else setEstado(d.error ?? "No se pudo cargar el resumen.");
      }
    } catch {
      setEstado("No se pudo contactar con el servidor.");
    }
  }, [autenticado, comprobado]);

  useEffect(() => {
    fetch("/api/sesion", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAutenticado(d.autenticado === true))
      .catch(() => setAutenticado(false))
      .finally(() => setComprobado(true));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos desde la API
    cargar();
  }, [cargar]);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setMsgLogin("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contrasena }),
    });
    setContrasena("");
    if (res.ok) setAutenticado(true);
    else setMsgLogin((await res.json().catch(() => ({}))).error ?? "No se pudo iniciar sesión.");
  }

  async function salir() {
    await fetch("/api/logout", { method: "POST" });
    setAutenticado(false); setRiesgos([]); setEditando(null);
  }

  async function borrar(r: Riesgo) {
    if (!confirm("¿Borrar este riesgo? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/riesgos/${r.id}`, { method: "DELETE" });
    if (res.ok) cargar();
    else setEstado((await res.json().catch(() => ({}))).error ?? "No se pudo borrar.");
  }

  const contar = (n: Nivel) => (autenticado ? riesgos.filter((r) => r.nivel === n).length : conteo?.[n] ?? 0);
  const prioritaria = [...riesgos].sort(
    (a, b) => b.puntuacion - a.puntuacion || ORDEN_PRIORIDAD[a.medidaPrioridad] - ORDEN_PRIORIDAD[b.medidaPrioridad],
  )[0];

  return (
    <>
      <section className="card" aria-labelledby="acceso">
        <div className="topbar">
          <h2 id="acceso" style={{ margin: 0 }}>Acceso</h2>
          {autenticado ? <button type="button" className="secondary" onClick={salir}>Cerrar sesión</button> : null}
        </div>
        {autenticado ? (
          <p className="help">Sesión iniciada. Puedes guardar, editar y borrar riesgos.</p>
        ) : (
          <form onSubmit={entrar}>
            <label htmlFor="contrasena">Contraseña de administración</label>
            <div className="help" id="contrasena-ayuda">Necesaria para ver el detalle de los registros y para guardar cambios.</div>
            <input type="password" id="contrasena" autoComplete="current-password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} maxLength={200} aria-describedby="contrasena-ayuda" />
            <div className="row"><button type="submit" disabled={!contrasena}>Iniciar sesión</button></div>
            {msgLogin ? <p className="error" role="alert">{msgLogin}</p> : null}
          </form>
        )}
      </section>

      <FormularioRiesgo
        key={editando?.id ?? "nuevo"}
        autenticado={autenticado}
        editando={editando}
        onGuardado={() => { setEditando(null); cargar(); }}
        onCancelar={() => setEditando(null)}
      />

      <section className="card" aria-labelledby="resumen">
        <h2 id="resumen">Resumen para dirección</h2>
        {estado ? <p className="error" role="alert">{estado}</p> : null}
        <div className="grid3">
          {(["alto", "medio", "bajo"] as Nivel[]).map((n) => (
            <div className="stat" key={n}><strong>{contar(n)}</strong><span className={`level ${n}`}>Riesgo {n}</span></div>
          ))}
        </div>

        {!autenticado ? (
          <p className="help">Inicia sesión para ver qué riesgos son y qué medidas se proponen.</p>
        ) : riesgos.length === 0 ? (
          <p className="help">Todavía no hay riesgos registrados.</p>
        ) : (
          <>
            {prioritaria ? (
              <div className="notice">
                <strong>Medida que recomendamos aprobar primero:</strong> {prioritaria.medidaDescripcion}
                <br />
                <span>Protege el objetivo de <em>{prioritaria.objetivo}</em> frente al riesgo de mayor nivel ({prioritaria.puntuacion}, {prioritaria.nivel}).</span>
                <br />
                <span><strong>Cómo sabremos que funciona:</strong> {prioritaria.medidaVerificacion}</span>
              </div>
            ) : null}
            <ol>
              {riesgos.map((r) => (
                <li key={r.id} style={{ marginBottom: 12 }}>
                  <Nivel nivel={r.nivel} /> <span className="help">({r.probabilidad} × {r.impacto} = {r.puntuacion})</span>
                  <p style={{ margin: "4px 0" }}>{fraseTexto(r)}</p>
                  <p style={{ margin: "4px 0" }}>
                    <strong>Qué haríamos:</strong> {r.medidaDescripcion} <span className="help">(prioridad {r.medidaPrioridad}, {r.medidaEstado})</span>
                  </p>
                </li>
              ))}
            </ol>
            <p className="help">Las medidas propuestas no reducen el riesgo hasta implantarse y verificarse.</p>
          </>
        )}
      </section>

      {autenticado && riesgos.length > 0 ? (
        <section className="card" aria-labelledby="detalle">
          <div className="topbar">
            <h2 id="detalle" style={{ margin: 0 }}>Detalle técnico</h2>
            <button type="button" className="secondary" onClick={() => exportarCsv(riesgos)}>Exportar CSV</button>
          </div>
          {riesgos.map((r) => (
            <details key={r.id} className="card">
              <summary><Nivel nivel={r.nivel} /> {r.proceso} · {r.activo} · {r.evento}</summary>
              <table>
                <tbody>
                  <tr><th>Proceso</th><td>{r.proceso}</td></tr>
                  <tr><th>Activo</th><td>{r.activo}</td></tr>
                  <tr><th>Objetivo</th><td>{r.objetivo}</td></tr>
                  <tr><th>Condición o debilidad</th><td>{r.condicion}</td></tr>
                  <tr><th>Amenaza</th><td>{r.amenaza}</td></tr>
                  <tr><th>Evento</th><td>{r.evento}</td></tr>
                  <tr><th>Consecuencia</th><td>{r.consecuencia}</td></tr>
                  <tr><th>Supuestos</th><td>{r.supuesto || "—"}</td></tr>
                  <tr><th>Probabilidad</th><td>{r.probabilidad}: {r.justificacionProbabilidad}</td></tr>
                  <tr><th>Impacto</th><td>{r.impacto}: {r.justificacionImpacto}</td></tr>
                  <tr><th>Puntuación</th><td>{r.puntuacion} ({r.nivel})</td></tr>
                  <tr><th>Medida</th><td>{r.medidaDescripcion}</td></tr>
                  <tr><th>Prioridad / estado</th><td>{r.medidaPrioridad} / {r.medidaEstado}</td></tr>
                  <tr><th>Responsable</th><td>{r.medidaResponsable || "—"}</td></tr>
                  <tr><th>Comprobación de eficacia</th><td>{r.medidaVerificacion}</td></tr>
                  <tr><th>Actualizado</th><td>{new Date(r.actualizadoEn).toLocaleString("es-ES")}</td></tr>
                </tbody>
              </table>
              <div className="row">
                <button type="button" className="secondary" onClick={() => { setEditando(r); document.getElementById("identificar")?.scrollIntoView(); }}>Editar</button>
                <button type="button" className="danger" onClick={() => borrar(r)}>Borrar</button>
              </div>
            </details>
          ))}
        </section>
      ) : null}
    </>
  );
}
