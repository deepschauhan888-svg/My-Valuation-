"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ShieldCheck } from "lucide-react";
import FactorDetailModal from "./FactorDetailModal";
import { FACTOR_DETAILS } from "@/lib/factor-details";

const FLOW = ["Comparable Price", "Premium / Discount", "Adjusted PSF", "Average Adjusted PSF", "Final Market Value"];

const FACTORS = Object.keys(FACTOR_DETAILS);

const PRINCIPLES = [
  "We use the Comparable Sales Method — your property, measured against real comparables.",
  "We do not hide calculations. Every adjustment is visible and clickable.",
  "Area is never adjusted directly — Super Built-up and Carpet Area only feed PSF and Load Factor.",
  "Every premium and discount follows configurable, city-specific rules — not a fixed national formula.",
  "Every valuation is completely explainable, end to end.",
];

export default function MethodologySection() {
  const [openFactor, setOpenFactor] = useState<string | null>(null);

  return (
    <section id="methodology" className="max-w-6xl mx-auto px-6 py-24">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
          <div className="eyebrow mb-3">Our valuation methodology</div>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-6">
            The Comparable Sales Method — laid out step by step.
          </h2>
          <p className="text-navy-400 mb-8 leading-relaxed">
            We compare your property against the ones you bring us across 14 factors. Area and carpet
            area are never adjusted directly — they only feed the PSF and load-factor math. Everything
            else — condition, floor, facing, parking, and more — earns a visible premium or discount.
            <span className="block mt-2 text-sm">Tap any factor below to see exactly how it works.</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {FACTORS.map((f) => (
              <button
                key={f}
                onClick={() => setOpenFactor(f)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-line dark:border-line-dark text-navy-400 hover:border-gold hover:text-gold transition-colors"
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          {FLOW.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.06 }}
                className={`w-full max-w-sm card-surface px-6 py-4 text-center font-display font-semibold ${
                  i === FLOW.length - 1 ? "border-gold text-gold" : ""
                }`}
              >
                {step}
              </motion.div>
              {i < FLOW.length - 1 && <ArrowDown size={18} className="text-navy-400 my-1" />}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-16 card-surface p-8"
      >
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck size={18} className="text-gold" />
          <h3 className="font-display font-semibold text-lg">Our valuation principles</h3>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {PRINCIPLES.map((p) => (
            <li key={p} className="text-sm text-navy-400 leading-relaxed flex gap-2">
              <span className="text-gold shrink-0">—</span>
              {p}
            </li>
          ))}
        </ul>
      </motion.div>

      <FactorDetailModal detail={openFactor ? FACTOR_DETAILS[openFactor] : null} onClose={() => setOpenFactor(null)} />
    </section>
  );
}
