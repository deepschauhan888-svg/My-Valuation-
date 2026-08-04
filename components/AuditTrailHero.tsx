"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Headline exploration (kept here for the record — see chat for the full list
 * of fifteen options considered). Selected:
 *   "The number isn't enough. Every rupee should have a reason."
 * — it withholds the product explanation, doesn't explain the mechanism,
 * and reads like something a valuation firm would put on a letterhead
 * rather than a SaaS landing page.
 */

type Tone = "neutral" | "premium" | "discount" | "final" | "value";
type Line = { label: string; value: string; tone: Tone };

const SCRIPT: Line[] = [
  { label: "Comparable · Sanskruti Heights", value: "₹10,250 / sqft", tone: "neutral" },
  { label: "Load Factor", value: "−3.0%", tone: "discount" },
  { label: "Age", value: "+2.4%", tone: "premium" },
  { label: "Parking", value: "−1.0%", tone: "discount" },
  { label: "Floor", value: "−2.0%", tone: "discount" },
  { label: "Adjusted PSF", value: "₹9,983", tone: "final" },
  { label: "Final Value", value: "₹99.8 L", tone: "value" },
];

const toneClass: Record<Tone, string> = {
  neutral: "text-navy-400",
  premium: "text-premium",
  discount: "text-discount",
  final: "text-ink dark:text-paper font-semibold",
  value: "text-gold font-semibold",
};

// Reveal cadence: ~7 lines across ~6.6s (within the requested 6–8s window),
// a breath of anticipation before the first line, then a long, slow hold
// before the sheet quietly resets and loops.
const STEP_DELAY = 1100;
const ANTICIPATION_DELAY = 1300;
const HOLD_AT_END = 4200;

const TRUST_ITEMS = ["Comparable Sales Method", "Fully Transparent", "City-specific Adjustments", "Every Premium Explained"];

const TILT_LIMIT = 2.5; // degrees — kept deliberately small

export default function AuditTrailHero() {
  const [visible, setVisible] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 40]);

  // Subtle cursor-reactive tilt on the card — a few degrees, spring-smoothed.
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 120, damping: 20, mass: 0.5 });
  const springRotateY = useSpring(rotateY, { stiffness: 120, damping: 20, mass: 0.5 });

  function handleCardMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * TILT_LIMIT * 2);
    rotateX.set(-py * TILT_LIMIT * 2);
    cardRef.current?.style.setProperty("--spot-x", `${(px + 0.5) * 100}%`);
    cardRef.current?.style.setProperty("--spot-y", `${(py + 0.5) * 100}%`);
  }
  function handleCardMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

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
      className="relative overflow-hidden max-w-6xl mx-auto px-6 pt-24 pb-32 grid lg:grid-cols-[1fr_1.05fr] gap-20 items-center"
    >
      {/* Very quiet ambient depth — no illustration, just light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 15% 20%, rgba(156,122,69,0.07), transparent 65%)," +
            "radial-gradient(50% 45% at 85% 75%, rgba(61,143,104,0.05), transparent 65%)",
        }}
      />

      <div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-display font-bold text-[clamp(2.6rem,5.2vw,4.6rem)] leading-[1.08] tracking-tight"
        >
          The number isn&apos;t enough.
          <br />
          Every rupee should have a reason.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="mt-8 text-lg text-navy-400 measure leading-relaxed"
        >
          A valuation built on comparable properties, not assumptions. Every adjustment is shown,
          explained, and traceable to the rule behind it.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-8"
        >
          <Link href="/valuation" className="group">
            <motion.span
              whileHover={{ y: -1, backgroundColor: "rgba(0,0,0,0.82)" }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink font-semibold"
            >
              Start Valuation
              <ArrowRight size={16} strokeWidth={1.5} className="transition-transform duration-500 group-hover:translate-x-1" />
            </motion.span>
          </Link>
          <a
            href="#methodology"
            className="link-underline text-navy-400 hover:text-ink dark:hover:text-paper font-medium transition-colors duration-500"
          >
            See the methodology
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap gap-x-8 gap-y-2"
        >
          {TRUST_ITEMS.map((item) => (
            <span key={item} className="flex items-baseline gap-1.5 text-sm text-navy-400">
              <span className="text-premium">✓</span> {item}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut", delay: 0.25 }}
        style={{ perspective: 1200 }}
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
          className="card-surface spotlight-card p-9 shadow-[0_20px_60px_-30px_rgba(10,14,20,0.16)]"
        >
          <div className="flex items-start justify-between mb-7 pb-5 border-b border-line dark:border-line-dark">
            <div>
              <div className="eyebrow mb-1">Valuation Worksheet</div>
              <div className="font-display font-semibold text-sm">Sanskruti Heights, Mumbai</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-mono text-navy-400/70">Ref. VT-2026-014</div>
              <div className="text-[11px] font-mono text-navy-400/70">3 Aug 2026</div>
            </div>
          </div>

          <div className="space-y-0 min-h-[280px]">
            <AnimatePresence mode="popLayout">
              {SCRIPT.slice(0, visible).map((line, i) => {
                const isTotal = line.tone === "final" || line.tone === "value";
                return (
                  <motion.div
                    key={`${line.label}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className={`flex items-baseline justify-between py-3 text-sm ${
                      isTotal ? "mt-2.5 pt-4 border-t border-line dark:border-line-dark" : "border-b border-line/50 dark:border-line-dark/50"
                    }`}
                  >
                    <span className={isTotal ? "font-display font-semibold text-[15px]" : "text-ink/70 dark:text-paper/70"}>
                      {line.label}
                    </span>
                    <motion.span
                      key={line.value}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className={`ledger-figure ${isTotal ? "text-base" : ""} ${toneClass[line.tone]}`}
                    >
                      {line.value}
                    </motion.span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
