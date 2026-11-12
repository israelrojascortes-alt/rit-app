import "server-only";
import { db } from "./db";
import { crearRit } from "./rit-repo";
import { RF, RF_BY_CODE } from "./rf";
import type { RitInput, ActividadInput } from "./validacion";

/** Modo demostración: DEMO_MODE=1. Muestra un aviso y carga RIT ficticias si la base está vacía. */
export const esDemo = () => process.env.DEMO_MODE === "1";

const g = globalThis as unknown as { __ritDemo?: Promise<void> };

export function asegurarDatosDemo(): Promise<void> {
  if (!esDemo()) return Promise.resolve();
  if (!g.__ritDemo) g.__ritDemo = sembrar().catch((e) => { g.__ritDemo = undefined; throw e; });
  return g.__ritDemo;
}

// Generador determinista para que la demo se vea igual en cada despliegue
function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

const GERENCIAS = ["GMM", "GPRO", "GAD", "GSSO"];
const EECC = ["Contratista Demo Norte", "Servicios Ejemplo Ltda.", "Montajes Prueba S.A.", "Mantención Ficticia SpA", ""];
const AREAS = ["Taller camiones – bahía 3", "Chancado primario – CV-120", "Planta SX-EW – nave 2", "Rajo – fase 7", "Bodega central", "Lixiviación – pilas"];
const ACTIVIDADES: [string, string][] = [
  ["Cambio de neumático de camión de extracción", "RF04"],
  ["Cambio de polines en correa transportadora con bloqueo", "RF09"],
  ["Izaje de componente con grúa horquilla", "RF03"],
  ["Trabajo en altura sobre plataforma de chancador", "RF02"],
  ["Traslado de personal en camioneta a fase 7", "RF10"],
  ["Inspección de tablero eléctrico de media tensión", "RF01"],
  ["Trasvasije de ácido sulfúrico en nave SX", "RF07"],
  ["Ingreso a estanque para limpieza", "RF11"],
  ["Tránsito peatonal en área de carguío", "RF27"],
  ["Arrastre de equipo con tractor", "RF30"],
];

async function sembrar() {
  const d = await db();
  // Solo una instancia siembra (en Vercel puede haber varias a la vez): marca atómica
  await d.query("CREATE TABLE IF NOT EXISTS demo_seed (id INTEGER PRIMARY KEY)");
  const marca = await d.query("INSERT INTO demo_seed (id) VALUES (1) ON CONFLICT DO NOTHING RETURNING id");
  if (marca.length === 0) return;
  const [{ n }] = await d.query<{ n: number }>("SELECT COUNT(*)::int AS n FROM rit");
  if (Number(n) > 0) return;
  const r = rng(2026);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const hoy = new Date();
  for (let k = 0; k < 18; k++) {
    const f = new Date(hoy.getTime() - Math.floor(k / 2) * 86400000);
    const actividades: ActividadInput[] = [];
    for (const turno of ["A", "B"] as const) {
      const cant = turno === "A" ? 1 + Math.floor(r() * 3) : Math.floor(r() * 3);
      for (let i = 0; i < cant; i++) {
        const [desc, rf] = pick(ACTIVIDADES);
        const ctrl = RF_BY_CODE[rf].controles;
        const no = r() < 0.12;
        actividades.push({
          turno, descripcion: desc,
          instructivos: true, materiales: true, herramientas: !no, epp: true,
          analisis: [{ rf, riesgo: RF_BY_CODE[rf].evento, consecuencia: "Lesión grave o fatal", controles: ctrl.slice(0, 2).map((c) => `${rf}-${c.code}`) }],
        });
      }
    }
    const rfs = Array.from(new Set(actividades.flatMap((a) => a.analisis.map((x) => x.rf)))).sort();
    if (r() < 0.4) rfs.push(pick(RF).code);
    const input: RitInput = {
      fecha: f.toISOString().slice(0, 10),
      centroTrabajo: "División Radomiro Tomic",
      gerencia: pick(GERENCIAS),
      superintendencia: "",
      area: pick(AREAS),
      supervisor: `Supervisor Demo ${1 + Math.floor(r() * 9)}`,
      nAsistentes: 4 + Math.floor(r() * 10),
      eecc: pick(EECC),
      nContrato: `46000${10000 + Math.floor(r() * 89999)}`,
      nombreContrato: "Contrato de ejemplo",
      rfs: Array.from(new Set(rfs)).sort(),
      actividades,
      aportes: r() < 0.4 ? [{ propuesta: "Mejorar señalética en acceso peatonal", responsable: "Supervisor Demo", fecha: "" }] : [],
      reconocimientos: r() < 0.3 ? [{ quien: "Trabajador Demo", motivo: "Detuvo la tarea al detectar una condición insegura" }] : [],
    };
    await crearRit(input);
  }
}
