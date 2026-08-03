"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import FactorDetailModal from "./FactorDetailModal";
import { FACTOR_DETAILS } from "@/lib/factor-details";

const FLOW = ["Comparable Price", "Premium / Discount", "Adjusted PSF", "Average Adjusted PSF", "Final Market Value"];

const FACTORS = Object.keys(FACTOR_DETAILS);

const PRINCIPLES = [
  "The Comparable Sales Method — your property, measured against real ones.",
  "Nothing hidden. Every adjustment is visible and clickable.",
  "Area is never adjusted directly — only used for PSF and Load Factor.",
  "Every rule is city-specific and configurable, not a fixed formula.",
];

export default function MethodologySection() {
  const [openFactor, setOpenFactor] = useState<string | null>(null);

  return (
    <section id="methodology" className="max-w-6xl mx-auto px-6 py-32">
      <div className="grid lg:grid-cols-2 gap-20">
        <div>
          <div className="eyebrow mb-4">Our methodology</div>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-6 measure">
            The Comparable Sales Method, laid out step by step.
          </h2>
          <p className="text-navy-400 mb-4 leading-relaxed measure">
            Fourteen factors, compared one at a time. Area is never adjusted directly — it only feeds
            PSF and Load Factor. Everything else earns a visible premium or discount.
          </p>
          <p className="text-sm text-navy-400 mb-8">Tap a factor to see exactly how it works.</p>
          <div className="flex flex-wrap gap-2">
            {FACTORS.map((f) => (
              <button
                key={f}
                onClick={() => setOpenFactor(f)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-line dark:border-line-dark text-navy-400 hover:border-gold hover:text-gold transition-colors duration-300"
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
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.08 }}
                className={`w-full max-w-sm card-surface px-6 py-4 text-center font-display font-semibold ${
                  i === FLOW.length - 1 ? "border-gold text-gold" : ""
                }`}
              >
                {step}
              </motion.div>
              {i < FLOW.length - 1 && <ArrowDown size={16} strokeWidth={1.5} className="text-navy-400/60 my-1.5" />}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mt-28 pt-16 border-t border-line dark:border-line-dark"
      >
        <div className="eyebrow mb-6">Our principles</div>
        <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
          {PRINCIPLES.map((p) => (
            <li key={p} className="text-navy-400 leading-relaxed measure">
              {p}
            </li>
          ))}
        </ul>
      </motion.div>

      <FactorDetailModal detail={openFactor ? FACTOR_DETAILS[openFactor] : null} onClose={() => setOpenFactor(null)} />
    </section>
  );
}
