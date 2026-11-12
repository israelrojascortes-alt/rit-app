import { Shell } from "@/components/Shell";
import RitForm from "@/components/RitForm";

export const metadata = { title: "Nueva RIT" };

export default function NuevaRit() {
  return (
    <Shell eyebrow="Cartilla · Reunión de planificación" title="Nueva Reunión de Inicio de Turno">
      <RitForm />
    </Shell>
  );
}
