import Link from "next/link";
import { Shell } from "@/components/Shell";
export default function NotFound() {
  return (
    <Shell title="Página no encontrada">
      <p className="mb-4 text-sm">La RIT o página solicitada no existe.</p>
      <Link href="/" className="btn-primary">Ir al inicio</Link>
    </Shell>
  );
}
