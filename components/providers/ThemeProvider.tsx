"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark" | "auto"

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: "light" | "dark"
}>({
  theme: "auto",
  setTheme: () => {},
  effectiveTheme: "light",
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("auto")
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme
    if (stored) setThemeState(stored)
  }, [])

  useEffect(() => {
    if (theme === "auto") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setEffectiveTheme(isDark ? "dark" : "light")
      
      const listener = (e: MediaQueryListEvent) => {
        setEffectiveTheme(e.matches ? "dark" : "light")
      }
      
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      mq.addEventListener("change", listener)
      return () => mq.removeEventListener("change", listener)
    } else {
      setEffectiveTheme(theme)
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", effectiveTheme === "dark")
  }, [effectiveTheme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
