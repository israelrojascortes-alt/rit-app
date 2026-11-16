import Link from "next/link";
import { notFound } from "next/navigation";
import { obtenerRit } from "@/lib/rit-repo";
import { Cartilla } from "@/components/Cartilla";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cartilla RIT" };

export default async function Imprimir({ params }: { params: { id: string } }) {
  const rit = await obtenerRit(Number(params.id));
  if (!rit) notFound();
  return (
    <div className="bg-grafito-claro print:bg-white">
      <style>{`@page { size: A3 landscape; margin: 7mm; } @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
      <div className="no-print mx-auto flex max-w-[406mm] items-center justify-between gap-3 px-4 py-3">
        <Link href={`/rit/${rit.id}`} className="btn-ghost">← Volver</Link>
        <p className="hidden text-sm text-grafito-medio sm:block">En el diálogo de impresión elija «Guardar como PDF», tamaño A3 horizontal.</p>
        <PrintButton />
      </div>
      <div className="mx-auto w-fit shadow print:shadow-none">
        <Cartilla rit={rit} />
      </div>
    </div>
  );
}
