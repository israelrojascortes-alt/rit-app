"use client";
import { useState } from "react";
import { RF } from "@/lib/rf";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function GuiaRF() {
  const [q, setQ] = useState("");
  const lista = RF.filter((r) => !q || norm([r.code, r.name, r.evento, r.energia, ...r.controles.map((c) => c.text)].join(" ")).includes(norm(q)));
  const total = RF.reduce((n, r) => n + r.controles.length, 0);
  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-3">
        <input className="input flex-1" placeholder="Buscar RF, evento o control (ej. altura, bloqueo, izaje)…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="flex items-center gap-2 text-xs"><b className="rounded bg-grafito px-2 py-0.5 text-white">CCP</b>preventivo <b className="rounded bg-naranjo px-2 py-0.5 text-white">CCM</b>mitigador</span>
        <span className="text-xs text-grafito-medio">{RF.length} RF · {total} controles críticos</span>
      </div>
      <p className="text-sm text-grafito-medio">Por cada riesgo de una actividad, anote el RF, su evento top y los códigos de los controles críticos verificados, por ejemplo RF02-CCM1.</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((r) => (
          <article key={r.code} className="card">
            <h2 className="text-base font-bold"><span className="text-naranjo-oscuro">{r.code}</span> {r.name}</h2>
            <p className="mb-2 mt-1 text-xs italic text-grafito-medio">Evento top: {r.evento} · Energía: {r.energia}</p>
            <ul className="space-y-1 text-sm">
              {r.controles.map((c) => (
                <li key={c.code}><b className={c.code.startsWith("CCP") ? "text-grafito" : "text-naranjo-oscuro"}>{c.code}</b> {c.text}</li>
              ))}
            </ul>
          </article>
        ))}
        {lista.length === 0 && <p className="text-sm text-grafito-medio">Sin resultados para «{q}».</p>}
      </div>
    </div>
  );
}
