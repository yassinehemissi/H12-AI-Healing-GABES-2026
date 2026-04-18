"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

type ThemeMode = "light" | "dark"

const STORAGE_KEY = "dashboard-theme"

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  if (theme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

export function DashboardThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light"
    }
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    return (
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    )
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark"
    setTheme(next)
    applyTheme(next)
    localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggleTheme}
      className="border-zinc-900/15 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
