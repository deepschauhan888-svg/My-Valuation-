"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/Nav";
import { CITY_RULE_SETS, RULE_VERSION_HISTORY, RuleVersionEntry } from "@/lib/rules-data";
import { CityRuleSet, NumericRule, CategoricalRule } from "@/lib/types";
import { categoricalMatrix } from "@/lib/valuation-engine";
import { formatPercent } from "@/lib/format";
import AnimatedNumber from "@/components/AnimatedNumber";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Plus } from "lucide-react";

const CITIES = Object.keys(CITY_RULE_SETS);

const SAMPLE_ANALYTICS = [
  { city: "Mumbai", valuations: 184 },
  { city: "Bengaluru", valuations: 152 },
  { city: "Pune", valuations: 96 },
  { city: "Delhi NCR", valuations: 121 },
  { city: "Hyderabad", valuations: 74 },
];

const MATRIX_CATEGORIES: { key: keyof CityRuleSet; label: string }[] = [
  { key: "facing", label: "Facing" },
  { key: "condition", label: "Condition" },
  { key: "furnishing", label: "Furnishing" },
  { key: "unitType", label: "Unit Type" },
  { key: "constructionStatus", label: "Construction Status" },
];

const TABS = ["Numeric Rules", "Comparison Matrix", "Flat Rules", "Version History", "Analytics"] as const;
type Tab = (typeof TABS)[number];

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
        <input type="checkbox" checked={rule.enabled} onChange={(e) => onChange({ ...rule, enabled: e.target.checked })} />
        On
      </label>
    </div>
  );
}

function TabPanel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current?.style.setProperty("--spot-x", `${x}%`);
    ref.current?.style.setProperty("--spot-y", `${y}%`);
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="card-surface spotlight-card p-6"
    >
      {children}
    </motion.div>
  );
}

function ComparisonMatrixTable({ rule }: { rule: CategoricalRule }) {
  const cells = categoricalMatrix(rule);
  const values = rule.entries.map((e) => e.value);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-navy-400 font-medium">Subject ↓ / Comparable →</th>
            {values.map((v) => (
              <th key={v} className="p-2 text-center text-navy-400 font-medium capitalize">
                {v.replace("-", " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {values.map((s) => (
            <tr key={s} className="border-t border-line dark:border-line-dark">
              <td className="p-2 font-medium capitalize">{s.replace("-", " ")}</td>
              {values.map((c) => {
                const cell = cells.find((x) => x.subject === s && x.comparable === c);
                const percent = cell?.percent ?? 0;
                return (
                  <td
                    key={c}
                    className={`p-2 text-center ledger-figure transition-colors duration-300 hover:bg-navy-50 dark:hover:bg-white/5 ${
                      percent > 0 ? "text-premium" : percent < 0 ? "text-discount" : "text-navy-400"
                    }`}
                  >
                    <AnimatedNumber value={percent} format={formatPercent} duration={350} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const [city, setCity] = useState(CITIES[0]);
  const [rules, setRules] = useState<Record<string, CityRuleSet>>(CITY_RULE_SETS);
  const [history, setHistory] = useState<Record<string, RuleVersionEntry[]>>(RULE_VERSION_HISTORY);
  const [tab, setTab] = useState<Tab>("Numeric Rules");
  const [matrixCategory, setMatrixCategory] = useState<keyof CityRuleSet>("facing");
  const [versionNote, setVersionNote] = useState("");

  const active = rules[city];

  function updateActive(patch: Partial<CityRuleSet>) {
    setRules((r) => ({ ...r, [city]: { ...r[city], ...patch } }));
  }

  function publishVersion() {
    const nextVersion = active.version + 1;
    const today = new Date().toISOString().slice(0, 10);
    updateActive({ version: nextVersion, effectiveDate: today, configuredBy: "Admin (this session)" });
    setHistory((h) => ({
      ...h,
      [city]: [
        ...(h[city] ?? []),
        { version: nextVersion, effectiveDate: today, note: versionNote || "Rule update", configuredBy: "Admin (this session)" },
      ],
    }));
    setVersionNote("");
  }

  return (
    <main>
      <Nav />
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="eyebrow mb-3">Admin · Rule Engine</div>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
              City → Adjustment Category → Comparison Matrix.
            </h1>
          </div>
          <div className="text-xs text-navy-400 max-w-xs card-surface p-4">
            This panel edits rules in local state for demo purposes. Wire it to Supabase (see README) to
            persist changes and gate access behind authenticated admin roles.
          </div>
        </div>

        <div className="grid lg:grid-cols-[200px_1fr] gap-8">
          <div className="space-y-1">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors tap-feedback ${
                  city === c ? "bg-ink text-paper dark:bg-paper dark:text-ink" : "hover:bg-navy-50 dark:hover:bg-white/5 text-navy-400"
                }`}
              >
                {c.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-1 flex-wrap">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors tap-feedback ${
                      tab === t
                        ? "bg-gold text-white"
                        : "border border-line dark:border-line-dark text-navy-400 hover:border-gold hover:text-gold"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <span className="text-xs text-navy-400 ledger-figure">
                {active.city.replace("_", " ")} · v{active.version} · {active.effectiveDate}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {tab === "Numeric Rules" && (
                <TabPanel key="Numeric Rules">
                  <NumericRuleEditor label="Load Factor" rule={active.loadFactor} onChange={(next) => updateActive({ loadFactor: next })} />
                  <NumericRuleEditor label="Age" rule={active.age} onChange={(next) => updateActive({ age: next })} />
                  <NumericRuleEditor label="Floor Number" rule={active.floor} onChange={(next) => updateActive({ floor: next })} />
                </TabPanel>
              )}

              {tab === "Comparison Matrix" && (
                <TabPanel key="Comparison Matrix">
                  <div className="flex gap-2 flex-wrap mb-5">
                    {MATRIX_CATEGORIES.map((m) => (
                      <button
                        key={String(m.key)}
                        onClick={() => setMatrixCategory(m.key)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors tap-feedback ${
                          matrixCategory === m.key
                            ? "border-gold text-gold"
                            : "border-line dark:border-line-dark text-navy-400 hover:border-gold hover:text-gold"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  <ComparisonMatrixTable rule={active[matrixCategory] as CategoricalRule} />
                  <p className="text-xs text-navy-400 mt-4">
                    Reading the grid: pick the subject&apos;s row and the comparable&apos;s column. The cell is the
                    signed adjustment applied to that comparable — negative when the subject is superior,
                    positive when the comparable is superior.
                  </p>
                </TabPanel>
              )}

              {tab === "Flat Rules" && (
                <TabPanel key="Flat Rules">
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
                </TabPanel>
              )}

              {tab === "Version History" && (
                <TabPanel key="Version History">
                  <div className="flex gap-2 mb-5">
                    <input
                      value={versionNote}
                      onChange={(e) => setVersionNote(e.target.value)}
                      placeholder="Note for this version (e.g. Tightened floor premium cap)"
                      className="flex-1 h-10 px-3 rounded-lg border border-line dark:border-line-dark bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
                    />
                    <button
                      onClick={publishVersion}
                      className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-ink text-paper dark:bg-paper dark:text-ink text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 tap-feedback"
                    >
                      <Plus size={14} strokeWidth={1.5} /> Publish new version
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {(history[city] ?? []).slice().reverse().map((v) => (
                      <li key={v.version} className="flex items-start justify-between border-b border-line dark:border-line-dark pb-3 last:border-0">
                        <div>
                          <div className="text-sm font-semibold">
                            {active.city.replace("_", " ")} v{v.version}.0
                          </div>
                          <div className="text-xs text-navy-400">{v.note}</div>
                        </div>
                        <div className="text-right text-xs text-navy-400">
                          <div>{v.effectiveDate}</div>
                          <div>{v.configuredBy}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabPanel>
              )}

              {tab === "Analytics" && (
                <TabPanel key="Analytics">
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
                </TabPanel>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
