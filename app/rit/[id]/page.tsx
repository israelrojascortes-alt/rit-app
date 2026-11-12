import Link from "next/link";
import { notFound } from "next/navigation";
import { Shell } from "@/components/Shell";
import { RitDetalle } from "@/components/RitDetalle";
import { obtenerRit } from "@/lib/rit-repo";

export const dynamic = "force-dynamic";

export default async function VerRit({ params, searchParams }: { params: { id: string }; searchParams: { enviada?: string } }) {
  const rit = await obtenerRit(Number(params.id));
  if (!rit) notFound();
  return (
    <Shell
      eyebrow={`RIT N.º ${rit.id} · ${rit.fecha}`}
      title={`${rit.area} · ${rit.supervisor}`}
      actions={
        <div className="flex gap-2">
          <Link href={`/rit/${rit.id}/imprimir`} className="btn bg-white text-naranjo hover:bg-naranjo-claro">Cartilla PDF</Link>
          <Link href="/rit/nueva" className="btn bg-grafito text-white hover:bg-black">Nueva RIT</Link>
        </div>
      }
    >
      {searchParams.enviada && (
        <div className="mb-5 rounded-xl bg-ok-claro p-4 text-sm text-ok">
          <b>RIT enviada.</b> La cuadrilla debe mantener una copia en terreno: descargue la cartilla en PDF o comparta este enlace.
        </div>
      )}
      <RitDetalle rit={rit} />
    </Shell>
  );
}
