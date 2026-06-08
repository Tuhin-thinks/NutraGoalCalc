import { useState, useEffect } from "react"

const THEME_KEY = "nutragocalc_theme"

type Theme = "light" | "dark"

function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === "dark" || saved === "light") return saved
  } catch { /* ignore */ }
  return "light"
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(loadTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    try { localStorage.setItem(THEME_KEY, theme) } catch { /* ignore */ }
  }, [theme])

  const toggle = () => setTheme((prev) => (prev === "light" ? "dark" : "light"))

  return { theme, toggle }
}
