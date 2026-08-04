"use client";

import { useState } from "react";
import { ComparableResult } from "@/lib/types";
import { formatPercent } from "@/lib/format";
import { Sparkles, Send } from "lucide-react";

function answerFor(question: string, results: ComparableResult[]): string {
  const q = question.toLowerCase();
  const allLines = results.flatMap((r) => r.adjustments);

  const match = allLines.find((l) => q.includes(l.label.toLowerCase()) || q.includes(l.key.toLowerCase()));
  if (match) {
    const direction = match.percent > 0 ? "increased" : "decreased";
    return `${match.label} ${direction} the adjusted PSF by ${formatPercent(match.percent)} on that comparable. ${match.reason} Calculation: ${match.calculation}`;
  }

  if (q.includes("confidence")) {
    return "Confidence reflects how tightly your comparables' adjusted PSFs cluster together. A wider spread across comparables lowers confidence, since it means comparables disagree more after adjustment.";
  }
  if (q.includes("range") || q.includes("low") || q.includes("high")) {
    return "The value range widens or narrows based on the same spread that drives the confidence score — tighter agreement between comparables produces a narrower range.";
  }
  if (q.includes("quality") || q.includes("star")) {
    return "Comparable quality is scored from concrete checks — same society, same city, similar configuration, similar age, similar area, no legal flags, similar furnishing. Each met check adds to the score.";
  }

  const topFactor = [...allLines].sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))[0];
  if (topFactor) {
    return `I couldn't match that to a specific factor, but the single biggest driver in this valuation was ${topFactor.label} (${formatPercent(topFactor.percent)}). Try asking about a specific factor by name, like "${topFactor.label}".`;
  }
  return "Run a valuation first, then ask about any factor — Load Factor, Age, Floor, Facing, Parking, and so on — and I'll explain exactly how it moved the number.";
}

const SUGGESTED = ["Why did Floor change my valuation?", "Explain the Load Factor adjustment", "Why was Parking adjusted?"];

export default function AskAiPanel({ results }: { results: ComparableResult[] }) {
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState<{ q: string; a: string }[]>([]);

  function ask(q: string) {
    if (!q.trim()) return;
    const a = answerFor(q, results);
    setThread((t) => [...t, { q, a }]);
    setQuestion("");
  }

  return (
    <div className="card-surface p-6">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-gold"  strokeWidth={1.5}/>
        <h3 className="font-display font-semibold">Ask about this valuation</h3>
      </div>
      <p className="text-xs text-navy-400 mb-4">
        Plain-language answers generated from this valuation&apos;s own adjustment data — not a general chatbot.
      </p>

      {thread.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-line dark:border-line-dark text-navy-400 hover:border-gold hover:text-gold transition-colors tap-feedback"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {thread.length > 0 && (
        <div className="space-y-4 mb-4 max-h-72 overflow-y-auto pr-1">
          {thread.map((t, i) => (
            <div key={i}>
              <div className="text-sm font-medium mb-1">{t.q}</div>
              <div className="text-sm text-navy-400 leading-relaxed">{t.a}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(question)}
          placeholder="Ask why any factor changed the valuation…"
          className="flex-1 h-10 px-3 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <button
          onClick={() => ask(question)}
          aria-label="Ask"
          className="w-10 h-10 grid place-items-center rounded-lg bg-ink text-paper dark:bg-paper dark:text-ink hover:opacity-90 transition-opacity shrink-0 tap-feedback"
        >
          <Send size={15}  strokeWidth={1.5}/>
        </button>
      </div>
    </div>
  );
}
