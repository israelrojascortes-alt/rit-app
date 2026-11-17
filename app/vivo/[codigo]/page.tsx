import { notFound } from "next/navigation";
import { Proyector } from "@/components/Proyector";

export const metadata = { title: "RIT en vivo" };

export default function VivoPage({ params }: { params: { codigo: string } }) {
  const codigo = params.codigo.toUpperCase();
  if (!/^[A-HJ-KMNP-Z2-9]{6}$/.test(codigo)) notFound();
  return <Proyector codigo={codigo} />;
}
