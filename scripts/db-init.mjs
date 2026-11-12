// Crea las tablas en el PostgreSQL de DATABASE_URL (idempotente). Uso: DATABASE_URL=... npm run db:init
import fs from "node:fs";
import pg from "pg";
if (!process.env.DATABASE_URL) { console.error("Defina DATABASE_URL"); process.exit(1); }
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(fs.readFileSync(new URL("../lib/schema.sql", import.meta.url), "utf8"));
await client.end();
console.log("Esquema RIT aplicado.");
