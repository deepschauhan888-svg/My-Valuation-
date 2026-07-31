"use client";

import { useMemo, useState } from "react";
import Nav from "@/components/Nav";
import { blankSubject } from "@/lib/blank-property";
import { calculateComparable } from "@/lib/valuation-engine";
import { getRuleSetForCity } from "@/lib/rules-data";
import { formatPercent, formatPSF } from "@/lib/format";
import { Facing } from "@/lib/types";
import { motion } from "framer-motion";

const FACINGS: Facing[] = ["south", "south-west", "west", "other", "north", "north-east", "east"];

export default function PlaygroundPage() {
  const subject = useMemo(() => {
    const s = blankSubject();
    s.society = "Subject Baseline";
    return s;
  }, []);

  const [parking, setParking] = useState(1);
  const [floor, setFloor] = useState(6);
  const [age, setAge] = useState(5);
  const [facingIndex, setFacingIndex] = useState(FACINGS.indexOf("east"));

  const comparable = useMemo(
    () => ({
      ...subject,
      id: "playground-comparable",
      label: "Playground Comparable",
      society: "Playground Comparable",
      coveredParkingCount: parking,
      floorNumber: floor,
      ageYears: age,
      facing: FACINGS[facingIndex],
      salePrice: subject.superBuiltUpAreaSqft * 10250,
    }),
    [subject, parking, floor, age, facingIndex]
  );

  const rules = getRuleSetForCity(subject.city);
  const result = calculateComparable(subject, comparable, rules);

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
            Subject property is held fixed at 2BHK, 1,000 sqft, floor 6/20, 1 covered parking slot, facing East.
            Adjust the comparable below and see the adjusted PSF respond in real time.
          </p>
        </div>

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
                <span className="font-medium">Floor number (of 20)</span>
                <span className="ledger-figure text-gold font-semibold">{floor}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
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

            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-medium">Facing</span>
                <span className="ledger-figure text-gold font-semibold capitalize">{FACINGS[facingIndex].replace("-", " ")}</span>
              </div>
              <input
                type="range"
                min={0}
                max={FACINGS.length - 1}
                value={facingIndex}
                onChange={(e) => setFacingIndex(Number(e.target.value))}
                className="w-full accent-gold"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-surface p-8 text-center">
              <div className="eyebrow mb-2">Adjusted PSF</div>
              <motion.div
                key={result.adjustedPsf}
                initial={{ opacity: 0.4, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display font-bold text-4xl text-gold ledger-figure"
              >
                {formatPSF(result.adjustedPsf)}
              </motion.div>
              <div className="text-sm text-navy-400 mt-2">
                Total adjustment {formatPercent(result.totalAdjustmentPercent)} from base {formatPSF(result.derived.psf)}
              </div>
            </div>

            <div className="card-surface p-6">
              <h2 className="font-display font-semibold mb-3 text-sm">Live breakdown</h2>
              {result.adjustments.length === 0 ? (
                <p className="text-sm text-navy-400">No difference from the subject on any factor.</p>
              ) : (
                <ul className="space-y-2">
                  {result.adjustments.map((a) => (
                    <li key={a.key} className="flex items-center justify-between text-sm">
                      <span>{a.label}</span>
                      <span className={`ledger-figure font-semibold ${a.percent >= 0 ? "text-premium" : "text-discount"}`}>
                        {formatPercent(a.percent)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
