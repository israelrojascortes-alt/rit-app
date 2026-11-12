import { NextResponse, type NextRequest } from "next/server";

/**
 * Protección del panel GSSO y la exportación con autenticación básica (PANEL_USER / PANEL_PASS).
 * En producción se recomienda reemplazar por SSO corporativo (Entra ID) — ver README.
 */
export function middleware(req: NextRequest) {
  const user = process.env.PANEL_USER, pass = process.env.PANEL_PASS;
  if (!user || !pass) return NextResponse.next();
  // El envío de una RIT (POST) es abierto para los supervisores; el listado (GET) es del panel.
  if (req.nextUrl.pathname === "/api/rit" && req.method === "POST") return NextResponse.next();
  const h = req.headers.get("authorization");
  if (h?.startsWith("Basic ")) {
    const [u, p] = atob(h.slice(6)).split(":");
    if (u === user && p === pass) return NextResponse.next();
  }
  return new NextResponse("Acceso restringido al panel GSSO", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Panel RIT GSSO"' } });
}

export const config = { matcher: ["/panel/:path*", "/api/export/:path*", "/api/rit"] };
