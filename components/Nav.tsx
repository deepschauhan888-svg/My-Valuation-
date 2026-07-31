"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-paper/70 dark:bg-ink/70 border-b border-line dark:border-line-dark">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <span className="w-2 h-2 rounded-full bg-gold" />
          ValueTrace
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-navy-400">
          <a href="/#how-it-works" className="hover:text-ink dark:hover:text-paper transition-colors">
            How it works
          </a>
          <a href="/#methodology" className="hover:text-ink dark:hover:text-paper transition-colors">
            Methodology
          </a>
          <a href="/#why-different" className="hover:text-ink dark:hover:text-paper transition-colors">
            Why we&apos;re different
          </a>
          <Link href="/playground" className="hover:text-ink dark:hover:text-paper transition-colors">
            Playground
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/valuation"
            className="hidden sm:inline-flex items-center h-9 px-4 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Start Valuation
          </Link>
        </div>
      </div>
    </header>
  );
}
