"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RF, RF_BY_CODE } from "@/lib/rf";
import {
  ITEMS_PREPARACION,
  MAX_ACTIVIDADES_POR_TURNO,
  MAX_ANALISIS_POR_ACTIVIDAD,
  noPreparada,
  type ActividadInput,
  type AnalisisInput,
  type ItemKey,
  type RitInput,
} from "@/lib/validacion";

type Turno = "A" | "B";
const DRAFT_KEY = "rit-borrador-v1";
const hoy = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const nuevaActividad = (turno: Turno): ActividadInput => ({
  turno,
  descripcion: "",
  instructivos: null,
  materiales: null,
  herramientas: null,
  epp: null,
  analisis: [{ rf: "", riesgo: "", consecuencia: "", controles: [] }],
});

const inicial = (): RitInput => ({
  fecha: hoy(),
  centroTrabajo: "División Radomiro Tomic",
  gerencia: "",
  superintendencia: "",
  area: "",
  supervisor: "",
  nAsistentes: 0,
  eecc: "",
  nContrato: "",
  nombreContrato: "",
  rfs: [],
  actividades: [nuevaActividad("A")],
  aportes: [],
  reconocimientos: [],
});

export default function RitForm() {
  const router = useRouter();
  const [rit, setRit] = useState<RitInput>(inicial);
  const [turno, setTurno] = useState<Turno>("A");
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [cargado, setCargado] = useState(false);

  // Borrador local: si se corta la señal en terreno, no se pierde lo escrito.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setRit({ ...inicial(), ...JSON.parse(raw) });
    } catch {}
    setCargado(true);
  }, []);
  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(rit));
    } catch {}
  }, [rit, cargado]);

  const set = <K extends keyof RitInput>(k: K, v: RitInput[K]) => setRit((r) => ({ ...r, [k]: v }));
  const idxTurno = useMemo(() => rit.actividades.map((a, i) => [a, i] as const).filter(([a]) => a.turno === turno), [rit.actividades, turno]);
  const cuenta = (t: Turno) => rit.actividades.filter((a) => a.turno === t).length;

  const updAct = (i: number, patch: Partial<ActividadInput>) =>
    setRit((r) => ({ ...r, actividades: r.actividades.map((a, k) => (k === i ? { ...a, ...patch } : a)) }));
  const updAn = (i: number, j: number, patch: Partial<AnalisisInput>) =>
    setRit((r) => {
      const actividades = r.actividades.map((a, k) =>
        k === i ? { ...a, analisis: a.analisis.map((x, m) => (m === j ? { ...x, ...patch } : x)) } : a,
      );
      // Si se elige un RF en el análisis, se marca automáticamente como RF del turno.
      const rfs = patch.rf && !r.rfs.includes(patch.rf) ? [...r.rfs, patch.rf].sort() : r.rfs;
      return { ...r, actividades, rfs };
    });

  const toggleRf = (code: string) => set("rfs", rit.rfs.includes(code) ? rit.rfs.filter((c) => c !== code) : [...rit.rfs, code].sort());

  async function enviar() {
    setErrores([]);
    setEnviando(true);
    try {
      const res = await fetch("/api/rit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rit) });
      const data = await res.json();
      if (!res.ok) {
        setErrores(data.errores ?? ["No se pudo enviar la RIT."]);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      localStorage.removeItem(DRAFT_KEY);
      router.push(`/rit/${data.id}?enviada=1`);
    } catch {
      setErrores(["Sin conexión. La RIT quedó guardada como borrador en este equipo; intente enviar nuevamente."]);
    } finally {
      setEnviando(false);
    }
  }

  const totalNo = rit.actividades.filter(noPreparada).length;

  return (
    <div className="space-y-5 pb-24">
      {errores.length > 0 && (
        <div className="rounded-xl border border-naranjo bg-naranjo-claro p-4 text-sm text-naranjo-oscuro" role="alert">
          <p className="mb-1 font-bold">Revise lo siguiente antes de enviar:</p>
          <ul className="list-disc pl-5">{errores.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      {/* 1 · Identificación */}
      <section className="card space-y-4">
        <h2 className="section-title">1 · Identificación</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Campo label="Fecha"><input type="date" className="input" value={rit.fecha} onChange={(e) => set("fecha", e.target.value)} /></Campo>
          <Campo label="Centro de trabajo"><input className="input" value={rit.centroTrabajo} onChange={(e) => set("centroTrabajo", e.target.value)} /></Campo>
          <Campo label="Gerencia *"><input className="input" value={rit.gerencia} onChange={(e) => set("gerencia", e.target.value)} placeholder="Ej.: GMM" /></Campo>
          <Campo label="Superintendencia / Dirección"><input className="input" value={rit.superintendencia} onChange={(e) => set("superintendencia", e.target.value)} /></Campo>
          <Campo label="Área / Frente de trabajo *" className="sm:col-span-2"><input className="input" value={rit.area} onChange={(e) => set("area", e.target.value)} /></Campo>
          <Campo label="Supervisor a cargo *"><input className="input" value={rit.supervisor} onChange={(e) => set("supervisor", e.target.value)} autoComplete="name" /></Campo>
          <Campo label="N.º de asistentes *">
            <input type="number" inputMode="numeric" min={1} className="input" value={rit.nAsistentes || ""} onChange={(e) => set("nAsistentes", Number(e.target.value))} />
          </Campo>
          <Campo label="Empresa contratista (EE.CC.)"><input className="input" value={rit.eecc} onChange={(e) => set("eecc", e.target.value)} /></Campo>
          <Campo label="N.º de contrato"><input className="input" inputMode="numeric" value={rit.nContrato} onChange={(e) => set("nContrato", e.target.value)} /></Campo>
          <Campo label="Nombre del contrato" className="sm:col-span-2"><input className="input" value={rit.nombreContrato} onChange={(e) => set("nombreContrato", e.target.value)} /></Campo>
        </div>
      </section>

      {/* 2 · RF del turno */}
      <section className="card space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="section-title">2 · Riesgos de fatalidad presentes en el turno</h2>
          <span className="text-xs text-grafito-medio">{rit.rfs.length} marcados</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {RF.map((r) => {
            const on = rit.rfs.includes(r.code);
            return (
              <button
                key={r.code}
                type="button"
                onClick={() => toggleRf(r.code)}
                aria-pressed={on}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition ${on ? "border-naranjo bg-naranjo-claro" : "border-grafito-linea bg-white hover:bg-grafito-claro"}`}
              >
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-[11px] font-bold ${on ? "border-naranjo bg-naranjo text-white" : "border-grafito"}`}>{on ? "✓" : ""}</span>
                <span className="w-11 shrink-0 font-bold text-naranjo-oscuro">{r.code}</span>
                <span>{r.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3 · Actividades */}
      <section className="card space-y-4">
        <h2 className="section-title">3 · Actividades del turno · ¿Estamos preparados?</h2>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-grafito-claro p-1">
          {(["A", "B"] as Turno[]).map((t) => (
            <button key={t} type="button" onClick={() => setTurno(t)} className={`rounded-md py-2.5 text-sm font-bold transition ${turno === t ? "bg-white text-naranjo shadow" : "text-grafito-medio"}`}>
              Turno {t} <span className="ml-1 font-semibold text-grafito-medio">({cuenta(t)}/{MAX_ACTIVIDADES_POR_TURNO})</span>
            </button>
          ))}
        </div>

        {idxTurno.length === 0 && <p className="text-sm text-grafito-medio">Sin actividades registradas para el turno {turno}.</p>}

        {idxTurno.map(([a, i], n) => (
          <div key={i} className="space-y-3 rounded-xl border border-grafito-linea p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-naranjo-oscuro">Actividad {turno}{n + 1}</span>
              <button type="button" className="text-xs font-semibold text-grafito-medio underline" onClick={() => set("actividades", rit.actividades.filter((_, k) => k !== i))}>
                Quitar
              </button>
            </div>
            <textarea className="input min-h-[64px]" placeholder="Describa la actividad (igual que en la ART)" value={a.descripcion} onChange={(e) => updAct(i, { descripcion: e.target.value })} />

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ITEMS_PREPARACION.map((it) => (
                <SiNo key={it.key} label={it.label} value={a[it.key]} onChange={(v) => updAct(i, { [it.key]: v } as Partial<Record<ItemKey, boolean | null>>)} />
              ))}
            </div>
            {noPreparada(a) && (
              <p className="rounded-lg bg-naranjo-claro px-3 py-2 text-sm font-semibold text-naranjo-oscuro">
                No están dadas las condiciones: no inicie esta actividad hasta resolver los ítems marcados NO.
              </p>
            )}

            <div className="space-y-3">
              <p className="eyebrow">Análisis de riesgo y controles</p>
              {a.analisis.map((an, j) => {
                const rf = RF_BY_CODE[an.rf];
                return (
                  <div key={j} className="space-y-2 rounded-lg bg-grafito-claro p-3">
                    <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
                      <select
                        className="input"
                        value={an.rf}
                        onChange={(e) => {
                          const code = e.target.value;
                          const ev = RF_BY_CODE[code]?.evento ?? "";
                          updAn(i, j, { rf: code, controles: [], riesgo: an.riesgo && an.rf === code ? an.riesgo : ev });
                        }}
                      >
                        <option value="">RF N.º…</option>
                        {RF.map((r) => (
                          <option key={r.code} value={r.code}>{r.code} · {r.name}</option>
                        ))}
                      </select>
                      <input className="input" placeholder="Riesgo / evento top" value={an.riesgo} onChange={(e) => updAn(i, j, { riesgo: e.target.value })} />
                    </div>
                    <input className="input" placeholder="Consecuencia" value={an.consecuencia} onChange={(e) => updAn(i, j, { consecuencia: e.target.value })} />
                    {rf && (
                      <fieldset>
                        <legend className="label">Controles críticos verificados</legend>
                        <div className="grid gap-1.5">
                          {rf.controles.map((c) => {
                            const code = `${rf.code}-${c.code}`;
                            const on = an.controles.includes(code);
                            return (
                              <label key={code} className={`flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm ${on ? "bg-white" : ""}`}>
                                <input
                                  type="checkbox"
                                  className="mt-0.5 h-4 w-4 accent-naranjo"
                                  checked={on}
                                  onChange={() => updAn(i, j, { controles: on ? an.controles.filter((x) => x !== code) : [...an.controles, code] })}
                                />
                                <span>
                                  <b className={c.code.startsWith("CCP") ? "text-grafito" : "text-naranjo-oscuro"}>{c.code}</b> {c.text}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    )}
                    {a.analisis.length > 1 && (
                      <button type="button" className="text-xs font-semibold text-grafito-medio underline" onClick={() => updAct(i, { analisis: a.analisis.filter((_, m) => m !== j) })}>
                        Quitar fila de análisis
                      </button>
                    )}
                  </div>
                );
              })}
              {a.analisis.length < MAX_ANALISIS_POR_ACTIVIDAD && (
                <button type="button" className="btn-ghost w-full sm:w-auto" onClick={() => updAct(i, { analisis: [...a.analisis, { rf: "", riesgo: "", consecuencia: "", controles: [] }] })}>
                  + Agregar riesgo a esta actividad
                </button>
              )}
            </div>
          </div>
        ))}

        {cuenta(turno) < MAX_ACTIVIDADES_POR_TURNO && (
          <button type="button" className="btn-dark w-full" onClick={() => set("actividades", [...rit.actividades, nuevaActividad(turno)])}>
            + Agregar actividad al turno {turno}
          </button>
        )}
      </section>

      {/* 4 · Aportes y reconocimientos */}
      <section className="card space-y-4">
        <h2 className="section-title">4 · Aportes a la gestión de riesgos <span className="text-sm font-normal italic text-grafito-medio">(último día)</span></h2>
        <p className="text-xs text-grafito-medio">El responsable del aporte es el supervisor. Los reconocimientos se registran al término del turno.</p>
        {rit.aportes.map((ap, k) => (
          <div key={k} className="grid gap-2 rounded-lg bg-grafito-claro p-3 sm:grid-cols-[1fr_200px_160px_auto]">
            <input className="input" placeholder="Propuesta" value={ap.propuesta} onChange={(e) => set("aportes", rit.aportes.map((x, m) => (m === k ? { ...x, propuesta: e.target.value } : x)))} />
            <input className="input" placeholder="Responsable" value={ap.responsable} onChange={(e) => set("aportes", rit.aportes.map((x, m) => (m === k ? { ...x, responsable: e.target.value } : x)))} />
            <input type="date" className="input" value={ap.fecha} onChange={(e) => set("aportes", rit.aportes.map((x, m) => (m === k ? { ...x, fecha: e.target.value } : x)))} />
            <button type="button" className="text-xs font-semibold text-grafito-medio underline" onClick={() => set("aportes", rit.aportes.filter((_, m) => m !== k))}>Quitar</button>
          </div>
        ))}
        <button type="button" className="btn-ghost" onClick={() => set("aportes", [...rit.aportes, { propuesta: "", responsable: rit.supervisor, fecha: "" }])}>+ Agregar aporte</button>

        <h2 className="section-title pt-2">5 · Reconocimientos <span className="text-sm font-normal italic text-grafito-medio">(último día)</span></h2>
        {rit.reconocimientos.map((rc, k) => (
          <div key={k} className="grid gap-2 rounded-lg bg-grafito-claro p-3 sm:grid-cols-[220px_1fr_auto]">
            <input className="input" placeholder="Quién" value={rc.quien} onChange={(e) => set("reconocimientos", rit.reconocimientos.map((x, m) => (m === k ? { ...x, quien: e.target.value } : x)))} />
            <input className="input" placeholder="Motivo" value={rc.motivo} onChange={(e) => set("reconocimientos", rit.reconocimientos.map((x, m) => (m === k ? { ...x, motivo: e.target.value } : x)))} />
            <button type="button" className="text-xs font-semibold text-grafito-medio underline" onClick={() => set("reconocimientos", rit.reconocimientos.filter((_, m) => m !== k))}>Quitar</button>
          </div>
        ))}
        <button type="button" className="btn-ghost" onClick={() => set("reconocimientos", [...rit.reconocimientos, { quien: "", motivo: "" }])}>+ Agregar reconocimiento</button>
      </section>

      {/* Barra de envío */}
      <div className="fixed inset-x-0 bottom-[49px] z-10 border-t border-grafito-linea bg-white/95 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-xs text-grafito-medio">
            {cuenta("A")} act. turno A · {cuenta("B")} act. turno B · {rit.rfs.length} RF
            {totalNo > 0 && <b className="ml-1 text-naranjo-oscuro">· {totalNo} no preparada{totalNo > 1 ? "s" : ""}</b>}
            <span className="hidden sm:inline"> · borrador guardado en este equipo</span>
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-ghost hidden sm:inline-flex" onClick={() => { if (confirm("¿Borrar todo y comenzar una RIT nueva?")) { localStorage.removeItem(DRAFT_KEY); setRit(inicial()); } }}>
              Limpiar
            </button>
            <button type="button" className="btn-primary" disabled={enviando} onClick={enviar}>{enviando ? "Enviando…" : "Enviar RIT"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function SiNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean | null) => void }) {
  const opt = (v: boolean, t: string) => {
    const on = value === v;
    const color = v ? "bg-ok text-white border-ok" : "bg-naranjo text-white border-naranjo";
    return (
      <button type="button" aria-pressed={on} onClick={() => onChange(on ? null : v)} className={`w-14 rounded-md border py-1.5 text-sm font-bold transition ${on ? color : "border-grafito-linea bg-white text-grafito-medio"}`}>
        {t}
      </button>
    );
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-grafito-linea px-3 py-2">
      <span className="text-sm font-medium">{label}</span>
      <span className="flex gap-1.5">{opt(true, "SÍ")}{opt(false, "NO")}</span>
    </div>
  );
}
