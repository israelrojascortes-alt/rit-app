import { Shell } from "@/components/Shell";
import { IngresarCodigo } from "@/components/IngresarCodigo";

export const metadata = { title: "Proyectar RIT en vivo" };

export default function Vivo() {
  return (
    <Shell eyebrow="Pantalla de la sala" title="Proyectar RIT en vivo">
      <div className="card mx-auto max-w-xl space-y-4">
        <p className="text-[15px] text-grafito-medio">
          Abra esta página en el computador conectado al proyector o la TV. En el celular, toque <b>Proyectar</b> dentro de <b>Nueva RIT</b> y escriba aquí el código que aparece.
        </p>
        <IngresarCodigo />
      </div>
    </Shell>
  );
}
