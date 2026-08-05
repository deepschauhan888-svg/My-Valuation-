"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Nav from "@/components/Nav";
import { blankSubject } from "@/lib/blank-property";
import { calculateComparable } from "@/lib/valuation-engine";
import { formatPercent, formatPSF } from "@/lib/format";
import { LiveCategory } from "@/lib/types";
import AnimatedNumber from "@/components/AnimatedNumber";
import { Loader2 } from "lucide-react";

export default function PlaygroundPage() {
  const [citySlug, setCitySlug] = useState<string | null>(null);
  const [categories, setCategories] = useState<LiveCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [parking, setParking] = useState(1);
  const [floor, setFloor] = useState(6);
  const [age, setAge] = useState(5);
  const [facingIndex, setFacingIndex] = useState(0);

  // The published rule set is fetched once, then held in memory so slider
  // drags stay instant — this is still 100% database-sourced, just cached
  // client-side rather than re-fetched on every pixel of drag.
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        const firstCity = data.cities?.[0];
        if (!firstCity) throw new Error("No cities configured yet.");
        return fetch(`/api/categories?city=${firstCity.slug}`).then((r) => r.json());
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setCitySlug(data.ruleSet.city);
        setCategories(data.ruleSet.categories ?? []);
        const facingOptions = data.ruleSet.categories.find((c: LiveCategory) => c.key === "facing")?.options ?? [];
        const eastIndex = facingOptions.findIndex((o: any) => o.value === "east");
        setFacingIndex(eastIndex >= 0 ? eastIndex : 0);
      })
      .catch((err) => setError(err.message ?? "Could not load the rule engine."))
      .finally(() => setLoading(false));
  }, []);

  const facingCategory = categories.find((c) => c.key === "facing");
  const facingOptions = useMemo(() => facingCategory?.options ?? [], [facingCategory]);

  const subject = useMemo(() => {
    if (!citySlug) return null;
    const s = blankSubject(categories, citySlug);
    s.society = "Subject Baseline";
    return s;
  }, [categories, citySlug]);

  const comparable = useMemo(() => {
    if (!subject) return null;
    return {
      ...subject,
      id: "playground-comparable",
      label: "Playground Comparable",
      society: "Playground Comparable",
      floorNumber: floor,
      attributes: {
        ...subject.attributes,
        parking: String(parking),
        age: String(age),
        facing: facingOptions[facingIndex]?.value ?? subject.attributes.facing,
      },
      salePrice: subject.superBuiltUpAreaSqft * 10250,
    };
  }, [subject, parking, floor, age, facingIndex, facingOptions]);

  const resultCardRef = useRef<HTMLDivElement>(null);
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = resultCardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    resultCardRef.current?.style.setProperty("--spot-x", `${x}%`);
    resultCardRef.current?.style.setProperty("--spot-y", `${y}%`);
  }

  const result =
    subject && comparable
      ? calculateComparable(subject, comparable, { city: citySlug ?? "", cityName: citySlug ?? "", categories })
      : null;

  return (
    <main>
      <Nav />
      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="mb-10">
          <div className="eyebrow mb-3">Valuation Playground</div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-3">
            Move the sliders. Watch the value move.
          </h1>
          <p className="text-navy-400 max-w-xl">
            Subject property is held fixed at 1,000 sqft, floor 6/20, 1 covered parking slot, facing East.
            Adjust the comparable below and see the adjusted PSF respond in real time, against this city&apos;s
            live published rules.
          </p>
        </div>

        {error && <div className="card-surface p-6 mb-8 text-sm text-discount border-discount/30">{error}</div>}

        {loading ? (
          <div className="flex items-center gap-2 text-navy-400 text-sm py-20 justify-center">
            <Loader2 size={16} className="animate-spin" strokeWidth={1.5} /> Loading live rules…
          </div>
        ) : result && subject ? (
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
            <div className="card-surface p-8 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium">Parking slots</span>
                  <span className="ledger-figure text-gold font-semibold">{parking}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={4}
                  value={parking}
                  onChange={(e) => setParking(Number(e.target.value))}
                  className="w-full accent-gold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium">Floor number (of {subject.totalFloors})</span>
                  <span className="ledger-figure text-gold font-semibold">{floor}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={subject.totalFloors}
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full accent-gold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="font-medium">Age (years)</span>
                  <span className="ledger-figure text-gold font-semibold">{age}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full accent-gold"
                />
              </div>

              {facingOptions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="font-medium">Facing</span>
                    <span className="ledger-figure text-gold font-semibold capitalize">
                      {facingOptions[facingIndex]?.label ?? "—"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={facingOptions.length - 1}
                    value={facingIndex}
                    onChange={(e) => setFacingIndex(Number(e.target.value))}
                    className="w-full accent-gold"
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div ref={resultCardRef} onMouseMove={handleMouseMove} className="card-surface spotlight-card p-8 text-center">
                <div className="eyebrow mb-2">Adjusted PSF</div>
                <div className="font-display font-bold text-4xl text-gold ledger-figure">
                  <AnimatedNumber value={result.adjustedPsf} format={formatPSF} duration={450} />
                </div>
                <div className="text-sm text-navy-400 mt-2">
                  Total adjustment {formatPercent(result.totalAdjustmentPercent)} from base {formatPSF(result.derived.psf)}
                </div>
              </div>

              <div className="card-surface spotlight-card p-6">
                <h2 className="font-display font-semibold mb-3 text-sm">Live breakdown</h2>
                {result.adjustments.length === 0 ? (
                  <p className="text-sm text-navy-400">No difference from the subject on any factor.</p>
                ) : (
                  <ul className="space-y-2">
                    {result.adjustments.map((a) => (
                      <li key={a.key} className="flex items-center justify-between text-sm">
                        <span>{a.label}</span>
                        <span className={`ledger-figure font-semibold ${a.percent >= 0 ? "text-premium" : "text-discount"}`}>
                          <AnimatedNumber value={a.percent} format={formatPercent} duration={400} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
