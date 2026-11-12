import type { Filtros } from "./rit-repo";

const fecha = (v: string | null | undefined) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
const txt = (v: string | null | undefined) => (v && v.trim() ? v.trim().slice(0, 120) : undefined);

type SP = URLSearchParams | Record<string, string | string[] | undefined>;
export function filtrosDe(sp: SP): Filtros {
  const get = (k: string) => (sp instanceof URLSearchParams ? sp.get(k) : ([] as (string | undefined)[]).concat(sp[k] ?? [])[0]);
  return { desde: fecha(get("desde")), hasta: fecha(get("hasta")), gerencia: txt(get("gerencia")), eecc: txt(get("eecc")), q: txt(get("q")) };
}
export function qs(f: Filtros) {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => v && p.set(k, v));
  return p.toString();
}
