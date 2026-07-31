"use client";

import { motion } from "framer-motion";
import { ValuationResult } from "@/lib/types";
import { formatINR, formatPSF } from "@/lib/format";

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className="text-navy-400">{label}</span>
        <span className="ledger-figure font-semibold">{score}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-line dark:bg-line-dark overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-gold to-premium rounded-full"
        />
      </div>
    </div>
  );
}

export default function ResultSummary({ result }: { result: ValuationResult }) {
  return (
    <div className="card-surface p-8">
      <div className="eyebrow mb-2">Final market value</div>
      <div className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-1">
        {formatINR(result.finalMarketValue)}
      </div>
      <div className="text-sm text-navy-400 mb-8">
        Range: {formatINR(result.rangeLow)} – {formatINR(result.rangeHigh)}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <div className="text-xs text-navy-400 mb-1">Average Adjusted PSF</div>
          <div className="ledger-figure font-semibold">{formatPSF(result.averageAdjustedPsf)}</div>
        </div>
        <div>
          <div className="text-xs text-navy-400 mb-1">Subject Area</div>
          <div className="ledger-figure font-semibold">{result.subject.superBuiltUpAreaSqft.toLocaleString("en-IN")} sqft</div>
        </div>
      </div>

      <div className="space-y-5">
        <ScoreBar label="Confidence Score" score={result.confidenceScore} />
        <ScoreBar label="Comparable Reliability Score" score={result.reliabilityScore} />
      </div>
    </div>
  );
}
