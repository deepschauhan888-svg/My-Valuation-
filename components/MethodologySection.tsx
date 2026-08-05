"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import FactorDetailModal, { FactorDetail } from "./FactorDetailModal";
import { LiveCategory } from "@/lib/types";

const FLOW = ["Comparable Price", "Premium / Discount", "Adjusted PSF", "Average Adjusted PSF", "Final Market Value"];

// These two are structural business rules, not admin-editable categories —
// area is never adjusted directly, so they're documented here rather than
// fetched from Supabase like everything else on this page.
const STRUCTURAL_FACTORS: FactorDetail[] = [
  {
    key: "Super Built-up Area",
    definition: "The total area of the unit including its share of common areas — lobbies, stairwells, lift shafts.",
    comparisonRule: "Never compared as an adjustment. Used only to calculate PSF (price ÷ SBA) and Load Factor.",
    adjustmentLogic: "No premium or discount is ever applied for area directly — this is a deliberate rule, not an oversight.",
    example: "A 1,000 sqft and a 1,400 sqft unit are compared on their PSF, not marked up or down for being bigger or smaller.",
    adjustable: false,
  },
  {
    key: "Carpet Area",
    definition: "The actual usable floor area inside the walls of the unit.",
    comparisonRule: "Never compared as an adjustment. Used with SBA to calculate Load Factor.",
    adjustmentLogic: "Feeds Load Factor Efficiency, which is the adjustable factor — carpet area itself is not.",
    example: "SBA 1,000 sqft with 750 sqft carpet → Load Factor 25%, which then feeds the Load Factor rule.",
    adjustable: false,
  },
];

const PRINCIPLES = [
  "The Comparable Sales Method — your property, measured against real ones.",
  "Nothing hidden. Every adjustment is visible and clickable.",
  "Area is never adjusted directly — only used for PSF and Load Factor.",
  "Every rule is city-specific and configurable, not a fixed formula.",
];

function toFactorDetail(cat: LiveCategory): FactorDetail {
  return {
    key: cat.label,
    definition: cat.description ?? "No description configured for this factor yet.",
    comparisonRule: cat.comparisonRule ?? "—",
    adjustmentLogic:
      cat.kind === "matrix"
        ? "Rank difference between subject and comparable, multiplied by the configured percent-per-step."
        : cat.kind === "flat"
          ? "A flat percent is applied to whichever side is favored on this factor."
          : "The comparable's value minus the subject's, multiplied by the configured percent-per-unit.",
    example: cat.example ?? "—",
    adjustable: true,
  };
}

export default function MethodologySection({ categories }: { categories: LiveCategory[] }) {
  const [openFactor, setOpenFactor] = useState<FactorDetail | null>(null);
  const dynamicFactors = categories.filter((c) => c.key !== "loadFactor" || true).map(toFactorDetail);
  // Load Factor is itself shown (it's an adjustable category), just its two
  // structural inputs (area, carpet) are listed separately above.
  const allFactors = [...STRUCTURAL_FACTORS, ...dynamicFactors];

  return (
    <section id="methodology" className="max-w-6xl mx-auto px-6 py-32">
      <div className="grid lg:grid-cols-2 gap-20">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="eyebrow mb-4">Our methodology</div>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-6 measure clip-reveal">
            <motion.span
              initial={{ y: "100%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              The Comparable Sales Method, laid out step by step.
            </motion.span>
          </h2>
          <p className="text-navy-400 mb-4 leading-relaxed measure">
            Every factor below is configured live in the Rule Engine — nothing here is fixed in code. Area is
            never adjusted directly; it only feeds PSF and Load Factor.
          </p>
          <p className="text-sm text-navy-400 mb-8">Tap a factor to see exactly how it works.</p>
          {allFactors.length === 0 ? (
            <p className="text-sm text-navy-400">
              No published rules yet — once an admin publishes a city&apos;s rule set, its factors will appear here automatically.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allFactors.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setOpenFactor(f)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-line dark:border-line-dark text-navy-400 hover:border-gold hover:text-gold transition-colors duration-300 tap-feedback"
                >
                  {f.key}
                </button>
              ))}
            </div>
          )}
        </motion.div>

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

      <FactorDetailModal detail={openFactor} onClose={() => setOpenFactor(null)} />
    </section>
  );
}
