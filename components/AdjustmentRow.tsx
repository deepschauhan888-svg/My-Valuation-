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
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="text-sm font-medium group-hover:text-gold transition-colors">{line.label}</span>
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
           strokeWidth={1.5}/>
        </span>
      </button>
      {open && (
        <div className="pb-4 -mt-1 text-xs text-navy-400 leading-relaxed space-y-3">
          <p className="text-ink/80 dark:text-paper/80">{line.reason}</p>

          <div className="rounded-lg bg-navy-50 dark:bg-white/5 p-3 font-mono text-[11px] leading-relaxed">
            {line.calculation}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
            <div>
              <dt className="uppercase tracking-wide text-[10px] opacity-70">Rule name</dt>
              <dd className="font-medium text-ink/80 dark:text-paper/80">{line.ruleName}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-[10px] opacity-70">City rule</dt>
              <dd className="font-medium text-ink/80 dark:text-paper/80">{line.city}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-[10px] opacity-70">Version / effective</dt>
              <dd className="font-medium text-ink/80 dark:text-paper/80">v{line.version} · {line.effectiveDate}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-[10px] opacity-70">Configured by</dt>
              <dd className="font-medium text-ink/80 dark:text-paper/80">{line.configuredBy}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
