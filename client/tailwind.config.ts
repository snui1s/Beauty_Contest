import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // Deep obsidian dark background
        surface: "#18181b",    // Elevated slate dark panels
        neonCyan: "#00f0ff",   // Cyberpunk Electric Blue
        neonCrimson: "#ff003c",// Death/Acid glowing Red
        neonAmber: "#ffb700",  // Alert glowing Gold
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-glow-cyan": "pulseGlowCyan 2s infinite ease-in-out",
        "pulse-glow-crimson": "pulseGlowCrimson 2s infinite ease-in-out",
        "scanline": "scanline 6s linear infinite",
        "fade-in-up": "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        pulseGlowCyan: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0, 240, 255, 0.2), inset 0 0 5px rgba(0, 240, 255, 0.1)" },
          "50%": { boxShadow: "0 0 18px rgba(0, 240, 255, 0.6), inset 0 0 10px rgba(0, 240, 255, 0.3)" },
        },
        pulseGlowCrimson: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(255, 0, 60, 0.2), inset 0 0 5px rgba(255, 0, 60, 0.1)" },
          "50%": { boxShadow: "0 0 18px rgba(255, 0, 60, 0.6), inset 0 0 10px rgba(255, 0, 60, 0.3)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" }
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
    },
  },
  plugins: [],
};
export default config;
