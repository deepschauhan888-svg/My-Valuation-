"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type Line = { label: string; value: string; tone: "neutral" | "premium" | "discount" | "final" };

const SCRIPT: Line[] = [
  { label: "Comparable PSF · Sanskruti Heights", value: "₹10,250", tone: "neutral" },
  { label: "Load Factor — subject leaner by 3.2%", value: "−3.0%", tone: "discount" },
  { label: "Age — comparable newer by 4 yrs", value: "+2.4%", tone: "premium" },
  { label: "Parking — subject has 1 more slot", value: "−1.0%", tone: "discount" },
  { label: "Facing — comparable faces East", value: "+1.0%", tone: "premium" },
  { label: "Floor — subject on higher relative floor", value: "−2.0%", tone: "discount" },
  { label: "Total Adjustment", value: "−2.6%", tone: "neutral" },
  { label: "Adjusted PSF", value: "₹9,983", tone: "final" },
];

const toneClass: Record<Line["tone"], string> = {
  neutral: "text-navy-400",
  premium: "text-premium",
  discount: "text-discount",
  final: "text-gold font-semibold",
};

export default function AuditTrailHero() {
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => (v >= SCRIPT.length ? 1 : v + 1));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
      <div>
        <div className="eyebrow mb-5">Comparable-based · Fully auditable</div>
        <h1 className="font-display font-bold text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] tracking-tight">
          Know your property&apos;s
          <br />
          real value.{" "}
          <span className="bg-gradient-to-r from-gold to-premium bg-clip-text text-transparent">
            See every calculation
          </span>{" "}
          behind it.
        </h1>
        <p className="mt-6 text-lg text-navy-400 max-w-xl">
          Transparent property valuation powered by comparable properties — not a black-box estimate.
          Every premium and discount is shown with its reason, its math, and the rule that produced it.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/valuation"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink font-semibold hover:opacity-90 transition-opacity"
          >
            Start Valuation <ArrowRight size={16} />
          </Link>
          <a
            href="#methodology"
            className="inline-flex items-center h-12 px-6 rounded-full border border-line dark:border-line-dark font-semibold hover:bg-navy-50 dark:hover:bg-white/5 transition-colors"
          >
            See the methodology
          </a>
        </div>
        <div className="mt-10 flex items-center gap-6 text-sm text-navy-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-premium" /> No hidden adjustments
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-premium" /> City-specific rules
          </span>
        </div>
      </div>

      <div className="card-surface p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-line dark:border-line-dark">
          <span className="eyebrow">Live audit trail</span>
          <span className="w-2 h-2 rounded-full bg-premium animate-pulse" />
        </div>
        <div className="space-y-3 min-h-[280px]">
          <AnimatePresence initial={false}>
            {SCRIPT.slice(0, visible).map((line, i) => (
              <motion.div
                key={`${line.label}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className={`flex items-center justify-between text-sm ${
                  line.tone === "final" ? "pt-3 border-t border-line dark:border-line-dark" : ""
                }`}
              >
                <span className={line.tone === "final" ? "font-display font-semibold" : "text-ink/80 dark:text-paper/80"}>
                  {line.label}
                </span>
                <span className={`ledger-figure ${toneClass[line.tone]}`}>{line.value}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
