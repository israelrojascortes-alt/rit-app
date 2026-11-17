"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Cartilla, CARTILLA_ANCHO_PX, type CartillaData } from "./Cartilla";

/** Zona de la cartilla que se está editando: selector CSS de las celdas y un título corto. */
export type Foco = { sel: string; titulo: string } | null;

type Rect = { x: number; y: number; w: number; h: number };

const MAX_ESCALA = 1.15;
const MARGEN = 10; // px de la hoja alrededor de la zona

/** Posición de un elemento dentro de la hoja, sin considerar escalas (medidas de diseño, no de pantalla). */
function posicion(el: HTMLElement, raiz: HTMLElement): Rect {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== raiz) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/**
 * Franja en vivo para celular: muestra ampliada solo la parte de la cartilla que se está llenando
 * y la marca en naranjo. Se mueve sola al cambiar de campo.
 */
export function CartillaFoco({ rit, foco, onAbrir, onOcultar }: { rit: CartillaData; foco: Foco; onAbrir: () => void; onOcultar: () => void }) {
  const caja = useRef<HTMLDivElement>(null);
  const hoja = useRef<HTMLDivElement>(null);
  const [vista, setVista] = useState<{ tx: number; ty: number; s: number; alto: number; zona: Rect | null }>({ tx: 0, ty: 0, s: 0.22, alto: 90, zona: null });

  useLayoutEffect(() => {
    const medir = () => {
      const c = caja.current;
      const h = hoja.current;
      const art = h?.querySelector("article") as HTMLElement | null;
      if (!c || !h || !art) return;
      const ancho = c.clientWidth;
      const els = foco ? Array.from(art.querySelectorAll<HTMLElement>(foco.sel)) : [];
      let zona: Rect | null = null;
      if (els.length) {
        const rs = els.map((e) => posicion(e, art));
        const x0 = Math.min(...rs.map((r) => r.x));
        const y0 = Math.min(...rs.map((r) => r.y));
        const x1 = Math.max(...rs.map((r) => r.x + r.w));
        const y1 = Math.max(...rs.map((r) => r.y + r.h));
        zona = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      }
      const r = zona ?? { x: 0, y: 0, w: art.offsetWidth, h: art.offsetHeight };
      const rx = r.x - MARGEN;
      const ry = r.y - MARGEN;
      const rw = r.w + MARGEN * 2;
      const rh = r.h + MARGEN * 2;
      const s = Math.min(ancho / rw, MAX_ESCALA);
      const altoMax = Math.round(window.innerHeight * 0.3);
      const alto = zona ? Math.min(Math.max(rh * s, 64), altoMax) : Math.min(art.offsetHeight * s, altoMax);
      const tx = rx * s - Math.max(0, (ancho - rw * s) / 2);
      const ty = zona ? ry * s - Math.max(0, (alto - rh * s) / 2) : 0;
      setVista({ tx: Math.max(0, tx), ty: Math.max(0, ty), s, alto, zona });
    };
    medir();
    // Se vuelve a medir si cambia el ancho de pantalla o la hoja (p. ej., al terminar de cargar la tipografía).
    const ro = new ResizeObserver(medir);
    if (caja.current) ro.observe(caja.current);
    const art = hoja.current?.querySelector("article");
    if (art) ro.observe(art);
    document.fonts?.ready.then(medir).catch(() => {});
    return () => ro.disconnect();
  }, [foco, rit]);

  const { tx, ty, s, alto, zona } = vista;

  return (
    <div className="sticky top-0 z-20 -mt-1 mb-1 rounded-b-xl bg-grafito-claro/95 pb-2 pt-1 backdrop-blur xl:hidden">
      <div className="mb-1 flex items-center justify-between gap-2 px-0.5 text-xs">
        <span className="flex min-w-0 items-center gap-1.5 font-bold text-naranjo-oscuro">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-naranjo" />
          <span className="truncate">EN VIVO · {foco?.titulo || "Toque un campo para enfocar la cartilla"}</span>
        </span>
        <span className="flex shrink-0 gap-3 font-semibold text-grafito">
          <button type="button" className="underline" onClick={onAbrir}>Ver hoja</button>
          <button type="button" className="underline" onClick={onOcultar}>Ocultar</button>
        </span>
      </div>
      <div
        ref={caja}
        className="relative overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/10 transition-[height] duration-300 ease-out"
        style={{ height: alto }}
        aria-label="Vista en vivo de la cartilla"
      >
        <div
          ref={hoja}
          className="absolute left-0 top-0 transition-transform duration-300 ease-out"
          style={{ width: CARTILLA_ANCHO_PX, transform: `translate(${-tx}px, ${-ty}px) scale(${s})`, transformOrigin: "0 0" }}
        >
          <Cartilla rit={rit} borrador />
          {zona && (
            <div
              className="pointer-events-none absolute rounded-[4px] transition-all duration-300"
              style={{ left: zona.x - 3, top: zona.y - 3, width: zona.w + 6, height: zona.h + 6, boxShadow: `0 0 0 ${Math.max(2, 2.5 / s)}px #E4450D` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
