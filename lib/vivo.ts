import "server-only";
import { db } from "./db";

/** Códigos de 6 caracteres sin letras ni números que se confundan (0/O, 1/I/L). */
export const CODIGO_RE = /^[A-HJ-KMNP-Z2-9]{6}$/;
export const MAX_BYTES = 200_000;

export type Vivo = { datos: unknown; foco: string; version: number; actualizado: string };

export async function guardarVivo(codigo: string, datos: unknown, foco: string): Promise<number> {
  const q = (await db()).query;
  const rows = await q<{ version: number }>(
    `INSERT INTO rit_vivo (codigo, datos, foco) VALUES ($1, $2::jsonb, $3)
     ON CONFLICT (codigo) DO UPDATE SET datos = EXCLUDED.datos, foco = EXCLUDED.foco, version = rit_vivo.version + 1, actualizado = now()
     RETURNING version`,
    [codigo, JSON.stringify(datos), foco.slice(0, 2000)],
  );
  // Limpieza: las proyecciones sin cambios por más de 2 días se eliminan.
  if (Math.random() < 0.05) await q(`DELETE FROM rit_vivo WHERE actualizado < now() - interval '2 days'`);
  return rows[0].version;
}

export async function leerVivo(codigo: string): Promise<Vivo | null> {
  const rows = await (await db()).query<{ datos: unknown; foco: string; version: number; actualizado: Date | string }>(
    `SELECT datos, foco, version, actualizado FROM rit_vivo WHERE codigo = $1`,
    [codigo],
  );
  const r = rows[0];
  if (!r) return null;
  const datos = typeof r.datos === "string" ? JSON.parse(r.datos) : r.datos;
  return { datos, foco: r.foco, version: r.version, actualizado: new Date(r.actualizado).toISOString() };
}
