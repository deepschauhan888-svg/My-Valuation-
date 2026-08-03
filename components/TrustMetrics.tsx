"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const METRICS = [
  { value: 100, suffix: "%", label: "Transparent Calculations" },
  { value: 14, suffix: "", label: "Comparison Factors" },
  { value: 0, suffix: "", label: "Hidden Adjustments" },
  { value: 100, suffix: "%", label: "Explainable Methodology" },
];

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <div ref={ref} className="ledger-figure font-display font-bold text-4xl md:text-5xl">
      {display}
      {suffix}
    </div>
  );
}

export default function TrustMetrics() {
  return (
    <section className="border-y border-line dark:border-line-dark bg-navy-50/40 dark:bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.06 }}
            className="text-center"
          >
            <Counter value={m.value} suffix={m.suffix} />
            <div className="text-xs md:text-sm text-navy-400 mt-2">{m.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
