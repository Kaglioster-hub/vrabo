import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: "#facc15",
          gold2: "#fde047",
          emerald: "#22c55e",
          charcoal: "#0b0b0c",
          ink: "#0f1115"
        }
      },
      boxShadow: {
        glow: "0 0 40px rgba(250, 204, 21, 0.15)",
      },
      backgroundImage: {
        cosmic: "radial-gradient(1200px 800px at 15% 10%, rgba(250,204,21,.15), transparent 60%), radial-gradient(1200px 800px at 85% 90%, rgba(34,197,94,.15), transparent 60%), linear-gradient(180deg, #0b0b0c 0%, #0f1115 100%)",
      }
    },
  },
  plugins: [],
} satisfies Config;
