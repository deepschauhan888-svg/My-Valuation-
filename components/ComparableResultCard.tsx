"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ComparableResult } from "@/lib/types";
import { formatPSF, formatPercent } from "@/lib/format";
import AdjustmentRow from "./AdjustmentRow";
import AnimatedNumber from "./AnimatedNumber";
import { ChevronRight, Star, Check, X } from "lucide-react";

function QualityBadge({ quality }: { quality: ComparableResult["quality"] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-line dark:border-line-dark hover:border-gold transition-colors tap-feedback"
      >
        <span className="flex text-gold">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={11} fill={i < quality.stars ? "currentColor" : "none"} strokeWidth={1.5} />
          ))}
        </span>
        {quality.percent}%
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-64 card-surface p-4 text-left shadow-lg">
          <div className="font-display font-semibold text-sm mb-2">{quality.label}</div>
          <ul className="space-y-1.5">
            {quality.reasons.map((r) => (
              <li key={r.label} className="flex items-center gap-2 text-xs">
                {r.met ? (
                  <Check size={13} className="text-premium shrink-0"  strokeWidth={1.5}/>
                ) : (
                  <X size={13} className="text-discount shrink-0"  strokeWidth={1.5}/>
                )}
                <span className={r.met ? "" : "text-navy-400"}>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ComparableResultCard({ result, index }: { result: ComparableResult; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
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
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.06 }}
      className="card-surface card-lift spotlight-card overflow-hidden"
    >
      <div className="w-full flex items-center justify-between p-6 text-left">
        <button onClick={() => setExpanded((e) => !e)} className="flex-1 text-left tap-feedback">
          <div className="eyebrow mb-1">Comparable {index + 1}</div>
          <div className="font-display font-semibold">{result.comparable.society || result.comparable.label}</div>
        </button>
        <div className="flex items-center gap-5">
          <QualityBadge quality={result.quality} />
          <div className="text-right">
            <div className="text-xs text-navy-400">Base PSF</div>
            <div className="ledger-figure text-sm">{formatPSF(result.derived.psf)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-navy-400">Adjusted PSF</div>
            <div className="ledger-figure text-sm font-semibold text-gold">
              <AnimatedNumber value={result.adjustedPsf} format={formatPSF} />
            </div>
          </div>
          <button onClick={() => setExpanded((e) => !e)} aria-label="Toggle breakdown" className="tap-feedback">
            <ChevronRight size={16} className={`text-navy-400 transition-transform ${expanded ? "rotate-90" : ""}`}  strokeWidth={1.5}/>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6">
          <div className="border-t border-line dark:border-line-dark pt-2">
            {result.adjustments.length === 0 ? (
              <p className="text-sm text-navy-400 py-3">No adjustments — this comparable matches the subject on every factor.</p>
            ) : (
              result.adjustments.map((line) => <AdjustmentRow key={line.key} line={line} />)
            )}
          </div>
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-line dark:border-line-dark">
            <span className="text-sm font-semibold">Total Adjustment</span>
            <span
              className={`ledger-figure text-sm font-semibold ${
                result.totalAdjustmentPercent >= 0 ? "text-premium" : "text-discount"
              }`}
            >
              {formatPercent(result.totalAdjustmentPercent)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
