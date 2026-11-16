"use client";

import { useEffect, useRef, useState } from "react";
import { Cartilla, CARTILLA_ANCHO_PX, type CartillaData } from "./Cartilla";

/** Dibuja la cartilla A3 escalada al ancho disponible. Se actualiza en vivo con cada cambio del formulario. */
export function CartillaPreview({ rit }: { rit: CartillaData }) {
  const caja = useRef<HTMLDivElement>(null);
  const hoja = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.4);
  const [alto, setAlto] = useState(0);

  useEffect(() => {
    const medir = () => {
      if (!caja.current || !hoja.current) return;
      const s = caja.current.clientWidth / CARTILLA_ANCHO_PX;
      setEscala(s);
      setAlto(hoja.current.offsetHeight * s);
    };
    medir();
    const ro = new ResizeObserver(medir);
    if (caja.current) ro.observe(caja.current);
    if (hoja.current) ro.observe(hoja.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={caja} className="w-full overflow-hidden rounded-lg bg-white shadow ring-1 ring-black/10" style={{ height: alto || undefined }}>
      <div ref={hoja} style={{ width: CARTILLA_ANCHO_PX, transform: `scale(${escala})`, transformOrigin: "top left" }}>
        <Cartilla rit={rit} borrador />
      </div>
    </div>
  );
}
