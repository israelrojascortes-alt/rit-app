import { NextResponse } from "next/server";
import { CODIGO_RE, MAX_BYTES, guardarVivo, leerVivo } from "@/lib/vivo";

export const dynamic = "force-dynamic";
const NO_CACHE = { "Cache-Control": "no-store" };

/** La pantalla de proyección consulta aquí el borrador. `?v=` evita reenviar datos sin cambios. */
export async function GET(req: Request, { params }: { params: { codigo: string } }) {
  const codigo = params.codigo.toUpperCase();
  if (!CODIGO_RE.test(codigo)) return NextResponse.json({ error: "Código inválido" }, { status: 400, headers: NO_CACHE });
  const vivo = await leerVivo(codigo);
  if (!vivo) return NextResponse.json({ error: "Aún no hay datos para este código" }, { status: 404, headers: NO_CACHE });
  const v = Number(new URL(req.url).searchParams.get("v") ?? 0);
  if (v === vivo.version) return NextResponse.json({ version: vivo.version, actualizado: vivo.actualizado, sinCambios: true }, { headers: NO_CACHE });
  return NextResponse.json(vivo, { headers: NO_CACHE });
}

/** El celular que llena la RIT envía aquí el borrador cada vez que cambia. */
export async function PUT(req: Request, { params }: { params: { codigo: string } }) {
  const codigo = params.codigo.toUpperCase();
  if (!CODIGO_RE.test(codigo)) return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  const texto = await req.text();
  if (texto.length > MAX_BYTES) return NextResponse.json({ error: "Demasiado grande" }, { status: 413 });
  let body: { datos?: unknown; foco?: unknown };
  try {
    body = JSON.parse(texto);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  if (!body || typeof body.datos !== "object" || body.datos === null) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  const version = await guardarVivo(codigo, body.datos, typeof body.foco === "string" ? body.foco : "");
  return NextResponse.json({ version });
}
