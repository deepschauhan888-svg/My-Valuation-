"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

type Line = { label: string; value: string; tone: "neutral" | "premium" | "discount" | "final" | "value" };

const SCRIPT: Line[] = [
  { label: "Comparable PSF · Sanskruti Heights", value: "₹10,250", tone: "neutral" },
  { label: "Load Factor", value: "−3.0%", tone: "discount" },
  { label: "Floor", value: "−2.0%", tone: "discount" },
  { label: "Parking", value: "−1.0%", tone: "discount" },
  { label: "Age", value: "+2.4%", tone: "premium" },
  { label: "Adjusted PSF", value: "₹9,983", tone: "final" },
  { label: "Market Value", value: "₹99.8 L", tone: "value" },
];

const toneClass: Record<Line["tone"], string> = {
  neutral: "text-navy-400",
  premium: "text-premium",
  discount: "text-discount",
  final: "text-ink dark:text-paper font-semibold",
  value: "text-gold font-semibold",
};

const STEP_DELAY = 1900;
const HOLD_AT_END = 3200;

export default function AuditTrailHero() {
  const [visible, setVisible] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 40]);

  useEffect(() => {
    let cancelled = false;
    function schedule(next: number) {
      const delay = next > SCRIPT.length ? HOLD_AT_END : STEP_DELAY;
      window.setTimeout(() => {
        if (cancelled) return;
        setVisible(next > SCRIPT.length ? 1 : next);
        schedule(next > SCRIPT.length ? 2 : next + 1);
      }, delay);
    }
    schedule(2);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity, y }}
      className="max-w-6xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center"
    >
      <div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="eyebrow mb-6"
        >
          Comparable-based · Fully auditable
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
          className="font-display font-bold text-[clamp(2.4rem,5vw,4rem)] leading-[1.08] tracking-tight"
        >
          Know your property&apos;s
          <br />
          real value.{" "}
          <span className="relative whitespace-nowrap">
            <span className="relative z-10">See every calculation</span>
            <span className="absolute left-0 right-0 bottom-1 h-[0.3em] bg-gold/20 -z-0" aria-hidden />
          </span>{" "}
          behind it.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="mt-7 text-lg text-navy-400 max-w-xl leading-relaxed"
        >
          Transparent property valuation powered by comparable properties — not a black-box estimate.
          Every premium and discount is shown with its reason, its math, and the rule that produced it.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link href="/valuation" className="group">
            <motion.span
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink font-semibold"
            >
              Start Valuation
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </motion.span>
          </Link>
          <a href="#methodology" className="group">
            <motion.span
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center h-12 px-6 rounded-full border border-line dark:border-line-dark font-semibold group-hover:border-gold group-hover:text-gold transition-colors"
            >
              See the methodology
            </motion.span>
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-11 flex items-center gap-6 text-sm text-navy-400"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-premium" /> No hidden adjustments
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-premium" /> City-specific rules
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="card-surface p-7 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.22)]"
      >
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-line dark:border-line-dark">
          <span className="eyebrow">Watching a valuation take shape</span>
          <span className="w-1.5 h-1.5 rounded-full bg-premium animate-pulse" />
        </div>
        <div className="space-y-4 min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {SCRIPT.slice(0, visible).map((line, i) => (
              <motion.div
                key={`${line.label}-${i}`}
                initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`flex items-center justify-between text-sm ${
                  line.tone === "final" || line.tone === "value" ? "pt-3.5 border-t border-line dark:border-line-dark" : ""
                }`}
              >
                <span
                  className={
                    line.tone === "final" || line.tone === "value"
                      ? "font-display font-semibold"
                      : "text-ink/70 dark:text-paper/70"
                  }
                >
                  {line.label}
                </span>
                <span className={`ledger-figure ${toneClass[line.tone]}`}>{line.value}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.section>
  );
}
