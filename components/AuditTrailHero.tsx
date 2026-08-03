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

const STEP_DELAY = 2000;
const HOLD_AT_END = 3400;
const ANTICIPATION_DELAY = 1400;

export default function AuditTrailHero() {
  const [visible, setVisible] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 40]);

  useEffect(() => {
    let cancelled = false;
    let current = 0;

    function tick() {
      const isLast = current >= SCRIPT.length;
      const nextCount = isLast ? 1 : current + 1;
      const delayForThisStep = current === 0 ? ANTICIPATION_DELAY : isLast ? HOLD_AT_END : STEP_DELAY;

      window.setTimeout(() => {
        if (cancelled) return;
        setVisible(nextCount);
        current = nextCount;
        tick();
      }, delayForThisStep);
    }
    tick();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      style={{ opacity, y }}
      className="max-w-6xl mx-auto px-6 pt-24 pb-32 grid lg:grid-cols-[1.1fr_0.9fr] gap-20 items-center"
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
          className="font-display font-bold text-[clamp(2.6rem,5.2vw,4.6rem)] leading-[1.06] tracking-tight"
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
          className="mt-8 text-lg text-navy-400 measure leading-relaxed"
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
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink font-semibold"
            >
              Start Valuation
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5"  strokeWidth={1.5}/>
            </motion.span>
          </Link>
          <a href="#methodology" className="group">
            <motion.span
              whileHover={{ y: -1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
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
            <CheckCircle2 size={15} className="text-premium"  strokeWidth={1.5}/> No hidden adjustments
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-premium"  strokeWidth={1.5}/> City-specific rules
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="card-surface p-8 shadow-[0_8px_30px_-20px_rgba(10,14,20,0.14)]"
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
