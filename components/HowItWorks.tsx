"use client";

import { motion } from "framer-motion";

const STEPS = [
  { title: "Enter your property", copy: "The details that actually move value." },
  { title: "Add comparables", copy: "Listings or transactions to weigh against." },
  { title: "The engine compares", copy: "Load factor, floor, facing, condition — one by one." },
  { title: "Premiums & discounts apply", copy: "Each comparable marked up or down, visibly." },
  { title: "Adjusted PSF is calculated", copy: "Comparable PSF minus its total adjustment." },
  { title: "Your market value appears", copy: "Averaged, ranged, and scored for confidence." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-3xl mx-auto px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mb-16"
      >
        <div className="eyebrow mb-4">How it works</div>
        <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight measure clip-reveal">
          <motion.span
            initial={{ y: "100%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            Six steps. Every one of them visible.
          </motion.span>
        </h2>
      </motion.div>

      <div>
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.09 }}
            className="grid grid-cols-[3.5rem_1fr] md:grid-cols-[5rem_1fr] gap-6 md:gap-10 py-8 border-t border-line dark:border-line-dark last:border-b"
          >
            <span className="font-display font-light text-3xl md:text-4xl text-gold/70 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-display font-semibold text-lg mb-1.5">{step.title}</h3>
              <p className="text-navy-400 leading-relaxed measure">{step.copy}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
