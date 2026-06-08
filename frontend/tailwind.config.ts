import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate"

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        protein: "#e11d48",
        carbs: "#16a34a",
        fat: "#2563eb",
        vegetable: "#ca8a04",
        fruit: "#0891b2",
        fiber: "#a21caf",
        surface: "#fafafa",
        foreground: "#0a0a0a",
        muted: "#f5f5f5",
        "muted-foreground": "#737373",
        border: "#e5e7eb",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [animate],
}

export default config
