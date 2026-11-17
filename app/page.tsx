import Link from "next/link";
import { Shell } from "@/components/Shell";

const CARDS = [
  { href: "/rit/nueva", t: "Registrar RIT", d: "Llena la cartilla del turno desde el celular: elige el turno (A o B), marca los RF y registra hasta 6 actividades con su análisis de riesgo, viendo la cartilla en vivo.", cta: "Comenzar", primary: true },
  { href: "/panel", t: "Panel GSSO", d: "Seguimiento de las RIT enviadas por fecha, gerencia y empresa contratista, RF más declarados y actividades no preparadas.", cta: "Ver panel" },
  { href: "/guia", t: "Guía de consulta RF", d: "Evento top, energía y controles críticos preventivos (CCP) y mitigadores (CCM) de cada riesgo de fatalidad.", cta: "Consultar" },
  { href: "/vivo", t: "Proyectar en la sala", d: "Muestra la cartilla en grande en el proyector o la TV y ve en línea cómo se llena desde el celular, como una presentación compartida.", cta: "Abrir pantalla" },
  { href: "/preguntas", t: "Preguntas frecuentes", d: "Criterios acordados con Seguridad: cuándo, quién y cómo se realiza la RIT.", cta: "Revisar" },
];

export default function Home() {
  return (
    <Shell eyebrow="Ficha preventiva" title="Reunión de Inicio de Turno (RIT)">
      <p className="mb-5 max-w-2xl text-[15px] text-grafito-medio">
        Antes de empezar a trabajar, conversamos en equipo para cuidarnos. Se realiza en la reunión de planificación, antes de salir a terreno, por cada cuadrilla.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="card group flex flex-col gap-2 border-t-4 border-naranjo transition hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-lg font-bold">{c.t}</h2>
            <p className="flex-1 text-sm text-grafito-medio">{c.d}</p>
            <span className={c.primary ? "btn-primary mt-2 self-start" : "btn-ghost mt-2 self-start"}>{c.cta} →</span>
          </Link>
        ))}
      </div>
      <div className="mt-5 flex items-center gap-4 rounded-xl bg-grafito p-4 text-white">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-naranjo text-xl font-bold">!</span>
        <div>
          <p className="font-bold">¿Ves algo inseguro? Detén la tarea.</p>
          <p className="text-sm text-white/80">Ninguna urgencia justifica no planificar: si cambia la actividad, el área o el frente de trabajo, se hace una nueva RIT.</p>
        </div>
      </div>
    </Shell>
  );
}
