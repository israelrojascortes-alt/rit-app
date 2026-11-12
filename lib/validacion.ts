import { z } from "zod";
import { RF_BY_CODE } from "./rf";

export const MAX_ACTIVIDADES_POR_TURNO = 6;
export const MAX_ANALISIS_POR_ACTIVIDAD = 3;
export const ITEMS_PREPARACION = [
  { key: "instructivos", label: "Instructivos y/o PTS" },
  { key: "materiales", label: "Materiales" },
  { key: "herramientas", label: "Herramientas" },
  { key: "epp", label: "EPP" },
] as const;
export type ItemKey = (typeof ITEMS_PREPARACION)[number]["key"];

const texto = (max = 500) => z.string().trim().max(max);
const rfCode = z.string().refine((c) => c === "" || c in RF_BY_CODE, "RF no válido");
const siNo = z.boolean().nullable();

export const analisisSchema = z.object({
  rf: rfCode,
  riesgo: texto(),
  consecuencia: texto(),
  controles: z.array(z.string().regex(/^RF\d{2}-CC[PM]\d$/)).max(20),
});

export const actividadSchema = z.object({
  turno: z.enum(["A", "B"]),
  descripcion: texto(500).min(3, "Describa la actividad"),
  instructivos: siNo,
  materiales: siNo,
  herramientas: siNo,
  epp: siNo,
  analisis: z.array(analisisSchema).max(MAX_ANALISIS_POR_ACTIVIDAD),
});

export const ritSchema = z
  .object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    centroTrabajo: texto(120).default("División Radomiro Tomic"),
    gerencia: texto(120).min(2, "Indique la gerencia"),
    superintendencia: texto(120).default(""),
    area: texto(160).min(2, "Indique el área o frente de trabajo"),
    supervisor: texto(120).min(3, "Indique el supervisor a cargo"),
    nAsistentes: z.coerce.number().int().min(1, "Indique el N.º de asistentes").max(500),
    eecc: texto(160).default(""),
    nContrato: texto(40).default(""),
    nombreContrato: texto(200).default(""),
    rfs: z.array(rfCode).max(40),
    actividades: z.array(actividadSchema).min(1, "Registre al menos una actividad").max(2 * MAX_ACTIVIDADES_POR_TURNO),
    aportes: z.array(z.object({ propuesta: texto().min(1), responsable: texto(120), fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")) })).max(10),
    reconocimientos: z.array(z.object({ quien: texto(120).min(1), motivo: texto() })).max(10),
  })
  .superRefine((r, ctx) => {
    for (const t of ["A", "B"] as const) {
      if (r.actividades.filter((a) => a.turno === t).length > MAX_ACTIVIDADES_POR_TURNO)
        ctx.addIssue({ code: "custom", message: `Máximo ${MAX_ACTIVIDADES_POR_TURNO} actividades en el turno ${t}`, path: ["actividades"] });
    }
    const n = { A: 0, B: 0 };
    r.actividades.forEach((a, i) => {
      n[a.turno]++;
      if (ITEMS_PREPARACION.some((it) => a[it.key] === null))
        ctx.addIssue({ code: "custom", message: `Actividad ${a.turno}${n[a.turno]}: responda SÍ o NO en los 4 ítems de preparación`, path: ["actividades", i] });
    });
    r.actividades.forEach((a, i) =>
      a.analisis.forEach((an, j) => {
        if (an.rf && !r.rfs.includes(an.rf))
          ctx.addIssue({ code: "custom", message: `${an.rf} se analiza en una actividad pero no está marcado como RF del turno`, path: ["actividades", i, "analisis", j, "rf"] });
        if (an.controles.some((c) => !c.startsWith(an.rf + "-")))
          ctx.addIssue({ code: "custom", message: "Los controles deben corresponder al RF de la fila", path: ["actividades", i, "analisis", j, "controles"] });
      }),
    );
  });

export type RitInput = z.infer<typeof ritSchema>;
export type ActividadInput = z.infer<typeof actividadSchema>;
export type AnalisisInput = z.infer<typeof analisisSchema>;

/** Una actividad no está preparada si algún ítem fue marcado NO. */
export const noPreparada = (a: Pick<ActividadInput, ItemKey>) => ITEMS_PREPARACION.some((i) => a[i.key] === false);
