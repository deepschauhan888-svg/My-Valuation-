import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F7F4",
        ink: "#0A0E14",
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#10151F",
        },
        line: {
          DEFAULT: "#E7E6E1",
          dark: "#232A38",
        },
        gold: {
          DEFAULT: "#B8862E",
          soft: "#E7C787",
        },
        premium: {
          DEFAULT: "#1F9D6F",
          soft: "#D3EEE1",
        },
        discount: {
          DEFAULT: "#C24B3F",
          soft: "#F5DAD5",
        },
        navy: {
          50: "#EEF1F6",
          400: "#4A5C7A",
          700: "#1B2436",
          900: "#0A0E14",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "grain": "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)",
      },
      keyframes: {
        "ledger-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "count-tick": {
          "0%": { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "ledger-in": "ledger-in 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
