"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const TRADITIONAL = ["Only a final price", "No explanation", "Hidden logic", "One black-box number"];
const LEDGER = [
  "Every adjustment visible",
  "Every premium and discount explained",
  "Comparable-by-comparable calculation",
  "Complete, auditable transparency",
];

export default function ComparisonSection() {
  return (
    <section id="why-different" className="max-w-6xl mx-auto px-6 py-24">
      <div className="max-w-xl mb-14">
        <div className="eyebrow mb-3">Why we&apos;re different</div>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
          Most valuation tools stop at the number.
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="card-surface p-8"
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
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl p-8 border border-gold/40 bg-gradient-to-b from-gold/[0.06] to-transparent"
        >
          <div className="eyebrow mb-6 text-gold">Ledger</div>
          <ul className="space-y-4">
            {LEDGER.map((item) => (
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
