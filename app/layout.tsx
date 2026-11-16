import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const plex = localFont({
  variable: "--font-plex",
  src: [
    { path: "./fonts/IBMPlexSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexSans-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/IBMPlexSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/IBMPlexSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/IBMPlexSans-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: { default: "RIT · Reunión de Inicio de Turno", template: "%s · RIT DRT" },
  description: "Reunión de Inicio de Turno – GSSO División Radomiro Tomic",
  applicationName: "RIT DRT",
  appleWebApp: { capable: true, title: "RIT DRT", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#E4450D" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={plex.variable}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
