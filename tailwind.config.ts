import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { 
        ink: "#030712", 
        stellar: "#6366f1", 
        aqua: "#38bdf8", 
        mint: "#34d399", 
        cloud: "#f3f4f6" 
      },
      boxShadow: { 
        glow: "0 24px 80px rgba(56, 189, 248, 0.15)" 
      },
      backgroundImage: { 
        grid: "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)" 
      },
    },
  },
  plugins: [],
};
export default config;
