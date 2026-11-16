"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

/** Registra el service worker y muestra el botón «Instalar app» cuando el navegador lo permite. */
export function InstallApp() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [ayuda, setAyuda] = useState(false);
  const [instalada, setInstalada] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalada(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => { setInstalada(true); setEvento(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (instalada || (!evento && !ios)) return null;

  return (
    <div className="relative">
      <button
        type="button"
        className="btn-primary px-3 py-2 text-xs sm:text-sm"
        onClick={async () => {
          if (evento) {
            await evento.prompt();
            await evento.userChoice;
            setEvento(null);
          } else setAyuda((v) => !v);
        }}
      >
        Instalar app
      </button>
      {ayuda && (
        <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-lg bg-white p-3 text-xs text-grafito shadow-lg ring-1 ring-black/10">
          En iPhone: toque <b>Compartir</b> (el cuadrado con flecha) y luego <b>Agregar a pantalla de inicio</b>.
        </div>
      )}
    </div>
  );
}
