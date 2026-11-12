import { Shell } from "@/components/Shell";
import GuiaRF from "@/components/GuiaRF";

export const metadata = { title: "Guía RF" };

export default function Guia() {
  return (
    <Shell eyebrow="Guía de consulta" title="Riesgos de fatalidad: evento top, energía y controles críticos">
      <GuiaRF />
      <p className="mt-6 text-xs text-grafito-medio">Fuente: Línea Base RF v2 (05-10-2026), estándares SIGO-ECC-003 vigentes · © 2026 Codelco Chile · Uso interno</p>
    </Shell>
  );
}
