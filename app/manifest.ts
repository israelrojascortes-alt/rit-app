import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RIT · Reunión de Inicio de Turno – DRT",
    short_name: "RIT DRT",
    description: "Registro de la Reunión de Inicio de Turno (RIT) – GSSO División Radomiro Tomic",
    lang: "es-CL",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#F3F3F3",
    theme_color: "#E4450D",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Nueva RIT", url: "/rit/nueva", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Guía RF", url: "/guia" },
    ],
  };
}
