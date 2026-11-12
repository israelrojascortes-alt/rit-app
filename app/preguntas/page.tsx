import { Shell } from "@/components/Shell";
import { PREGUNTAS } from "@/lib/preguntas";

export const metadata = { title: "Preguntas frecuentes" };

export default function Preguntas() {
  return (
    <Shell eyebrow="Criterios acordados con Seguridad" title="Ronda de preguntas, consultas e inquietudes">
      <div className="grid gap-5 lg:grid-cols-2">
        {PREGUNTAS.map((g) => (
          <section key={g.grupo} className="card">
            <h2 className="section-title mb-3">{g.grupo}</h2>
            <ol className="space-y-3">
              {g.items.map((p) => (
                <li key={p.n} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-naranjo text-xs font-bold text-white">{p.n}</span>
                  <div className="text-sm"><p>{p.pregunta}</p><p className="font-bold text-naranjo-oscuro">{p.respuesta}</p></div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </Shell>
  );
}
