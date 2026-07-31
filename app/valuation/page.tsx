"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import PropertyForm from "@/components/PropertyForm";
import ComparableResultCard from "@/components/ComparableResultCard";
import ResultSummary from "@/components/ResultSummary";
import { blankSubject, blankComparable } from "@/lib/blank-property";
import { PropertyInput, ValuationResult } from "@/lib/types";
import { calculateValuation } from "@/lib/valuation-engine";
import { getRuleSetForCity } from "@/lib/rules-data";
import { Plus, Calculator } from "lucide-react";

export default function ValuationPage() {
  const [subject, setSubject] = useState<PropertyInput>(blankSubject());
  const [comparables, setComparables] = useState<PropertyInput[]>([blankComparable(1), blankComparable(2)]);
  const [result, setResult] = useState<ValuationResult | null>(null);

  function addComparable() {
    setComparables((c) => [...c, blankComparable(c.length + 1)]);
  }

  function updateComparable(id: string, next: PropertyInput) {
    setComparables((c) => c.map((item) => (item.id === id ? next : item)));
  }

  function removeComparable(id: string) {
    setComparables((c) => c.filter((item) => item.id !== id));
  }

  function runValuation() {
    const rules = getRuleSetForCity(subject.city);
    const validComparables = comparables.filter((c) => c.salePrice && c.salePrice > 0);
    setResult(calculateValuation(subject, validComparables, rules));
  }

  return (
    <main>
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="mb-10">
          <div className="eyebrow mb-3">Start valuation</div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
            Enter your property, then bring the comparables.
          </h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
          <div className="space-y-6">
            <PropertyForm value={subject} onChange={setSubject} />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold">Comparable properties</h2>
                <button
                  onClick={addComparable}
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-full border border-line dark:border-line-dark hover:bg-navy-50 dark:hover:bg-white/5 transition-colors"
                >
                  <Plus size={14} /> Add comparable
                </button>
              </div>
              {comparables.map((c) => (
                <PropertyForm
                  key={c.id}
                  value={c}
                  isComparable
                  onChange={(next) => updateComparable(c.id, next)}
                  onRemove={() => removeComparable(c.id)}
                />
              ))}
            </div>

            <button
              onClick={runValuation}
              className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink font-semibold hover:opacity-90 transition-opacity"
            >
              <Calculator size={16} /> Calculate Valuation
            </button>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24 self-start">
            {result ? (
              <>
                <ResultSummary result={result} />
                <div className="space-y-4">
                  <h2 className="font-display font-semibold">Comparable-by-comparable breakdown</h2>
                  {result.comparables.map((r, i) => (
                    <ComparableResultCard key={r.comparable.id} result={r} index={i} />
                  ))}
                </div>
              </>
            ) : (
              <div className="card-surface p-10 text-center text-navy-400 text-sm">
                Fill in the subject property and at least one comparable with a sale price, then run the
                calculation. Every adjustment will be shown here — nothing is hidden.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
