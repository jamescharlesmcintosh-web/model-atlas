import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Newsreader", "Georgia", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      },
      colors: {
        ink: {
          950: "#07090f",
          900: "#0b0e16",
          850: "#10141f",
          800: "#151b2a",
          700: "#1e2638"
        },
        mist: "#9aa4b8",
        accent: {
          DEFAULT: "#7c6cff",
          soft: "#a79bff",
          dim: "#4a4380"
        },
        mint: "#5eead4",
        amberish: "#fbbf24"
      },
      boxShadow: {
        glass: "0 8px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)",
        card: "0 10px 30px rgba(0,0,0,.35)"
      },
      backdropBlur: { xs: "2px" }
    }
  },
  plugins: []
};
export default config;
