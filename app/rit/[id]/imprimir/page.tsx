/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerRit } from "@/lib/rit-repo";
import { RF } from "@/lib/rf";
import { ITEMS_PREPARACION } from "@/lib/validacion";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cartilla RIT" };

const Box = ({ on }: { on?: boolean | null }) => (
  <span className={`inline-flex h-[3.2mm] w-[3.2mm] items-center justify-center border border-grafito text-[2.6mm] font-bold leading-none ${on ? "bg-grafito text-white" : ""}`}>{on ? "✓" : ""}</span>
);

export default async function Imprimir({ params }: { params: { id: string } }) {
  const rit = await obtenerRit(Number(params.id));
  if (!rit) notFound();
  const filas = 6;
  const td = "border border-[#BDBDBD] px-[1.2mm] align-middle";
  const th = "border border-[#BDBDBD] bg-grafito px-[1mm] py-[0.8mm] text-center font-bold text-white";

  return (
    <div className="bg-grafito-claro print:bg-white">
      <style>{`@page { size: A3 landscape; margin: 7mm; } @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
      <div className="no-print mx-auto flex max-w-[406mm] items-center justify-between gap-3 px-4 py-3">
        <Link href={`/rit/${rit.id}`} className="btn-ghost">← Volver</Link>
        <p className="hidden text-sm text-grafito-medio sm:block">En el diálogo de impresión elija «Guardar como PDF», tamaño A3 horizontal.</p>
        <PrintButton />
      </div>

      <article className="mx-auto w-[406mm] bg-white text-[2.75mm] leading-tight text-[#2B2B2B] shadow print:w-full print:shadow-none">
        {/* Encabezado institucional */}
        <header className="flex items-center justify-between px-[7mm] pb-[2mm] pt-[3mm]">
          <div className="flex items-center gap-[3mm]">
            <img src="/logos/codelco.png" alt="Codelco" className="h-[11mm] w-auto" />
            <span className="h-[9mm] w-[0.5mm] bg-naranjo" />
            <div><p className="text-[2.3mm] font-bold uppercase tracking-[0.18em] text-grafito-medio">División</p><p className="text-[5mm] font-bold text-grafito">Radomiro Tomic</p></div>
          </div>
          <div className="text-right"><p className="text-[3.4mm] font-bold">Gerencia de Seguridad y Salud Ocupacional</p><p className="text-grafito-medio">RIT N.º {rit.id} · enviada {new Date(rit.creadoEn).toLocaleString("es-CL")}</p></div>
        </header>
        <div className="flex items-center justify-between bg-naranjo px-[7mm] py-[2mm] text-white">
          <h1 className="text-[5.6mm] font-bold">REUNIÓN DE INICIO DE TURNO (RIT)</h1>
          <span className="text-[2.6mm] font-bold tracking-[0.2em]">CARTILLA</span>
        </div>

        <div className="space-y-[3mm] px-[7mm] py-[3mm]">
          {/* Identificación */}
          <table className="w-full table-fixed border-collapse">
            <tbody>
              {[
                [["Centro de trabajo", rit.centroTrabajo], ["Gerencia", rit.gerencia], ["Superintendencia / Dirección", rit.superintendencia], ["Área / Frente de trabajo", rit.area]],
                [["Fecha", rit.fecha], ["Supervisor a cargo", rit.supervisor], ["N.º de asistentes", String(rit.nAsistentes)], ["Nombre de EE.CC.", rit.eecc]],
                [["N.º de contrato", rit.nContrato], ["Nombre del contrato", rit.nombreContrato], ["", ""], ["", ""]],
              ].map((row, i) => (
                <tr key={i}>{row.map(([k, v], j) => <td key={j} className={`${td} h-[6mm]`}>{k && <><b className="text-grafito">{k}:</b> {v}</>}</td>)}</tr>
              ))}
            </tbody>
          </table>

          {/* RF */}
          <div className="rounded-[1.5mm] bg-grafito-claro px-[3mm] py-[2mm]">
            <p className="mb-[1.5mm] font-bold tracking-wide text-grafito"><span className="mr-[1.5mm] inline-block h-[2.4mm] w-[2.4mm] bg-naranjo" />RIESGOS DE FATALIDAD PRESENTES EN EL TURNO</p>
            <div className="grid grid-cols-7 gap-x-[3mm] gap-y-[1.4mm]">
              {RF.map((r) => (
                <div key={r.code} className="flex items-center gap-[1.4mm]"><Box on={rit.rfs.includes(r.code)} /><b className="text-naranjo-oscuro">{r.code}</b><span className="truncate">{r.name}</span></div>
              ))}
            </div>
          </div>

          {/* Actividades */}
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[44mm]" />{ITEMS_PREPARACION.map((i) => <col key={i.key} className="w-[21mm]" />)}<col className="w-[13mm]" /><col className="w-[68mm]" /><col className="w-[68mm]" /><col />
            </colgroup>
            <thead>
              <tr><th rowSpan={2} className={th}>ACTIVIDAD</th><th colSpan={4} className={th}>¿ESTAMOS PREPARADOS PARA EJECUTARLA?</th><th colSpan={4} className={`${th} bg-naranjo`}>ANÁLISIS DE RIESGO Y CONTROLES</th></tr>
              <tr>{ITEMS_PREPARACION.map((i) => <th key={i.key} className={`${th} text-[2.3mm]`}>{i.label.toUpperCase()}</th>)}{["RF N.º", "RIESGO / EVENTO TOP", "CONSECUENCIA", "CONTROLES CRÍTICOS VERIFICADOS"].map((h) => <th key={h} className={`${th} bg-naranjo-oscuro`}>{h}</th>)}</tr>
            </thead>
            {(["A", "B"] as const).map((t) => {
              const acts = rit.actividades.filter((a) => a.turno === t);
              return (
                <tbody key={t}>
                  <tr><td colSpan={9} className={`${td} bg-grafito-claro py-[0.8mm] font-bold tracking-wide`}><span className="mr-[1.5mm] inline-block h-[2.2mm] w-[2.2mm] bg-naranjo" />TURNO {t}</td></tr>
                  {Array.from({ length: filas }).map((_, k) => {
                    const a = acts[k];
                    const ans = a?.analisis.length ? a.analisis : [undefined];
                    const rows = Math.max(2, ans.length);
                    return Array.from({ length: rows }).map((__, m) => {
                      const x = a?.analisis[m];
                      return (
                        <tr key={`${k}-${m}`} className={m === 0 ? "border-t-[0.4mm] border-t-grafito" : ""}>
                          {m === 0 && <td rowSpan={rows} className={`${td} align-top`}><b className="text-naranjo-oscuro">{t}{k + 1}</b> {a?.descripcion}</td>}
                          {m === 0 && ITEMS_PREPARACION.map((it) => (
                            <td key={it.key} rowSpan={rows} className={`${td} text-center`}>
                              <span className="inline-flex items-center gap-[1mm] text-[2.3mm] font-bold text-grafito-medio">SÍ <Box on={a?.[it.key] === true} /> NO <Box on={a?.[it.key] === false} /></span>
                            </td>
                          ))}
                          <td className={`${td} h-[5.2mm] font-bold text-naranjo-oscuro`}>{x?.rf}</td><td className={td}>{x?.riesgo}</td><td className={td}>{x?.consecuencia}</td><td className={td}>{x?.controles.join(", ")}</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              );
            })}
          </table>

          {/* Aportes y reconocimientos */}
          <div className="grid grid-cols-[60%_1fr] gap-[5mm]">
            {[
              { t: "APORTES A LA GESTIÓN DE RIESGOS (ÚLTIMO DÍA)", h: ["PROPUESTA", "RESPONSABLE", "FECHA"], rows: rit.aportes.map((a) => [a.propuesta, a.responsable, a.fecha ?? ""]) },
              { t: "RECONOCIMIENTOS (ÚLTIMO DÍA)", h: ["QUIÉN", "MOTIVO"], rows: rit.reconocimientos.map((r) => [r.quien, r.motivo]) },
            ].map((b) => (
              <div key={b.t}>
                <p className="mb-[1mm] font-bold tracking-wide text-grafito"><span className="mr-[1.5mm] inline-block h-[2.2mm] w-[2.2mm] bg-naranjo" />{b.t}</p>
                <table className="w-full border-collapse">
                  <thead><tr>{b.h.map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
                  <tbody>{Array.from({ length: Math.max(3, b.rows.length) }).map((_, i) => <tr key={i}>{b.h.map((h, j) => <td key={h} className={`${td} h-[5mm]`}>{b.rows[i]?.[j]}</td>)}</tr>)}</tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        <footer className="flex items-center justify-between border-b-[2mm] border-naranjo px-[7mm] py-[2mm] text-grafito-medio">
          <div className="flex items-center gap-[5mm]">
            <span className="flex items-center gap-[1.5mm]"><img src="/logos/seguridad-salud-bienestar.png" alt="" className="h-[6mm]" /> Seguridad, Salud y Bienestar</span>
            <span className="flex items-center gap-[1.5mm]"><img src="/logos/5-valores.png" alt="" className="h-[6mm]" /> 5 valores que nos unen</span>
          </div>
          <span>GCSSO · Dirección Corporativa de Seguridad · © 2026 Codelco Chile · Uso interno</span>
        </footer>
      </article>
    </div>
  );
}
