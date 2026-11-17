"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function IngresarCodigo() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const limpio = codigo.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const valido = /^[A-HJ-KMNP-Z2-9]{6}$/.test(limpio);
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        if (valido) router.push(`/vivo/${limpio}`);
      }}
    >
      <input
        className="input text-center font-mono text-2xl font-bold uppercase tracking-[0.3em]"
        placeholder="ABC234"
        value={limpio}
        onChange={(e) => setCodigo(e.target.value)}
        aria-label="Código de proyección"
        autoFocus
      />
      <button type="submit" className="btn-primary whitespace-nowrap" disabled={!valido}>
        Proyectar
      </button>
    </form>
  );
}
