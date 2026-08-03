"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const TRADITIONAL = [
  "Shows only the final value",
  "Hidden adjustments",
  "Black-box estimate",
  "No stated methodology",
  "No transparency",
];
const VALUETRACE = [
  "Shows every adjustment",
  "Shows every premium",
  "Shows every discount",
  "Shows calculation step-by-step",
  "Shows the reason behind each adjustment",
  "Comparable-by-comparable valuation",
  "Fully auditable",
];

export default function ComparisonSection() {
  return (
    <section id="why-different" className="max-w-6xl mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl mb-14"
      >
        <div className="eyebrow mb-3">Why we&apos;re different</div>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
          Most valuation tools stop at the number.
        </h2>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="card-surface card-lift p-8"
        >
          <div className="eyebrow mb-6 text-navy-400">Traditional valuation</div>
          <ul className="space-y-4">
            {TRADITIONAL.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-navy-400">
                <X size={16} className="text-discount mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="card-lift rounded-2xl p-8 border border-gold/40 bg-surface dark:bg-surface-dark"
        >
          <div className="eyebrow mb-6 text-gold">ValueTrace</div>
          <ul className="space-y-4">
            {VALUETRACE.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm font-medium">
                <Check size={16} className="text-premium mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
