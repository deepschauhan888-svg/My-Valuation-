"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const TRADITIONAL = ["Only the final value", "Hidden adjustments", "A black-box estimate", "No stated methodology"];
const VALUETRACE = ["Every adjustment, shown", "Every premium and discount, explained", "Calculated step-by-step", "Fully auditable"];

export default function ComparisonSection() {
  return (
    <section id="why-different" className="max-w-4xl mx-auto px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mb-16"
      >
        <div className="eyebrow mb-4">Why we&apos;re different</div>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight measure clip-reveal">
          <motion.span
            initial={{ y: "100%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            Most valuation tools stop at the number.
          </motion.span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line dark:divide-line-dark">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pb-10 md:pb-0 md:pr-12"
        >
          <div className="eyebrow mb-6 text-navy-400">Traditional valuation</div>
          <ul className="space-y-5">
            {TRADITIONAL.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.08 }}
                className="flex items-start gap-3 text-navy-400"
              >
                <X size={15} strokeWidth={1.5} className="text-discount/70 mt-1 shrink-0" />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
          className="pt-10 md:pt-0 md:pl-12"
        >
          <div className="eyebrow mb-6 text-gold">ValueTrace</div>
          <ul className="space-y-5">
            {VALUETRACE.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-3 font-medium"
              >
                <Check size={15} strokeWidth={1.5} className="text-premium mt-1 shrink-0" />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
