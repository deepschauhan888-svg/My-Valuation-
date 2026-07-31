"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ComparableResult } from "@/lib/types";
import { formatPSF, formatPercent } from "@/lib/format";
import AdjustmentRow from "./AdjustmentRow";
import { ChevronRight } from "lucide-react";

export default function ComparableResultCard({ result, index }: { result: ComparableResult; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card-surface overflow-hidden"
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div>
          <div className="eyebrow mb-1">Comparable {index + 1}</div>
          <div className="font-display font-semibold">{result.comparable.society || result.comparable.label}</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-navy-400">Base PSF</div>
            <div className="ledger-figure text-sm">{formatPSF(result.derived.psf)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-navy-400">Adjusted PSF</div>
            <div className="ledger-figure text-sm font-semibold text-gold">{formatPSF(result.adjustedPsf)}</div>
          </div>
          <ChevronRight size={16} className={`text-navy-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>
      </button>

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
