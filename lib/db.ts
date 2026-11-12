import "server-only";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "./schema";

/**
 * Acceso a datos con SQL parametrizado ($1, $2, …).
 * - Producción: PostgreSQL vía `pg` cuando DATABASE_URL está definido.
 * - Desarrollo: PGlite (Postgres embebido en WASM) en ./data/pglite, sin instalar nada.
 */
type Row = Record<string, unknown>;
export interface Db {
  query<T extends Row = Row>(sql: string, params?: unknown[]): Promise<T[]>;
  tx<T>(fn: (q: Db["query"]) => Promise<T>): Promise<T>;
}

const g = globalThis as unknown as { __ritDb?: Promise<Db> };

async function createDb(): Promise<Db> {
  const schema = SCHEMA_SQL;

  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (url) {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: url, max: process.env.VERCEL ? 3 : 10 });
    await pool.query(schema);
    const query: Db["query"] = async (sql, params = []) => (await pool.query(sql, params as unknown[])).rows;
    return {
      query,
      async tx(fn) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const out = await fn(async (sql, params = []) => (await client.query(sql, params as unknown[])).rows);
          await client.query("COMMIT");
          return out;
        } catch (e) {
          await client.query("ROLLBACK");
          throw e;
        } finally {
          client.release();
        }
      },
    };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? (process.env.VERCEL ? "/tmp/pglite" : path.join(process.cwd(), "data", "pglite"));
  fs.mkdirSync(dir, { recursive: true });
  const pg = new PGlite(dir);
  await pg.exec(schema);
  const query: Db["query"] = async (sql, params = []) => (await pg.query(sql, params as unknown[])).rows as never;
  return {
    query,
    async tx(fn) {
      return pg.transaction(async (t) => fn(async (sql, params = []) => (await t.query(sql, params as unknown[])).rows as never));
    },
  };
}

export function db(): Promise<Db> {
  if (!g.__ritDb) g.__ritDb = createDb();
  return g.__ritDb;
}
