import { RF_BY_CODE } from "@/lib/rf";
import { ITEMS_PREPARACION, noPreparada } from "@/lib/validacion";
import type { Rit } from "@/lib/rit-repo";

const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export function RitDetalle({ rit }: { rit: Rit }) {
  const datos: [string, string | number][] = [
    ["Fecha", fmt(rit.fecha)], ["Centro de trabajo", rit.centroTrabajo], ["Gerencia", rit.gerencia], ["Superintendencia / Dirección", rit.superintendencia],
    ["Área / Frente de trabajo", rit.area], ["Supervisor a cargo", rit.supervisor], ["N.º de asistentes", rit.nAsistentes], ["EE.CC.", rit.eecc],
    ["N.º de contrato", rit.nContrato], ["Nombre del contrato", rit.nombreContrato],
  ];
  return (
    <div className="space-y-5">
      <section className="card">
        <h2 className="section-title mb-3">Identificación</h2>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {datos.filter(([, v]) => v !== "").map(([k, v]) => (
            <div key={k}><dt className="text-xs font-semibold text-grafito-medio">{k}</dt><dd className="text-sm first-letter:uppercase">{v}</dd></div>
          ))}
        </dl>
      </section>

      <section className="card">
        <h2 className="section-title mb-3">Riesgos de fatalidad del turno</h2>
        <div className="flex flex-wrap gap-2">
          {rit.rfs.length === 0 && <span className="text-sm text-grafito-medio">Sin RF declarados.</span>}
          {rit.rfs.map((c) => (
            <span key={c} className="rounded-full bg-naranjo-claro px-3 py-1 text-sm"><b className="text-naranjo-oscuro">{c}</b> {RF_BY_CODE[c]?.name}</span>
          ))}
        </div>
      </section>

      {(["A", "B"] as const).map((t) => {
        const acts = rit.actividades.filter((a) => a.turno === t);
        return (
          <section key={t} className="card space-y-3">
            <h2 className="section-title">Turno {t} · {acts.length} actividad{acts.length === 1 ? "" : "es"}</h2>
            {acts.length === 0 && <p className="text-sm text-grafito-medio">Sin actividades.</p>}
            {acts.map((a) => (
              <div key={a.id} className="rounded-lg border border-grafito-linea p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm"><b className="text-naranjo-oscuro">{t}{a.orden}</b> {a.descripcion}</p>
                  {noPreparada(a) && <span className="rounded bg-naranjo px-2 py-0.5 text-xs font-bold text-white">No preparada</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ITEMS_PREPARACION.map((it) => (
                    <span key={it.key} className={`rounded px-2 py-0.5 text-xs font-semibold ${a[it.key] === true ? "bg-ok-claro text-ok" : a[it.key] === false ? "bg-naranjo-claro text-naranjo-oscuro" : "bg-grafito-claro text-grafito-medio"}`}>
                      {it.label}: {a[it.key] === true ? "SÍ" : a[it.key] === false ? "NO" : "—"}
                    </span>
                  ))}
                </div>
                {a.analisis.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead className="text-xs text-grafito-medio"><tr><th className="py-1 pr-2">RF</th><th className="pr-2">Riesgo / evento top</th><th className="pr-2">Consecuencia</th><th>Controles verificados</th></tr></thead>
                      <tbody>
                        {a.analisis.map((x) => (
                          <tr key={x.id} className="border-t border-grafito-linea align-top">
                            <td className="py-1.5 pr-2 font-bold text-naranjo-oscuro">{x.rf}</td><td className="pr-2">{x.riesgo}</td><td className="pr-2">{x.consecuencia}</td><td>{x.controles.join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </section>
        );
      })}

      {(rit.aportes.length > 0 || rit.reconocimientos.length > 0) && (
        <section className="card grid gap-5 sm:grid-cols-2">
          <div>
            <h2 className="section-title mb-2">Aportes a la gestión de riesgos</h2>
            {rit.aportes.length === 0 ? <p className="text-sm text-grafito-medio">Sin aportes.</p> : (
              <ul className="space-y-1 text-sm">{rit.aportes.map((a, i) => <li key={i}>{a.propuesta} <span className="text-grafito-medio">· {a.responsable}{a.fecha ? ` · ${a.fecha}` : ""}</span></li>)}</ul>
            )}
          </div>
          <div>
            <h2 className="section-title mb-2">Reconocimientos</h2>
            {rit.reconocimientos.length === 0 ? <p className="text-sm text-grafito-medio">Sin reconocimientos.</p> : (
              <ul className="space-y-1 text-sm">{rit.reconocimientos.map((r, i) => <li key={i}><b>{r.quien}</b> · {r.motivo}</li>)}</ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
