"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const FLOW = ["Comparable Price", "Premium / Discount", "Adjusted PSF", "Average Adjusted PSF", "Final Market Value"];

const FACTORS = [
  "Super Built-up Area",
  "Carpet Area",
  "Load Factor",
  "Age of Property",
  "Unit Type",
  "Construction Status",
  "Property Condition",
  "Furnishing",
  "Floor Number",
  "Facing",
  "Parking",
  "Balcony",
  "Legal Issues",
  "Unique Features",
];

export default function MethodologySection() {
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
          </p>
          <div className="flex flex-wrap gap-2">
            {FACTORS.map((f) => (
              <span
                key={f}
                className="text-xs font-medium px-3 py-1.5 rounded-full border border-line dark:border-line-dark text-navy-400"
              >
                {f}
              </span>
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
                transition={{ duration: 0.3, delay: i * 0.06 }}
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
    </section>
  );
}
