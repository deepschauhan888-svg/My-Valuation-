"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import { CITY_RULE_SETS } from "@/lib/rules-data";
import { CityRuleSet, NumericRule } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const CITIES = Object.keys(CITY_RULE_SETS);

const SAMPLE_ANALYTICS = [
  { city: "Mumbai", valuations: 184 },
  { city: "Bengaluru", valuations: 152 },
  { city: "Pune", valuations: 96 },
  { city: "Delhi NCR", valuations: 121 },
  { city: "Hyderabad", valuations: 74 },
];

function NumericRuleEditor({
  label,
  rule,
  onChange,
}: {
  label: string;
  rule: NumericRule;
  onChange: (next: NumericRule) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-line dark:border-line-dark last:border-0">
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-navy-400">% adjustment per unit of difference</div>
      </div>
      <input
        type="number"
        step="0.1"
        value={rule.percentPerUnit}
        onChange={(e) => onChange({ ...rule, percentPerUnit: Number(e.target.value) })}
        className="w-20 h-9 px-2 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm text-right ledger-figure"
      />
      <input
        type="number"
        step="0.5"
        value={rule.capPercent}
        onChange={(e) => onChange({ ...rule, capPercent: Number(e.target.value) })}
        className="w-20 h-9 px-2 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm text-right ledger-figure"
        title="Cap %"
      />
      <label className="flex items-center gap-1.5 text-xs text-navy-400">
        <input
          type="checkbox"
          checked={rule.enabled}
          onChange={(e) => onChange({ ...rule, enabled: e.target.checked })}
        />
        On
      </label>
    </div>
  );
}

export default function AdminPage() {
  const [city, setCity] = useState(CITIES[0]);
  const [rules, setRules] = useState<Record<string, CityRuleSet>>(CITY_RULE_SETS);
  const active = rules[city];

  function updateActive(patch: Partial<CityRuleSet>) {
    setRules((r) => ({ ...r, [city]: { ...r[city], ...patch, version: r[city].version + 1 } }));
  }

  return (
    <main>
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="mb-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="eyebrow mb-3">Admin · Adjustment Engine</div>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
              Tune every premium and discount — no code changes.
            </h1>
          </div>
          <div className="text-xs text-navy-400 max-w-xs card-surface p-4">
            This panel edits rules in local state for demo purposes. Wire it to Supabase (see README) to
            persist changes and gate access behind authenticated admin roles.
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <div className="space-y-1">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  city === c
                    ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                    : "hover:bg-navy-50 dark:hover:bg-white/5 text-navy-400"
                }`}
              >
                {c.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            <div className="card-surface p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold">{active.city.replace("_", " ")} rule set</h2>
                <span className="text-xs text-navy-400 ledger-figure">v{active.version} · {active.effectiveDate}</span>
              </div>
              <NumericRuleEditor
                label="Load Factor"
                rule={active.loadFactor}
                onChange={(next) => updateActive({ loadFactor: next })}
              />
              <NumericRuleEditor label="Age" rule={active.age} onChange={(next) => updateActive({ age: next })} />
              <NumericRuleEditor label="Floor Number" rule={active.floor} onChange={(next) => updateActive({ floor: next })} />
            </div>

            <div className="card-surface p-6">
              <h2 className="font-display font-semibold mb-4">Flat rules</h2>
              <div className="flex items-center justify-between py-3 border-b border-line dark:border-line-dark text-sm">
                <span>Parking — % per covered slot</span>
                <span className="ledger-figure font-semibold">{active.parkingPerSlot.percent}%</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-line dark:border-line-dark text-sm">
                <span>Balcony — % per balcony</span>
                <span className="ledger-figure font-semibold">{active.balconyPerUnit.percent}%</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span>Legal Issues — flat penalty</span>
                <span className="ledger-figure font-semibold text-discount">−{active.legalIssuesPenalty.percent}%</span>
              </div>
            </div>

            <div className="card-surface p-6">
              <h2 className="font-display font-semibold mb-1">Analytics preview</h2>
              <p className="text-xs text-navy-400 mb-4">Sample data — replace with a Supabase query over the valuations table.</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SAMPLE_ANALYTICS}>
                    <XAxis dataKey="city" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="valuations" fill="#B8862E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
