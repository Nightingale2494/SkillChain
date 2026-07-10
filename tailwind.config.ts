import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#06111f", stellar: "#7c3aed", aqua: "#00d4ff", mint: "#2fffc2", cloud: "#f7fbff" },
      boxShadow: { glow: "0 24px 80px rgba(0, 212, 255, 0.22)" },
      backgroundImage: { grid: "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)" },
    },
  },
  plugins: [],
};
export default config;
