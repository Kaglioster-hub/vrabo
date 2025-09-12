"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const current = theme === "system" ? systemTheme : theme;
  const isDark = current === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Cambia tema"
      aria-pressed={isDark}
      className="btn btn-outline glass dark:glass-dark focus-ring flex items-center gap-2"
    >
      {isDark ? (
        // ☀️ Sun
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5"
        >
          <path
            stroke="currentColor"
            strokeWidth="1.5"
            d="M12 4v2m0 12v2M4 12H2m20 0h-2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ) : (
        // 🌙 Moon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5"
        >
          <path
            stroke="currentColor"
            strokeWidth="1.5"
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
          />
        </svg>
      )}
      <span className="hidden sm:inline">
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  );
}
