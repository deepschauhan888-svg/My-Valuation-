"use client";

import { useState } from "react";
import { AdjustmentLine } from "@/lib/types";
import { formatPercent } from "@/lib/format";
import { ChevronDown } from "lucide-react";

export default function AdjustmentRow({ line }: { line: AdjustmentLine }) {
  const [open, setOpen] = useState(false);
  const isPositive = line.percent > 0;

  return (
    <div className="border-b border-line dark:border-line-dark last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-sm font-medium">{line.label}</span>
        <span className="flex items-center gap-3">
          <span
            className={`ledger-figure text-sm font-semibold ${
              isPositive ? "text-premium" : "text-discount"
            }`}
          >
            {formatPercent(line.percent)}
          </span>
          <ChevronDown
            size={15}
            className={`text-navy-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open && (
        <div className="pb-3 -mt-1 text-xs text-navy-400 leading-relaxed space-y-1">
          <p>{line.reason}</p>
          <p className="font-mono opacity-70">Rule source: {line.ruleSource}</p>
        </div>
      )}
    </div>
  );
}
