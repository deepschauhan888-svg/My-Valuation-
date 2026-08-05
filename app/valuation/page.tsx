"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import PropertyForm from "@/components/PropertyForm";
import ComparableResultCard from "@/components/ComparableResultCard";
import ResultSummary from "@/components/ResultSummary";
import AskAiPanel from "@/components/AskAiPanel";
import ValuationReport from "@/components/ValuationReport";
import { blankSubject, blankComparable } from "@/lib/blank-property";
import { LiveCategory, PropertyInput, ValuationResult } from "@/lib/types";
import { Plus, Calculator, FileText, Loader2 } from "lucide-react";

interface CityOption {
  id: string;
  name: string;
  slug: string;
}

export default function ValuationPage() {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [citySlug, setCitySlug] = useState<string>("");
  const [categories, setCategories] = useState<LiveCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [subject, setSubject] = useState<PropertyInput | null>(null);
  const [comparables, setComparables] = useState<PropertyInput[]>([]);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Load the city list once.
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCities(data.cities ?? []);
        if (data.cities?.[0]) setCitySlug(data.cities[0].slug);
        else {
          setLoadingCategories(false);
          setLoadError("No cities are configured yet. An admin needs to add one from /admin/cities.");
        }
      })
      .catch((err) => {
        setLoadingCategories(false);
        setLoadError(err.message ?? "Could not reach the rule engine.");
      });
  }, []);

  // Load categories whenever the selected city changes, then reset the form.
  useEffect(() => {
    if (!citySlug) return;
    setLoadingCategories(true);
    setLoadError(null);
    fetch(`/api/categories?city=${citySlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const cats: LiveCategory[] = data.ruleSet?.categories ?? [];
        setCategories(cats);
        setSubject(blankSubject(cats, citySlug));
        setComparables([blankComparable(cats, citySlug, 1), blankComparable(cats, citySlug, 2)]);
        setResult(null);
        if (cats.length === 0) {
          setLoadError("This city has no published rules yet. An admin needs to publish at least one category.");
        }
      })
      .catch((err) => setLoadError(err.message ?? "Could not load rules for this city."))
      .finally(() => setLoadingCategories(false));
  }, [citySlug]);

  function addComparable() {
    setComparables((c) => [...c, blankComparable(categories, citySlug, c.length + 1)]);
  }
  function updateComparable(id: string, next: PropertyInput) {
    setComparables((c) => c.map((item) => (item.id === id ? next : item)));
  }
  function removeComparable(id: string) {
    setComparables((c) => c.filter((item) => item.id !== id));
  }

  async function runValuation() {
    if (!subject) return;
    setCalculating(true);
    setCalcError(null);
    try {
      const res = await fetch("/api/valuate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ citySlug, subject, comparables }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Valuation failed.");
      setResult(data.result);
    } catch (err: any) {
      setCalcError(err.message ?? "Valuation failed.");
    } finally {
      setCalculating(false);
    }
  }

  return (
    <main>
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="eyebrow mb-3">Start valuation</div>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
              Enter your property, then bring the comparables.
            </h1>
          </div>
          {cities.length > 0 && (
            <label className="block">
              <span className="text-xs font-medium text-navy-400 mb-1.5 block">City</span>
              <select
                value={citySlug}
                onChange={(e) => setCitySlug(e.target.value)}
                className="h-10 px-3 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm"
              >
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {loadError && (
          <div className="card-surface p-6 mb-8 text-sm text-discount border-discount/30">{loadError}</div>
        )}

        {loadingCategories ? (
          <div className="flex items-center gap-2 text-navy-400 text-sm py-20 justify-center">
            <Loader2 size={16} className="animate-spin" strokeWidth={1.5} /> Loading live rules…
          </div>
        ) : subject ? (
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
            <div className="space-y-6">
              <PropertyForm value={subject} onChange={setSubject} categories={categories} />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold">Comparable properties</h2>
                  <button
                    onClick={addComparable}
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-3 h-9 rounded-full border border-line dark:border-line-dark hover:bg-navy-50 dark:hover:bg-white/5 transition-colors tap-feedback"
                  >
                    <Plus size={14} strokeWidth={1.5} /> Add comparable
                  </button>
                </div>
                {comparables.map((c) => (
                  <PropertyForm
                    key={c.id}
                    value={c}
                    isComparable
                    categories={categories}
                    onChange={(next) => updateComparable(c.id, next)}
                    onRemove={() => removeComparable(c.id)}
                  />
                ))}
              </div>

              <button
                onClick={runValuation}
                disabled={calculating}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink font-semibold hover:opacity-90 transition-opacity tap-feedback disabled:opacity-60"
              >
                {calculating ? <Loader2 size={16} className="animate-spin" strokeWidth={1.5} /> : <Calculator size={16} strokeWidth={1.5} />}
                {calculating ? "Calculating…" : "Calculate Valuation"}
              </button>
              {calcError && <p className="text-sm text-discount">{calcError}</p>}
            </div>

            <div className="space-y-6 lg:sticky lg:top-24 self-start">
              {result ? (
                <>
                  <ResultSummary result={result} />
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full border border-line dark:border-line-dark font-semibold text-sm hover:border-gold hover:text-gold transition-colors tap-feedback"
                  >
                    <FileText size={15} strokeWidth={1.5} /> Download Full Report
                  </button>
                  <AskAiPanel results={result.comparables} />
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
        ) : null}
      </div>

      {result && showReport && <ValuationReport result={result} onClose={() => setShowReport(false)} />}
    </main>
  );
}
