"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FactorDetail } from "@/lib/factor-details";

export default function FactorDetailModal({
  detail,
  onClose,
}: {
  detail: FactorDetail | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {detail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="card-surface w-full max-w-lg p-7 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="eyebrow mb-1">{detail.adjustable ? "Adjustable factor" : "Reference factor"}</div>
                <h3 className="font-display font-bold text-xl">{detail.key}</h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 grid place-items-center rounded-full hover:bg-navy-50 dark:hover:bg-white/5 transition-colors shrink-0"
              >
                <X size={16}  strokeWidth={1.5}/>
              </button>
            </div>

            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400 mb-1">Definition</dt>
                <dd className="leading-relaxed">{detail.definition}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400 mb-1">Comparison rule</dt>
                <dd className="leading-relaxed">{detail.comparisonRule}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400 mb-1">Adjustment logic</dt>
                <dd className="leading-relaxed">{detail.adjustmentLogic}</dd>
              </div>
              <div className="rounded-xl bg-navy-50 dark:bg-white/5 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-navy-400 mb-1">Example</dt>
                <dd className="leading-relaxed">{detail.example}</dd>
              </div>
            </dl>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
