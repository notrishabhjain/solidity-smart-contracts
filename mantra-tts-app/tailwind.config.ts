import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  "#fff8f0",
          100: "#ffeed6",
          200: "#ffd9a8",
          300: "#ffbe70",
          400: "#ff9a38",
          500: "#ff8c00",
          600: "#e67300",
          700: "#c25e00",
          800: "#9c4c00",
          900: "#7a3c00",
        },
        gold: {
          50:  "#fffdf0",
          100: "#fffacc",
          200: "#fff199",
          300: "#ffe566",
          400: "#ffd700",
          500: "#e6c200",
          600: "#c49d00",
          700: "#9c7b00",
          800: "#7a5f00",
          900: "#584400",
        },
        spiritual: {
          bg:      "#0a0807",
          card:    "#12100e",
          border:  "#2a2118",
          muted:   "#4a3d2e",
          text:    "#e8d5b0",
          subtle:  "#9e8a6e",
        },
      },
      fontFamily: {
        devanagari: ["Noto Sans Devanagari", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "pulse-gold":  "pulse-gold 2s ease-in-out infinite",
        "glow":        "glow 3s ease-in-out infinite",
        "float":       "float 6s ease-in-out infinite",
        "waveform":    "waveform 1.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 5px #ffd700, 0 0 10px #ffd700" },
          "50%":       { boxShadow: "0 0 20px #ffd700, 0 0 40px #ffd700" },
        },
        glow: {
          "0%, 100%": { opacity: "0.8" },
          "50%":      { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        waveform: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%":      { transform: "scaleY(1)" },
        },
      },
      backgroundImage: {
        "spiritual-gradient": "linear-gradient(135deg, #0a0807 0%, #1a1208 50%, #0a0807 100%)",
        "gold-gradient":      "linear-gradient(135deg, #ff8c00, #ffd700)",
        "card-gradient":      "linear-gradient(145deg, #1a1510, #0f0c09)",
      },
    },
  },
  plugins: [],
};

export default config;
