import Link from "next/link";
import { Shell } from "@/components/Shell";
import { estadisticas, listarRits, opcionesFiltro } from "@/lib/rit-repo";
import { filtrosDe, qs } from "@/lib/filtros";
import { RF_BY_CODE } from "@/lib/rf";
import { asegurarDatosDemo } from "@/lib/demo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel GSSO" };

const dia = (offset = 0) => {
  const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60000 + offset * 86400000);
  return d.toISOString().slice(0, 10);
};

export default async function Panel({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  await asegurarDatosDemo();
  const f = filtrosDe(searchParams);
  if (!f.desde && !f.hasta) { f.desde = dia(-29); f.hasta = dia(0); }
  const [st, lista, op, hoy] = await Promise.all([estadisticas(f), listarRits(f), opcionesFiltro(), estadisticas({ ...f, desde: dia(0), hasta: dia(0) })]);
  const maxRf = Math.max(1, ...st.rf.map((r) => r.n));
  const pctNo = st.actividades ? Math.round((st.noPreparadas / st.actividades) * 100) : 0;

  const kpis = [
    { k: "RIT enviadas hoy", v: hoy.rits },
    { k: "RIT en el período", v: st.rits },
    { k: "Actividades registradas", v: st.actividades },
    { k: "Actividades no preparadas", v: `${st.noPreparadas}`, sub: `${pctNo}% del total`, alerta: st.noPreparadas > 0 },
    { k: "Personas en RIT", v: st.asistentes },
    { k: "EE.CC. con RIT", v: st.eecc },
  ];

  return (
    <Shell
      eyebrow="Gerencia de Seguridad y Salud Ocupacional"
      title="Panel de seguimiento RIT"
      actions={<a href={`/api/export?${qs(f)}`} className="btn bg-white text-naranjo hover:bg-naranjo-claro">Exportar Excel</a>}
    >
      <form className="card mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[150px_150px_1fr_1fr_1fr_auto]" method="get">
        <label><span className="label">Desde</span><input type="date" name="desde" defaultValue={f.desde} className="input" /></label>
        <label><span className="label">Hasta</span><input type="date" name="hasta" defaultValue={f.hasta} className="input" /></label>
        <label><span className="label">Gerencia</span>
          <select name="gerencia" defaultValue={f.gerencia ?? ""} className="input"><option value="">Todas</option>{op.gerencias.map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label><span className="label">EE.CC.</span>
          <select name="eecc" defaultValue={f.eecc ?? ""} className="input"><option value="">Todas</option>{op.eecc.map((g) => <option key={g}>{g}</option>)}</select>
        </label>
        <label><span className="label">Buscar</span><input name="q" defaultValue={f.q} placeholder="Supervisor, área, contrato…" className="input" /></label>
        <div className="flex items-end gap-2"><button className="btn-dark">Filtrar</button><Link href="/panel" className="btn-ghost">Limpiar</Link></div>
      </form>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.k} className={`card ${k.alerta ? "ring-2 ring-naranjo" : ""}`}>
            <p className="text-xs font-semibold text-grafito-medio">{k.k}</p>
            <p className={`mt-1 text-3xl font-bold ${k.alerta ? "text-naranjo" : "text-grafito"}`}>{k.v}</p>
            {k.sub && <p className="text-xs text-grafito-medio">{k.sub}</p>}
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <section className="card">
          <h2 className="section-title mb-1">RF más declarados en el período</h2>
          <p className="mb-3 text-xs text-grafito-medio">N.º de RIT en que se marcó cada riesgo de fatalidad</p>
          {st.rf.length === 0 ? <p className="text-sm text-grafito-medio">Sin datos en el período.</p> : (
            <ul className="space-y-1.5">
              {st.rf.slice(0, 12).map((r) => (
                <li key={r.rf} className="grid grid-cols-[190px_1fr_36px] items-center gap-2 text-sm">
                  <span className="truncate"><b className="text-naranjo-oscuro">{r.rf}</b> {RF_BY_CODE[r.rf]?.name}</span>
                  <span className="h-4 rounded-sm bg-naranjo" style={{ width: `${(r.n / maxRf) * 100}%` }} />
                  <span className="text-right font-semibold tabular-nums">{r.n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="section-title mb-1">RIT por gerencia</h2>
          <p className="mb-3 text-xs text-grafito-medio">N.º de RIT enviadas en el período</p>
          {st.porGerencia.length === 0 ? <p className="text-sm text-grafito-medio">Sin datos en el período.</p> : (
            <ul className="space-y-1.5">
              {st.porGerencia.map((g) => (
                <li key={g.gerencia} className="grid grid-cols-[110px_1fr_36px] items-center gap-2 text-sm">
                  <span className="truncate font-semibold">{g.gerencia}</span>
                  <span className="h-4 rounded-sm bg-grafito" style={{ width: `${(g.n / Math.max(1, ...st.porGerencia.map((x) => x.n))) * 100}%` }} />
                  <span className="text-right font-semibold tabular-nums">{g.n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="section-title mb-3">RIT enviadas ({lista.length}{lista.length === 300 ? "+" : ""})</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b-2 border-grafito text-xs text-grafito-medio">
              <tr><th className="py-2 pr-3">N.º</th><th className="pr-3">Fecha</th><th className="pr-3">Gerencia</th><th className="pr-3">EE.CC. / contrato</th><th className="pr-3">Área</th><th className="pr-3">Supervisor</th><th className="pr-3 text-right">Asist.</th><th className="pr-3 text-right">Act. A/B</th><th className="pr-3">RF</th><th></th></tr>
            </thead>
            <tbody>
              {lista.length === 0 && <tr><td colSpan={10} className="py-6 text-center text-grafito-medio">No hay RIT para los filtros seleccionados.</td></tr>}
              {lista.map((r) => (
                <tr key={r.id} className="border-b border-grafito-linea align-top">
                  <td className="py-2 pr-3 font-semibold">{r.id}</td>
                  <td className="pr-3 tabular-nums">{r.fecha}</td>
                  <td className="pr-3">{r.gerencia}</td>
                  <td className="pr-3">{r.eecc || "Codelco"}{r.nContrato && <span className="block text-xs text-grafito-medio">{r.nContrato}</span>}</td>
                  <td className="pr-3">{r.area}</td>
                  <td className="pr-3">{r.supervisor}</td>
                  <td className="pr-3 text-right tabular-nums">{r.nAsistentes}</td>
                  <td className="pr-3 text-right tabular-nums">{r.actividadesA}/{r.actividadesB}{r.noPreparadas > 0 && <span className="ml-1 rounded bg-naranjo px-1 text-xs font-bold text-white" title="Actividades no preparadas">{r.noPreparadas} NO</span>}</td>
                  <td className="pr-3 text-xs">{r.rfs.join(" · ")}</td>
                  <td><Link href={`/rit/${r.id}`} className="font-semibold text-naranjo-oscuro underline">Ver</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
