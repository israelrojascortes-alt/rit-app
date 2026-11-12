import { NextResponse } from "next/server";
import { obtenerRit } from "@/lib/rit-repo";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const rit = await obtenerRit(Number(params.id));
  return rit ? NextResponse.json(rit) : NextResponse.json({ error: "No encontrada" }, { status: 404 });
}
