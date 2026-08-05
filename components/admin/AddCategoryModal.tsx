"use client";

import { useState, useTransition } from "react";
import { createCategoryAction } from "@/lib/supabase/actions";
import { RuleKind } from "@/lib/types";
import { Plus, X, Loader2, Trash2 } from "lucide-react";

export default function AddCategoryModal({ cityId, kind, label }: { cityId: string; kind: RuleKind; label: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [key, setKey] = useState("");
  const [displayLabel, setDisplayLabel] = useState("");
  const [description, setDescription] = useState("");
  const [comparisonRule, setComparisonRule] = useState("");
  const [example, setExample] = useState("");
  const [higherIsBetter, setHigherIsBetter] = useState(true);
  const [valueType, setValueType] = useState<"count" | "boolean">("count");
  const [options, setOptions] = useState([{ value: "", label: "", rank: 1 }]);

  function reset() {
    setKey("");
    setDisplayLabel("");
    setDescription("");
    setComparisonRule("");
    setExample("");
    setOptions([{ value: "", label: "", rank: 1 }]);
  }

  function submit() {
    startTransition(async () => {
      await createCategoryAction({
        cityId,
        kind,
        key: key.trim(),
        label: displayLabel.trim(),
        description,
        comparisonRule,
        example,
        higherIsBetter: kind === "numeric" ? higherIsBetter : undefined,
        valueType: kind === "flat" ? valueType : undefined,
        options: kind === "matrix" ? options.filter((o) => o.value && o.label) : undefined,
      });
      reset();
      setOpen(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 h-8 rounded-full border border-line dark:border-line-dark hover:border-gold hover:text-gold transition-colors tap-feedback"
      >
        <Plus size={13} strokeWidth={1.5} /> Add {label} Category
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="card-surface w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold">New {label} Category</h3>
              <button onClick={() => setOpen(false)} className="tap-feedback" aria-label="Close">
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Machine key (e.g. metroDistance)">
                <input value={key} onChange={(e) => setKey(e.target.value)} className={inputClass} placeholder="camelCaseKey" />
              </Field>
              <Field label="Display label">
                <input value={displayLabel} onChange={(e) => setDisplayLabel(e.target.value)} className={inputClass} placeholder="e.g. Distance to Metro" />
              </Field>
              <Field label="Definition (shown in methodology)">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " h-16 py-2"} />
              </Field>
              <Field label="Comparison rule">
                <textarea value={comparisonRule} onChange={(e) => setComparisonRule(e.target.value)} className={inputClass + " h-16 py-2"} />
              </Field>
              <Field label="Example">
                <textarea value={example} onChange={(e) => setExample(e.target.value)} className={inputClass + " h-16 py-2"} />
              </Field>

              {kind === "numeric" && (
                <Field label="Direction">
                  <select value={higherIsBetter ? "higher" : "lower"} onChange={(e) => setHigherIsBetter(e.target.value === "higher")} className={inputClass}>
                    <option value="higher">Higher raw value favors the comparable</option>
                    <option value="lower">Lower raw value favors the comparable</option>
                  </select>
                </Field>
              )}

              {kind === "flat" && (
                <Field label="Value type">
                  <select value={valueType} onChange={(e) => setValueType(e.target.value as "count" | "boolean")} className={inputClass}>
                    <option value="count">Count (e.g. number of slots)</option>
                    <option value="boolean">Flag (present or not)</option>
                  </select>
                </Field>
              )}

              {kind === "matrix" && (
                <div>
                  <span className="text-xs font-medium text-navy-400 mb-1.5 block">Options (rank = desirability, higher is better)</span>
                  <div className="space-y-2">
                    {options.map((o, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          placeholder="value"
                          value={o.value}
                          onChange={(e) => setOptions((opts) => opts.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))}
                          className={inputClass}
                        />
                        <input
                          placeholder="Label"
                          value={o.label}
                          onChange={(e) => setOptions((opts) => opts.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))}
                          className={inputClass}
                        />
                        <input
                          type="number"
                          placeholder="rank"
                          value={o.rank}
                          onChange={(e) => setOptions((opts) => opts.map((x, idx) => (idx === i ? { ...x, rank: Number(e.target.value) } : x)))}
                          className={inputClass + " w-20"}
                        />
                        <button onClick={() => setOptions((opts) => opts.filter((_, idx) => idx !== i))} className="text-navy-400 hover:text-discount tap-feedback shrink-0">
                          <Trash2 size={15} strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setOptions((opts) => [...opts, { value: "", label: "", rank: opts.length + 1 }])}
                    className="mt-2 text-xs font-medium text-gold tap-feedback"
                  >
                    + Add option
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={submit}
              disabled={isPending || !key || !displayLabel}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 h-10 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink text-sm font-semibold hover:opacity-90 transition-opacity tap-feedback disabled:opacity-60"
            >
              {isPending && <Loader2 size={14} className="animate-spin" strokeWidth={1.5} />}
              Create Category
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-navy-400 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full h-10 px-3 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gold/40";
