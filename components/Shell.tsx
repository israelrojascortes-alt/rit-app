import Image from "next/image";
import Link from "next/link";
import { esDemo } from "@/lib/demo";

const NAV = [
  { href: "/rit/nueva", label: "Nueva RIT" },
  { href: "/panel", label: "Panel GSSO" },
  { href: "/guia", label: "Guía RF" },
  { href: "/preguntas", label: "Preguntas" },
];

export function Shell({ title, eyebrow, actions, children }: { title: string; eyebrow?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {esDemo() && (
        <div className="bg-grafito px-4 py-2 text-center text-xs font-semibold text-white print:hidden">
          Versión de demostración · use solo datos de prueba (no ingrese nombres ni datos reales)
        </div>
      )}
      <header className="bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logos/codelco.png" alt="Codelco" width={64} height={43} priority className="h-9 w-auto" />
            <span className="h-8 w-0.5 bg-naranjo" />
            <span className="leading-tight">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-grafito-medio">División</span>
              <span className="block text-base font-bold text-grafito">Radomiro Tomic</span>
            </span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm font-semibold text-grafito hover:bg-grafito-claro">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="bg-naranjo text-white print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/85">{eyebrow}</p>}
            <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
          </div>
          {actions}
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:px-6">{children}</main>
      <nav className="sticky bottom-0 grid grid-cols-4 border-t border-grafito-linea bg-white md:hidden print:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="px-1 py-3 text-center text-[12px] font-semibold text-grafito">
            {n.label}
          </Link>
        ))}
      </nav>
      <footer className="hidden border-t-4 border-naranjo bg-white md:block print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 text-xs text-grafito-medio">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2">
              <Image src="/logos/seguridad-salud-bienestar.png" alt="" width={28} height={26} className="h-7 w-auto" />
              Seguridad, Salud y Bienestar
            </span>
            <span className="flex items-center gap-2">
              <Image src="/logos/5-valores.png" alt="" width={28} height={28} className="h-7 w-auto" />
              5 valores que nos unen
            </span>
          </div>
          <span>Gerencia de Seguridad y Salud Ocupacional · © 2026 Codelco Chile · Uso interno</span>
        </div>
      </footer>
    </div>
  );
}
