import { NextResponse } from "next/server";
import { ritSchema } from "@/lib/validacion";
import { crearRit, listarRits } from "@/lib/rit-repo";
import { filtrosDe } from "@/lib/filtros";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ errores: ["Solicitud inválida"] }, { status: 400 });
  }
  const parsed = ritSchema.safeParse(body);
  if (!parsed.success) {
    const errores = Array.from(new Set(parsed.error.issues.map((i) => i.message)));
    return NextResponse.json({ errores }, { status: 422 });
  }
  const id = await crearRit(parsed.data);
  return NextResponse.json({ id }, { status: 201 });
}

export async function GET(req: Request) {
  const f = filtrosDe(new URL(req.url).searchParams);
  return NextResponse.json(await listarRits(f));
}
