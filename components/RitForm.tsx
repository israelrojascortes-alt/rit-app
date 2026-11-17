"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RF, RF_BY_CODE } from "@/lib/rf";
import { CartillaPreview } from "./CartillaPreview";
import { CartillaFoco, type Foco } from "./CartillaFoco";
import {
  ITEMS_PREPARACION,
  MAX_ACTIVIDADES_POR_TURNO,
  MAX_ANALISIS_POR_ACTIVIDAD,
  noPreparada,
  type ActividadInput,
  type AnalisisInput,
  type ItemKey,
  type RitInput,
  type Turno,
} from "@/lib/validacion";

type FormRit = Omit<RitInput, "turno"> & { turno: Turno | "" };
const DRAFT_KEY = "rit-borrador-v2";
/** Marca un control del formulario con la zona de la cartilla que modifica (para la vista en vivo enfocada). */
const f = (sel: string, titulo: string) => ({ "data-foco": sel, "data-foco-titulo": titulo });
const enAct = (i: number, c: string) => c.split(",").map((x) => `tr[data-act="${i}"] [data-c~="${x.trim()}"]`).join(", ");
const enAn = (i: number, j: number, c: string) => c.split(",").map((x) => `tr[data-act="${i}"][data-an="${j}"] [data-c~="${x.trim()}"]`).join(", ");

const ALFABETO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const nuevoCodigo = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (n) => ALFABETO[n % ALFABETO.length]).join("");
const VIVO_KEY = "rit-vivo-codigo";

const hoy = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const nuevaActividad = (): ActividadInput => ({
  descripcion: "",
  instructivos: null,
  materiales: null,
  herramientas: null,
  epp: null,
  analisis: [{ rf: "", riesgo: "", consecuencia: "", controles: [] }],
});

const inicial = (): FormRit => ({
  fecha: hoy(),
  turno: "",
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
  actividades: [nuevaActividad()],
  aportes: [],
  reconocimientos: [],
});

export default function RitForm() {
  const router = useRouter();
  const [rit, setRit] = useState<FormRit>(inicial);
  const [verPrevia, setVerPrevia] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [cargado, setCargado] = useState(false);
  const [foco, setFoco] = useState<Foco>(null);
  const [enVivo, setEnVivo] = useState(true);
  // Proyección en pantalla grande: el borrador se envía al servidor y la sala lo ve en /vivo/<código>.
  const [codigoVivo, setCodigoVivo] = useState<string | null>(null);
  const [verProyectar, setVerProyectar] = useState(false);
  const [sync, setSync] = useState<"ok" | "enviando" | "error">("ok");

  useEffect(() => {
    try { setCodigoVivo(localStorage.getItem(VIVO_KEY)); } catch {}
  }, []);
  const iniciarProyeccion = () => {
    const c = nuevoCodigo();
    setCodigoVivo(c);
    try { localStorage.setItem(VIVO_KEY, c); } catch {}
  };
  const detenerProyeccion = () => {
    setCodigoVivo(null);
    try { localStorage.removeItem(VIVO_KEY); } catch {}
  };

  useEffect(() => {
    try { if (localStorage.getItem("rit-en-vivo") === "0") setEnVivo(false); } catch {}
  }, []);
  const cambiarEnVivo = (v: boolean) => {
    setEnVivo(v);
    try { localStorage.setItem("rit-en-vivo", v ? "1" : "0"); } catch {}
  };
  // El control tocado (o su contenedor más cercano) dice qué parte de la cartilla enfocar.
  const alTocar = (e: React.SyntheticEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-foco]");
    if (el?.dataset.foco) setFoco({ sel: el.dataset.foco, titulo: el.dataset.focoTitulo ?? "" });
  };

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

  // Cada cambio (y el campo tocado) se envía a la pantalla medio segundo después de dejar de escribir.
  useEffect(() => {
    if (!codigoVivo || !cargado) return;
    setSync("enviando");
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/vivo/${codigoVivo}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ datos: rit, foco: foco?.sel ?? "" }) });
        setSync(r.ok ? "ok" : "error");
      } catch {
        setSync("error");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [rit, foco, codigoVivo, cargado]);

  const set = <K extends keyof FormRit>(k: K, v: FormRit[K]) => setRit((r) => ({ ...r, [k]: v }));
  const turno = rit.turno || "";

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
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:items-start xl:gap-6">
    <div className="space-y-5 pb-24 max-xl:[&_input]:scroll-mt-[36vh] max-xl:[&_textarea]:scroll-mt-[36vh] max-xl:[&_select]:scroll-mt-[36vh]" onFocusCapture={alTocar} onPointerDownCapture={alTocar}>
      {enVivo ? (
        <CartillaFoco rit={rit} foco={foco} onAbrir={() => setVerPrevia(true)} onOcultar={() => cambiarEnVivo(false)} />
      ) : (
        <button type="button" className="sticky top-0 z-20 w-full rounded-b-xl bg-grafito-claro/95 py-2 text-xs font-bold text-naranjo-oscuro backdrop-blur xl:hidden" onClick={() => cambiarEnVivo(true)}>
          Mostrar cartilla en vivo
        </button>
      )}
      {errores.length > 0 && (
        <div className="rounded-xl border border-naranjo bg-naranjo-claro p-4 text-sm text-naranjo-oscuro" role="alert">
          <p className="mb-1 font-bold">Revise lo siguiente antes de enviar:</p>
          <ul className="list-disc pl-5">{errores.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      {/* 1 · Identificación */}
      <section className="card space-y-4" {...f('[data-k="centroTrabajo"], [data-k="nombreContrato"]', "Identificación")}>
        <h2 className="section-title">1 · Identificación</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Campo label="Fecha" foco={f('[data-k="fecha"]', "Fecha")}><input type="date" className="input" value={rit.fecha} onChange={(e) => set("fecha", e.target.value)} /></Campo>
          <div {...f('[data-c="banda"]', "Turno")}>
            <span className="label">Turno *</span>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Turno">
              {(["A", "B"] as Turno[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={rit.turno === t}
                  onClick={() => set("turno", t)}
                  className={`rounded-lg border py-2.5 text-[15px] font-bold transition ${rit.turno === t ? "border-naranjo bg-naranjo text-white" : "border-grafito-linea bg-white text-grafito hover:bg-grafito-claro"}`}
                >
                  Turno {t}
                </button>
              ))}
            </div>
          </div>
          <Campo label="Centro de trabajo" foco={f('[data-k="centroTrabajo"]', "Centro de trabajo")}><input className="input" value={rit.centroTrabajo} onChange={(e) => set("centroTrabajo", e.target.value)} /></Campo>
          <Campo label="Gerencia *" foco={f('[data-k="gerencia"]', "Gerencia")}><input className="input" value={rit.gerencia} onChange={(e) => set("gerencia", e.target.value)} placeholder="Ej.: GMM" /></Campo>
          <Campo label="Superintendencia / Dirección" foco={f('[data-k="superintendencia"]', "Superintendencia / Dirección")}><input className="input" value={rit.superintendencia} onChange={(e) => set("superintendencia", e.target.value)} /></Campo>
          <Campo label="Área / Frente de trabajo *" className="sm:col-span-2" foco={f('[data-k="area"]', "Área / Frente de trabajo")}><input className="input" value={rit.area} onChange={(e) => set("area", e.target.value)} /></Campo>
          <Campo label="Supervisor a cargo *" foco={f('[data-k="supervisor"]', "Supervisor a cargo")}><input className="input" value={rit.supervisor} onChange={(e) => set("supervisor", e.target.value)} autoComplete="name" /></Campo>
          <Campo label="N.º de asistentes *" foco={f('[data-k="nAsistentes"]', "N.º de asistentes")}>
            <input type="number" inputMode="numeric" min={1} className="input" value={rit.nAsistentes || ""} onChange={(e) => set("nAsistentes", Number(e.target.value))} />
          </Campo>
          <Campo label="Empresa contratista (EE.CC.)" foco={f('[data-k="eecc"]', "Empresa contratista")}><input className="input" value={rit.eecc} onChange={(e) => set("eecc", e.target.value)} /></Campo>
          <Campo label="N.º de contrato" foco={f('[data-k="nContrato"]', "N.º de contrato")}><input className="input" inputMode="numeric" value={rit.nContrato} onChange={(e) => set("nContrato", e.target.value)} /></Campo>
          <Campo label="Nombre del contrato" className="sm:col-span-2" foco={f('[data-k="nombreContrato"]', "Nombre del contrato")}><input className="input" value={rit.nombreContrato} onChange={(e) => set("nombreContrato", e.target.value)} /></Campo>
        </div>
      </section>

      {/* 2 · RF del turno */}
      <section className="card space-y-3" {...f('[data-z="rf"]', "Riesgos de fatalidad del turno")}>
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
                {...f(`[data-rf="${r.code}"]`, `${r.code} · ${r.name}`)}
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
        <p className="text-sm text-grafito-medio">
          {rit.turno ? <>Turno <b>{rit.turno}</b> · {rit.actividades.length} de {MAX_ACTIVIDADES_POR_TURNO} actividades</> : "Elija el turno en la sección 1."}
        </p>

        {rit.actividades.length === 0 && <p className="text-sm text-grafito-medio">Sin actividades registradas.</p>}

        {rit.actividades.map((a, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-grafito-linea p-3 sm:p-4" {...f(enAct(i, "desc, prep"), `Actividad ${turno}${i + 1}`)}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-naranjo-oscuro">Actividad {turno}{i + 1}</span>
              <button type="button" className="text-xs font-semibold text-grafito-medio underline" onClick={() => set("actividades", rit.actividades.filter((_, k) => k !== i))}>
                Quitar
              </button>
            </div>
            <textarea {...f(enAct(i, "desc"), `Actividad ${turno}${i + 1} · descripción`)} className="input min-h-[64px]" placeholder="Describa la actividad (igual que en la ART)" value={a.descripcion} onChange={(e) => updAct(i, { descripcion: e.target.value })} />

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
                  <div key={j} className="space-y-2 rounded-lg bg-grafito-claro p-3" {...f(enAn(i, j, "rf, riesgo"), `Actividad ${turno}${i + 1} · riesgo ${j + 1}`)}>
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
                    <input {...f(enAn(i, j, "cons"), `Actividad ${turno}${i + 1} · consecuencia ${j + 1}`)} className="input" placeholder="Consecuencia" value={an.consecuencia} onChange={(e) => updAn(i, j, { consecuencia: e.target.value })} />
                    {rf && (
                      <fieldset {...f(enAn(i, j, "ctrl"), `Actividad ${turno}${i + 1} · controles críticos ${j + 1}`)}>
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

        {rit.actividades.length < MAX_ACTIVIDADES_POR_TURNO && (
          <button type="button" className="btn-dark w-full" {...f(enAct(rit.actividades.length, "desc, prep"), `Actividad ${turno}${rit.actividades.length + 1}`)} onClick={() => set("actividades", [...rit.actividades, nuevaActividad()])}>
            + Agregar actividad{rit.turno ? ` al turno ${rit.turno}` : ""}
          </button>
        )}
      </section>

      {/* 4 · Aportes y reconocimientos */}
      <section className="card space-y-4" {...f('[data-z="aportes"], [data-z="recon"]', "Aportes y reconocimientos")}>
        <h2 className="section-title">4 · Aportes a la gestión de riesgos <span className="text-sm font-normal italic text-grafito-medio">(último día)</span></h2>
        <p className="text-xs text-grafito-medio">El responsable del aporte es el supervisor. Los reconocimientos se registran al término del turno.</p>
        {rit.aportes.map((ap, k) => (
          <div key={k} className="grid gap-2 rounded-lg bg-grafito-claro p-3 sm:grid-cols-[1fr_200px_160px_auto]" {...f(`[data-z="aportes"] tr[data-i="${k}"]`, `Aporte ${k + 1}`)}>
            <input className="input" placeholder="Propuesta" value={ap.propuesta} onChange={(e) => set("aportes", rit.aportes.map((x, m) => (m === k ? { ...x, propuesta: e.target.value } : x)))} />
            <input className="input" placeholder="Responsable" value={ap.responsable} onChange={(e) => set("aportes", rit.aportes.map((x, m) => (m === k ? { ...x, responsable: e.target.value } : x)))} />
            <input type="date" className="input" value={ap.fecha} onChange={(e) => set("aportes", rit.aportes.map((x, m) => (m === k ? { ...x, fecha: e.target.value } : x)))} />
            <button type="button" className="text-xs font-semibold text-grafito-medio underline" onClick={() => set("aportes", rit.aportes.filter((_, m) => m !== k))}>Quitar</button>
          </div>
        ))}
        <button type="button" className="btn-ghost" onClick={() => set("aportes", [...rit.aportes, { propuesta: "", responsable: rit.supervisor, fecha: "" }])}>+ Agregar aporte</button>

        <h2 className="section-title pt-2">5 · Reconocimientos <span className="text-sm font-normal italic text-grafito-medio">(último día)</span></h2>
        {rit.reconocimientos.map((rc, k) => (
          <div key={k} className="grid gap-2 rounded-lg bg-grafito-claro p-3 sm:grid-cols-[220px_1fr_auto]" {...f(`[data-z="recon"] tr[data-i="${k}"]`, `Reconocimiento ${k + 1}`)}>
            <input className="input" placeholder="Quién" value={rc.quien} onChange={(e) => set("reconocimientos", rit.reconocimientos.map((x, m) => (m === k ? { ...x, quien: e.target.value } : x)))} />
            <input className="input" placeholder="Motivo" value={rc.motivo} onChange={(e) => set("reconocimientos", rit.reconocimientos.map((x, m) => (m === k ? { ...x, motivo: e.target.value } : x)))} />
            <button type="button" className="text-xs font-semibold text-grafito-medio underline" onClick={() => set("reconocimientos", rit.reconocimientos.filter((_, m) => m !== k))}>Quitar</button>
          </div>
        ))}
        <button type="button" className="btn-ghost" {...f('[data-z="recon"]', "Reconocimientos")} onClick={() => set("reconocimientos", [...rit.reconocimientos, { quien: "", motivo: "" }])}>+ Agregar reconocimiento</button>
      </section>

      {/* Barra de envío */}
      <div className="fixed inset-x-0 bottom-[49px] z-10 border-t border-grafito-linea bg-white/95 backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-[1680px] items-center justify-end gap-3 px-4 py-3 sm:justify-between sm:px-6">
          <p className="hidden text-xs text-grafito-medio sm:block">
            {rit.turno ? `Turno ${rit.turno} · ` : ""}{rit.actividades.length} actividad{rit.actividades.length === 1 ? "" : "es"} · {rit.rfs.length} RF
            {totalNo > 0 && <b className="ml-1 text-naranjo-oscuro">· {totalNo} no preparada{totalNo > 1 ? "s" : ""}</b>}
            <span className="hidden sm:inline"> · borrador guardado en este equipo</span>
          </p>
          <div className="flex gap-2">
            <button type="button" className={`btn-ghost whitespace-nowrap ${codigoVivo ? "border-naranjo text-naranjo-oscuro" : ""}`} onClick={() => setVerProyectar(true)}>
              {codigoVivo ? (<><span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${sync === "error" ? "bg-naranjo" : "animate-pulse bg-ok"}`} />{codigoVivo}</>) : "Proyectar"}
            </button>
            <button type="button" className="btn-ghost hidden whitespace-nowrap sm:inline-flex xl:hidden" onClick={() => setVerPrevia(true)}>Ver cartilla</button>
            <button type="button" className="btn-ghost hidden sm:inline-flex" onClick={() => { if (confirm("¿Borrar todo y comenzar una RIT nueva?")) { localStorage.removeItem(DRAFT_KEY); setRit(inicial()); } }}>
              Limpiar
            </button>
            <button type="button" className="btn-primary whitespace-nowrap" disabled={enviando} onClick={enviar}>{enviando ? "Enviando…" : "Enviar RIT"}</button>
          </div>
        </div>
      </div>
    </div>

      {/* Vista previa en vivo: columna fija en pantallas grandes */}
      <aside className="sticky top-4 hidden pb-24 xl:block">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="eyebrow">Vista previa de la cartilla</p>
          <span className="text-xs text-grafito-medio">Se actualiza mientras escribe</span>
        </div>
        <CartillaPreview rit={rit} />
      </aside>

      {/* Proyectar en pantalla grande */}
      {verProyectar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" role="dialog" aria-modal="true" aria-label="Proyectar en pantalla" onClick={() => setVerProyectar(false)}>
          <div className="w-full max-w-md space-y-4 rounded-t-2xl bg-white p-5 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Pantalla de la sala</p>
                <h2 className="text-lg font-bold">Proyectar la cartilla en vivo</h2>
              </div>
              <button type="button" className="text-sm font-semibold underline" onClick={() => setVerProyectar(false)}>Cerrar</button>
            </div>
            {codigoVivo ? (
              <>
                <p className="text-sm text-grafito-medio">En el computador del proyector o la TV, abra esta dirección. La cartilla se verá en grande y cambiará a medida que usted escribe.</p>
                <div className="rounded-xl bg-grafito-claro p-4 text-center">
                  <p className="break-all font-semibold text-grafito">{typeof window !== "undefined" ? window.location.host : ""}/vivo</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-grafito-medio">Código</p>
                  <p className="font-mono text-4xl font-bold tracking-[0.3em] text-naranjo">{codigoVivo}</p>
                </div>
                <p className="flex items-center gap-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${sync === "error" ? "bg-naranjo" : "animate-pulse bg-ok"}`} />
                  {sync === "error" ? "No se pudo enviar el último cambio; se reintentará con el próximo." : sync === "enviando" ? "Enviando cambios…" : "Proyectando: los cambios se ven en la pantalla."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-dark"
                    onClick={() => {
                      const url = `${window.location.origin}/vivo/${codigoVivo}`;
                      if (navigator.share) navigator.share({ title: "RIT en vivo", url }).catch(() => {});
                      else navigator.clipboard?.writeText(url).catch(() => {});
                    }}
                  >
                    Compartir enlace
                  </button>
                  <button type="button" className="btn-ghost" onClick={detenerProyeccion}>Detener proyección</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-grafito-medio">Muestre la cartilla en el proyector o la TV de la sala mientras la llena desde este celular, como una presentación en línea. Se generará un código para abrir en la pantalla.</p>
                <button type="button" className="btn-primary w-full" onClick={iniciarProyeccion}>Comenzar a proyectar</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Vista previa en celular y tablet: pantalla completa con desplazamiento */}
      {verPrevia && (
        <div className="fixed inset-0 z-40 flex flex-col bg-grafito-claro xl:hidden" role="dialog" aria-modal="true" aria-label="Vista previa de la cartilla">
          <div className="flex items-center justify-between bg-white px-4 py-3">
            <p className="font-bold">Vista previa de la cartilla</p>
            <button type="button" className="btn-dark" onClick={() => setVerPrevia(false)}>Cerrar</button>
          </div>
          <p className="bg-white px-4 pb-2 text-xs text-grafito-medio">Deslice para recorrer la hoja completa.</p>
          <div className="flex-1 overflow-auto p-3">
            <div className="w-[1100px]">
              <CartillaPreview rit={rit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Campo({ label, className = "", foco, children }: { label: string; className?: string; foco?: Record<string, string>; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`} {...foco}>
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
