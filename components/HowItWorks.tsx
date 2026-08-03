"use client";

import { motion } from "framer-motion";
import { Home, ListPlus, GitCompareArrows, SlidersHorizontal, Calculator, BadgeIndianRupee } from "lucide-react";

const STEPS = [
  { icon: Home, title: "Enter your property", copy: "Area, age, floor, condition — the details that actually move value." },
  { icon: ListPlus, title: "Add comparables", copy: "Nearby listings or recent transactions you want the engine to weigh against." },
  { icon: GitCompareArrows, title: "Engine compares every feature", copy: "Load factor, floor, facing, parking, condition — one by one." },
  { icon: SlidersHorizontal, title: "Premiums & discounts applied", copy: "Each comparable is marked up or down on a like-for-like basis." },
  { icon: Calculator, title: "Adjusted PSF calculated", copy: "Comparable PSF minus its total adjustment — shown, not hidden." },
  { icon: BadgeIndianRupee, title: "Final market value generated", copy: "Averaged across comparables, with a confidence score attached." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl mb-14"
      >
        <div className="eyebrow mb-3">How it works</div>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
          Six steps. Every one of them visible.
        </h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-px bg-line dark:bg-line-dark rounded-2xl overflow-hidden border border-line dark:border-line-dark">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: (i % 3) * 0.08 }}
            className="bg-surface dark:bg-surface-dark p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-28px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="ledger-figure text-xs text-navy-400">{String(i + 1).padStart(2, "0")}</span>
              <step.icon size={20} className="text-gold" strokeWidth={1.75} />
            </div>
            <h3 className="font-display font-semibold text-base mb-1.5">{step.title}</h3>
            <p className="text-sm text-navy-400 leading-relaxed">{step.copy}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
