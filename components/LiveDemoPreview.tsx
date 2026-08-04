"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowLeftRight } from "lucide-react";

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1600;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [active, target]);
  return value;
}

export default function LiveDemoPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const psf = useCountUp(9983, inView);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current?.style.setProperty("--spot-x", `${x}%`);
    cardRef.current?.style.setProperty("--spot-y", `${y}%`);
  }

  return (
    <section ref={ref} className="relative overflow-hidden max-w-5xl mx-auto px-6 py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="w-[50vw] h-[50vw] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(156,122,69,0.08), transparent 70%)" }}
        />
      </div>

      <div className="text-center measure mx-auto mb-16">
        <div className="eyebrow mb-4">See it work first</div>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
          The whole workflow, before you enter a number.
        </h2>
      </div>

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="card-surface spotlight-card p-10 grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-8 items-center"
      >
        <div>
          <div className="eyebrow mb-3">Subject</div>
          <ul className="space-y-1.5 text-sm">
            <li className="ledger-figure">2BHK · 5 yrs</li>
            <li className="ledger-figure">Floor 6 / 20</li>
            <li className="ledger-figure">1 parking slot</li>
          </ul>
        </div>

        <ArrowLeftRight size={18} className="text-navy-400 mx-auto hidden md:block"  strokeWidth={1.5}/>

        <div>
          <div className="eyebrow mb-3">Comparable</div>
          <ul className="space-y-1.5 text-sm">
            <li className="ledger-figure">3BHK · 3 yrs</li>
            <li className="ledger-figure">Floor 16 / 20</li>
            <li className="ledger-figure">2 parking slots</li>
          </ul>
        </div>

        <ArrowRight size={18} className="text-navy-400 mx-auto hidden md:block"  strokeWidth={1.5}/>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          <div className="eyebrow mb-3">Adjusted PSF</div>
          <div className="ledger-figure font-display font-bold text-3xl text-gold">
            ₹{psf.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-navy-400 mt-1.5">after 4 visible adjustments</div>
        </motion.div>
      </div>

      <div className="text-center mt-14">
        <Link
          href="/valuation"
          className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink font-semibold transition-all hover:opacity-90 hover:-translate-y-px tap-feedback"
        >
          Start Your Valuation <ArrowRight size={16}  strokeWidth={1.5}/>
        </Link>
      </div>
    </section>
  );
}
