import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        panna: "#f7f2e8",
      },
      boxShadow: {
        glow: "0 0 40px rgba(250, 204, 21, 0.15)"
      },
      backgroundImage: {
        "radial-dark": "radial-gradient(circle at 30% 20%, #0d0d0d, #050505 80%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
