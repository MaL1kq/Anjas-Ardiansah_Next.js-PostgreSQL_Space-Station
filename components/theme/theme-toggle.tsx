"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "space-station-theme";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("light", mode === "light");
  root.style.colorScheme = mode;
}

export function ThemeToggle() {
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const storedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextMode: ThemeMode = storedMode === "light" ? "light" : "dark";

    setMode(nextMode);
    applyTheme(nextMode);
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextMode: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(nextMode);
    applyTheme(nextMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
  };

  const isLightMode = mode === "light";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 px-3 border border-slate-700/80 bg-slate-900/40 hover:bg-slate-800/70 text-slate-300 hover:text-white"
      aria-label={isLightMode ? "Aktifkan dark mode" : "Aktifkan light mode"}
      title={isLightMode ? "Ganti ke Dark Mode" : "Ganti ke Light Mode"}
    >
      {isLightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="hidden sm:inline">{isMounted ? (isLightMode ? "Light" : "Dark") : "Dark"}</span>
    </Button>
  );
}