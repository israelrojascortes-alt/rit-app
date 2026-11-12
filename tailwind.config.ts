import type { Config } from "tailwindcss";

// Colores corporativos tomados de la infografía RIT (Codelco DRT)
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        naranjo: { DEFAULT: "#E4450D", oscuro: "#C23B0B", claro: "#FCE9E1" },
        grafito: { DEFAULT: "#333333", medio: "#5A5A5A", claro: "#F3F3F3", linea: "#D9D9D9" },
        ok: { DEFAULT: "#2E7D5B", claro: "#E3F1EA" },
      },
      fontFamily: { sans: ["var(--font-plex)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
