"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ledger-theme", next ? "dark" : "light");
    setIsDark(next);
  }

  if (isDark === null) {
    return <div className="w-9 h-9" aria-hidden />;
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="w-9 h-9 grid place-items-center rounded-full border border-line dark:border-line-dark hover:bg-navy-50 dark:hover:bg-white/5 transition-colors"
    >
      {isDark ? <Sun size={16}  strokeWidth={1.5}/> : <Moon size={16}  strokeWidth={1.5}/>}
    </button>
  );
}
