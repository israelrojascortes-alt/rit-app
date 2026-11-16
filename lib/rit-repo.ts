import "server-only";
import { db } from "./db";
import type { RitInput, ItemKey, Turno } from "./validacion";

export type Analisis = { id: number; orden: number; rf: string; riesgo: string; consecuencia: string; controles: string[] };
export type Actividad = { id: number; orden: number; descripcion: string; analisis: Analisis[] } & Record<ItemKey, boolean | null>;
export type Rit = {
  id: number;
  creadoEn: string;
  fecha: string;
  turno: Turno;
  centroTrabajo: string;
  gerencia: string;
  superintendencia: string;
  area: string;
  supervisor: string;
  nAsistentes: number;
  eecc: string;
  nContrato: string;
  nombreContrato: string;
  rfs: string[];
  actividades: Actividad[];
  aportes: { propuesta: string; responsable: string; fecha: string | null }[];
  reconocimientos: { quien: string; motivo: string }[];
};
export type RitResumen = Pick<Rit, "id" | "creadoEn" | "fecha" | "turno" | "gerencia" | "area" | "supervisor" | "nAsistentes" | "eecc" | "nContrato" | "rfs"> & {
  actividades: number;
  noPreparadas: number;
};

export type Filtros = { desde?: string; hasta?: string; turno?: string; gerencia?: string; eecc?: string; q?: string };

const iso = (d: unknown) => (d instanceof Date ? d.toISOString().slice(0, 10) : d ? String(d).slice(0, 10) : null);

export async function crearRit(r: RitInput): Promise<number> {
  const d = await db();
  return d.tx(async (q) => {
    const [{ id }] = await q<{ id: number }>(
      `INSERT INTO rit (fecha, turno, centro_trabajo, gerencia, superintendencia, area, supervisor, n_asistentes, eecc, n_contrato, nombre_contrato, rfs)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [r.fecha, r.turno, r.centroTrabajo, r.gerencia, r.superintendencia, r.area, r.supervisor, r.nAsistentes, r.eecc, r.nContrato, r.nombreContrato, r.rfs],
    );
    let orden = 0;
    for (const a of r.actividades) {
      const [{ id: actId }] = await q<{ id: number }>(
        `INSERT INTO actividad (rit_id, turno, orden, descripcion, instructivos, materiales, herramientas, epp)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [id, r.turno, ++orden, a.descripcion, a.instructivos, a.materiales, a.herramientas, a.epp],
      );
      let k = 0;
      for (const an of a.analisis) {
        if (!an.rf && !an.riesgo && !an.consecuencia) continue;
        await q(`INSERT INTO analisis (actividad_id, orden, rf, riesgo, consecuencia, controles) VALUES ($1,$2,$3,$4,$5,$6)`, [
          actId, ++k, an.rf, an.riesgo, an.consecuencia, an.controles,
        ]);
      }
    }
    for (const ap of r.aportes)
      await q(`INSERT INTO aporte (rit_id, propuesta, responsable, fecha) VALUES ($1,$2,$3,$4)`, [id, ap.propuesta, ap.responsable, ap.fecha || null]);
    for (const rc of r.reconocimientos) await q(`INSERT INTO reconocimiento (rit_id, quien, motivo) VALUES ($1,$2,$3)`, [id, rc.quien, rc.motivo]);
    return id;
  });
}

export async function obtenerRit(id: number): Promise<Rit | null> {
  const d = await db();
  const [r] = await d.query(`SELECT * FROM rit WHERE id = $1`, [id]);
  if (!r) return null;
  const acts = await d.query(`SELECT * FROM actividad WHERE rit_id = $1 ORDER BY orden`, [id]);
  const ans = acts.length
    ? await d.query(`SELECT * FROM analisis WHERE actividad_id = ANY($1::int[]) ORDER BY orden`, [acts.map((a) => a.id)])
    : [];
  const aps = await d.query(`SELECT * FROM aporte WHERE rit_id = $1 ORDER BY id`, [id]);
  const rcs = await d.query(`SELECT * FROM reconocimiento WHERE rit_id = $1 ORDER BY id`, [id]);
  return {
    id: Number(r.id),
    creadoEn: new Date(r.creado_en as string).toISOString(),
    fecha: iso(r.fecha)!,
    turno: (r.turno as Turno) ?? "A",
    centroTrabajo: String(r.centro_trabajo),
    gerencia: String(r.gerencia),
    superintendencia: String(r.superintendencia),
    area: String(r.area),
    supervisor: String(r.supervisor),
    nAsistentes: Number(r.n_asistentes),
    eecc: String(r.eecc),
    nContrato: String(r.n_contrato),
    nombreContrato: String(r.nombre_contrato),
    rfs: (r.rfs as string[]) ?? [],
    actividades: acts.map((a) => ({
      id: Number(a.id),
      orden: Number(a.orden),
      descripcion: String(a.descripcion),
      instructivos: a.instructivos as boolean | null,
      materiales: a.materiales as boolean | null,
      herramientas: a.herramientas as boolean | null,
      epp: a.epp as boolean | null,
      analisis: ans
        .filter((x) => x.actividad_id === a.id)
        .map((x) => ({ id: Number(x.id), orden: Number(x.orden), rf: String(x.rf), riesgo: String(x.riesgo), consecuencia: String(x.consecuencia), controles: (x.controles as string[]) ?? [] })),
    })),
    aportes: aps.map((x) => ({ propuesta: String(x.propuesta), responsable: String(x.responsable), fecha: iso(x.fecha) })),
    reconocimientos: rcs.map((x) => ({ quien: String(x.quien), motivo: String(x.motivo) })),
  };
}

function where(f: Filtros) {
  const conds: string[] = [];
  const params: unknown[] = [];
  const add = (sql: string, v: unknown) => {
    params.push(v);
    conds.push(sql.replace("?", `$${params.length}`));
  };
  if (f.desde) add("r.fecha >= ?", f.desde);
  if (f.hasta) add("r.fecha <= ?", f.hasta);
  if (f.turno) add("r.turno = ?", f.turno);
  if (f.gerencia) add("r.gerencia = ?", f.gerencia);
  if (f.eecc) add("r.eecc = ?", f.eecc);
  if (f.q) {
    params.push(`%${f.q}%`);
    const p = `$${params.length}`;
    conds.push(`(r.supervisor ILIKE ${p} OR r.area ILIKE ${p} OR r.n_contrato ILIKE ${p} OR r.eecc ILIKE ${p})`);
  }
  return { sql: conds.length ? "WHERE " + conds.join(" AND ") : "", params };
}

export async function listarRits(f: Filtros, limit = 300): Promise<RitResumen[]> {
  const d = await db();
  const w = where(f);
  const rows = await d.query(
    `SELECT r.id, r.creado_en, r.fecha, r.turno, r.gerencia, r.area, r.supervisor, r.n_asistentes, r.eecc, r.n_contrato, r.rfs,
            COUNT(a.id)::int AS act,
            COUNT(a.id) FILTER (WHERE a.instructivos IS FALSE OR a.materiales IS FALSE OR a.herramientas IS FALSE OR a.epp IS FALSE)::int AS no_prep
       FROM rit r LEFT JOIN actividad a ON a.rit_id = r.id
       ${w.sql}
      GROUP BY r.id
      ORDER BY r.fecha DESC, r.creado_en DESC
      LIMIT ${Number(limit)}`,
    w.params,
  );
  return rows.map((r) => ({
    id: Number(r.id),
    creadoEn: new Date(r.creado_en as string).toISOString(),
    fecha: iso(r.fecha)!,
    turno: (r.turno as Turno) ?? "A",
    gerencia: String(r.gerencia),
    area: String(r.area),
    supervisor: String(r.supervisor),
    nAsistentes: Number(r.n_asistentes),
    eecc: String(r.eecc),
    nContrato: String(r.n_contrato),
    rfs: (r.rfs as string[]) ?? [],
    actividades: Number(r.act),
    noPreparadas: Number(r.no_prep),
  }));
}

export async function estadisticas(f: Filtros) {
  const d = await db();
  const w = where(f);
  const [tot] = await d.query(
    `SELECT COUNT(DISTINCT r.id)::int AS rits,
            COALESCE(SUM(r.n_asistentes), 0)::int AS asistentes_raw,
            COUNT(DISTINCT NULLIF(r.eecc, ''))::int AS eecc
       FROM rit r ${w.sql}`,
    w.params,
  );
  const [act] = await d.query(
    `SELECT COUNT(a.id)::int AS actividades,
            COUNT(a.id) FILTER (WHERE a.instructivos IS FALSE OR a.materiales IS FALSE OR a.herramientas IS FALSE OR a.epp IS FALSE)::int AS no_prep
       FROM rit r JOIN actividad a ON a.rit_id = r.id ${w.sql}`,
    w.params,
  );
  const rf = await d.query<{ rf: string; n: number }>(
    `SELECT u.rf, COUNT(*)::int AS n FROM rit r, unnest(r.rfs) AS u(rf) ${w.sql} GROUP BY u.rf ORDER BY n DESC, u.rf`,
    w.params,
  );
  const porGerencia = await d.query<{ gerencia: string; n: number }>(
    `SELECT r.gerencia, COUNT(*)::int AS n FROM rit r ${w.sql} GROUP BY r.gerencia ORDER BY n DESC`,
    w.params,
  );
  return {
    rits: Number(tot.rits),
    asistentes: Number(tot.asistentes_raw),
    eecc: Number(tot.eecc),
    actividades: Number(act.actividades),
    noPreparadas: Number(act.no_prep),
    rf: rf.map((x) => ({ rf: x.rf, n: Number(x.n) })),
    porGerencia: porGerencia.map((x) => ({ gerencia: x.gerencia, n: Number(x.n) })),
  };
}

export async function opcionesFiltro() {
  const d = await db();
  const ger = await d.query<{ v: string }>(`SELECT DISTINCT gerencia AS v FROM rit ORDER BY 1`);
  const ee = await d.query<{ v: string }>(`SELECT DISTINCT eecc AS v FROM rit WHERE eecc <> '' ORDER BY 1`);
  return { gerencias: ger.map((x) => x.v), eecc: ee.map((x) => x.v) };
}

/** Filas planas (una por fila de análisis) para la exportación a Excel. */
export async function filasExport(f: Filtros) {
  const d = await db();
  const w = where(f);
  return d.query(
    `SELECT r.id AS rit_id, r.fecha, r.turno AS turno_rit, r.gerencia, r.superintendencia, r.area, r.supervisor, r.n_asistentes, r.eecc, r.n_contrato, r.nombre_contrato,
            array_to_string(r.rfs, ', ') AS rfs_turno,
            a.orden AS act_n, a.descripcion, a.instructivos, a.materiales, a.herramientas, a.epp,
            an.orden AS an_n, an.rf, an.riesgo, an.consecuencia, array_to_string(an.controles, ', ') AS controles
       FROM rit r
       LEFT JOIN actividad a ON a.rit_id = r.id
       LEFT JOIN analisis an ON an.actividad_id = a.id
       ${w.sql}
      ORDER BY r.fecha, r.id, a.orden, an.orden`,
    w.params,
  );
}

export async function aportesExport(f: Filtros) {
  const d = await db();
  const w = where(f);
  const aportes = await d.query(
    `SELECT r.id AS rit_id, r.fecha, r.turno AS turno_rit, r.gerencia, r.eecc, r.supervisor, p.propuesta, p.responsable, p.fecha AS fecha_compromiso
       FROM rit r JOIN aporte p ON p.rit_id = r.id ${w.sql} ORDER BY r.fecha, r.id`,
    w.params,
  );
  const recon = await d.query(
    `SELECT r.id AS rit_id, r.fecha, r.turno AS turno_rit, r.gerencia, r.eecc, r.supervisor, c.quien, c.motivo
       FROM rit r JOIN reconocimiento c ON c.rit_id = r.id ${w.sql} ORDER BY r.fecha, r.id`,
    w.params,
  );
  return { aportes, recon };
}
