"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Cartilla, CARTILLA_ANCHO_PX, type CartillaData } from "./Cartilla";
import { zonaDe, type Rect } from "./CartillaFoco";

const arr = <T,>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : []);

/** Completa lo que falte para que la cartilla se dibuje aunque el borrador venga incompleto. */
function normalizar(d: Record<string, unknown>): CartillaData {
  const txt = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");
  return {
    fecha: txt("fecha"),
    turno: txt("turno"),
    centroTrabajo: txt("centroTrabajo"),
    gerencia: txt("gerencia"),
    superintendencia: txt("superintendencia"),
    area: txt("area"),
    supervisor: txt("supervisor"),
    nAsistentes: typeof d.nAsistentes === "number" ? d.nAsistentes : 0,
    eecc: txt("eecc"),
    nContrato: txt("nContrato"),
    nombreContrato: txt("nombreContrato"),
    rfs: arr<string>(d.rfs),
    actividades: arr<Record<string, unknown>>(d.actividades).map((a) => ({
      descripcion: typeof a.descripcion === "string" ? a.descripcion : "",
      instructivos: (a.instructivos as boolean | null) ?? null,
      materiales: (a.materiales as boolean | null) ?? null,
      herramientas: (a.herramientas as boolean | null) ?? null,
      epp: (a.epp as boolean | null) ?? null,
      analisis: arr<Record<string, unknown>>(a.analisis).map((x) => ({
        rf: String(x.rf ?? ""),
        riesgo: String(x.riesgo ?? ""),
        consecuencia: String(x.consecuencia ?? ""),
        controles: arr<string>(x.controles),
      })),
    })),
    aportes: arr<{ propuesta: string; responsable: string; fecha: string | null }>(d.aportes),
    reconocimientos: arr<{ quien: string; motivo: string }>(d.reconocimientos),
  };
}

const hace = (iso: string | null, ahora: number) => {
  if (!iso) return "";
  const s = Math.max(0, Math.round((ahora - new Date(iso).getTime()) / 1000));
  if (s < 5) return "recién";
  if (s < 60) return `hace ${s} s`;
  const m = Math.round(s / 60);
  return m < 60 ? `hace ${m} min` : `hace ${Math.round(m / 60)} h`;
};

/**
 * Pantalla de proyección: muestra la cartilla en grande y la actualiza sola mientras
 * se llena desde un celular, marcando en naranjo la parte que se está editando.
 */
export function Proyector({ codigo }: { codigo: string }) {
  const [rit, setRit] = useState<CartillaData | null>(null);
  const [foco, setFoco] = useState("");
  const [estado, setEstado] = useState<"cargando" | "esperando" | "conectado" | "sin-red">("cargando");
  const [actualizado, setActualizado] = useState<string | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());
  const [ajuste, setAjuste] = useState<"hoja" | "ancho">("hoja");
  const version = useRef(0);

  // Consulta el borrador cada ~1 s (más lento si la pestaña no está visible).
  useEffect(() => {
    let activo = true;
    let t: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const r = await fetch(`/api/vivo/${codigo}?v=${version.current}`, { cache: "no-store" });
        if (r.status === 404) setEstado("esperando");
        else if (r.ok) {
          const d = await r.json();
          setEstado("conectado");
          setActualizado(d.actualizado);
          if (!d.sinCambios) {
            version.current = d.version;
            setRit(normalizar(d.datos ?? {}));
            setFoco(d.foco ?? "");
          }
        } else setEstado("sin-red");
      } catch {
        setEstado("sin-red");
      }
      if (activo) t = setTimeout(tick, document.hidden ? 5000 : 1000);
    };
    tick();
    const reloj = setInterval(() => setAhora(Date.now()), 1000);
    return () => {
      activo = false;
      clearTimeout(t);
      clearInterval(reloj);
    };
  }, [codigo]);

  const caja = useRef<HTMLDivElement>(null);
  const hoja = useRef<HTMLDivElement>(null);
  const [vista, setVista] = useState({ s: 0.5, w: 0, h: 0 });
  const [zona, setZona] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    const medir = () => {
      const c = caja.current;
      const art = hoja.current?.querySelector("article") as HTMLElement | null;
      if (!c || !art) return;
      const W = art.offsetWidth;
      const H = art.offsetHeight;
      const s = ajuste === "hoja" ? Math.min((c.clientWidth - 32) / W, (c.clientHeight - 32) / H) : (c.clientWidth - 32) / W;
      setVista({ s, w: W * s, h: H * s });
      const z = foco ? zonaDe(art, foco) : null;
      setZona(z);
      // En modo "ancho", desplaza la pantalla para que siempre se vea lo que se está editando.
      if (ajuste === "ancho" && z) {
        const y = z.y * s + 16 - c.clientHeight / 2 + (z.h * s) / 2;
        c.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    };
    medir();
    const ro = new ResizeObserver(medir);
    if (caja.current) ro.observe(caja.current);
    const art = hoja.current?.querySelector("article");
    if (art) ro.observe(art);
    document.fonts?.ready.then(medir).catch(() => {});
    return () => ro.disconnect();
  }, [rit, foco, ajuste]);

  const pantallaCompleta = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const punto = estado === "conectado" ? "bg-ok" : estado === "sin-red" ? "bg-naranjo" : "bg-white/50";
  const texto =
    estado === "conectado" ? `En vivo · actualizado ${hace(actualizado, ahora)}` : estado === "sin-red" ? "Sin conexión · reintentando…" : estado === "esperando" ? "Esperando al celular…" : "Conectando…";

  return (
    <div className="flex h-[100dvh] flex-col bg-[#2B2B2B] text-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-naranjo bg-grafito px-4 py-2">
        <div className="flex items-center gap-3">
          <img src="/logos/codelco.png" alt="Codelco" className="h-8 w-auto rounded bg-white p-0.5" />
          <div className="leading-tight">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">RIT en vivo · Radomiro Tomic</p>
            <p className="text-sm font-bold">
              Código <span className="font-mono tracking-[0.2em] text-naranjo">{codigo}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${punto} ${estado === "conectado" ? "animate-pulse" : ""}`} />
            {texto}
          </span>
          <button type="button" className="rounded-md bg-white/10 px-3 py-1.5 font-semibold hover:bg-white/20" onClick={() => setAjuste(ajuste === "hoja" ? "ancho" : "hoja")}>
            {ajuste === "hoja" ? "Ajustar al ancho" : "Ver hoja completa"}
          </button>
          <button type="button" className="rounded-md bg-naranjo px-3 py-1.5 font-semibold hover:bg-naranjo-oscuro" onClick={pantallaCompleta}>
            Pantalla completa
          </button>
        </div>
      </header>

      <div ref={caja} className={`relative flex-1 ${ajuste === "ancho" ? "overflow-y-auto" : "overflow-hidden"}`}>
        {rit ? (
          <div className="mx-auto my-4" style={{ width: vista.w || undefined, height: vista.h || undefined }}>
            <div ref={hoja} className="relative shadow-2xl" style={{ width: CARTILLA_ANCHO_PX, transform: `scale(${vista.s})`, transformOrigin: "0 0" }}>
              <Cartilla rit={rit} borrador />
              {zona && (
                <div
                  className="pointer-events-none absolute rounded-md bg-naranjo/10 transition-all duration-300 ease-out"
                  style={{ left: zona.x - 4, top: zona.y - 4, width: zona.w + 8, height: zona.h + 8, boxShadow: `0 0 0 ${Math.max(3, 3 / vista.s)}px #E4450D` }}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-2xl font-bold">{estado === "esperando" ? "Esperando que el celular comience a proyectar" : "Conectando…"}</p>
            <p className="max-w-xl text-white/75">
              En el celular, abra <b>Nueva RIT</b>, toque <b>Proyectar</b> y use el código <span className="font-mono font-bold tracking-[0.2em] text-naranjo">{codigo}</span>. La cartilla aparecerá aquí y se actualizará sola.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
