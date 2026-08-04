"use client";

import { ValuationResult } from "@/lib/types";
import { formatINR, formatPSF, formatPercent } from "@/lib/format";
import { X, Printer } from "lucide-react";

export default function ValuationReport({ result, onClose }: { result: ValuationResult; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] bg-ink/50 backdrop-blur-sm overflow-y-auto py-10 px-4 print:bg-white print:p-0 print:static">
      <div className="max-w-3xl mx-auto flex justify-end gap-2 mb-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-gold text-white text-sm font-semibold hover:opacity-90 transition-opacity tap-feedback"
        >
          <Printer size={15}  strokeWidth={1.5}/> Print / Save as PDF
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors tap-feedback"
        >
          <X size={15}  strokeWidth={1.5}/> Close
        </button>
      </div>

      <div id="valuation-report" className="report max-w-3xl mx-auto bg-white text-ink rounded-2xl print:rounded-none shadow-2xl print:shadow-none overflow-hidden">
        {/* Cover */}
        <div className="p-12 border-b-4 border-gold">
          <div className="eyebrow mb-6 !text-navy-400">ValueTrace · Valuation Report</div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-3">
            {result.subject.society || "Subject Property"}
          </h1>
          <p className="text-navy-400">{result.subject.city.replace("_", " ")} · Prepared {new Date().toLocaleDateString("en-IN")}</p>
        </div>

        {/* Executive summary */}
        <div className="p-12 border-b border-line">
          <h2 className="font-display font-semibold text-xl mb-4">Executive Summary</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-navy-400 mb-1">Final Market Value</div>
              <div className="font-display font-bold text-2xl">{formatINR(result.finalMarketValue)}</div>
            </div>
            <div>
              <div className="text-xs text-navy-400 mb-1">Value Range</div>
              <div className="font-semibold">{formatINR(result.rangeLow)} – {formatINR(result.rangeHigh)}</div>
            </div>
            <div>
              <div className="text-xs text-navy-400 mb-1">Confidence Score</div>
              <div className="font-semibold">{result.confidenceScore}/100</div>
            </div>
          </div>
        </div>

        {/* Subject property */}
        <div className="p-12 border-b border-line">
          <h2 className="font-display font-semibold text-xl mb-4">Subject Property</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <Row label="Super Built-up Area" value={`${result.subject.superBuiltUpAreaSqft.toLocaleString("en-IN")} sqft`} />
            <Row label="Carpet Area" value={`${result.subject.carpetAreaSqft.toLocaleString("en-IN")} sqft`} />
            <Row label="Load Factor" value={`${result.subjectDerived.loadFactorPercent.toFixed(1)}%`} />
            <Row label="Unit Type" value={result.subject.unitType.toUpperCase()} />
            <Row label="Age" value={`${result.subject.ageYears} yrs`} />
            <Row label="Condition" value={result.subject.condition.replace("-", " ")} />
            <Row label="Floor" value={`${result.subject.floorNumber} / ${result.subject.totalFloors}`} />
            <Row label="Facing" value={result.subject.facing.replace("-", " ")} />
          </dl>
        </div>

        {/* Comparables + adjustment sheet */}
        <div className="p-12 border-b border-line">
          <h2 className="font-display font-semibold text-xl mb-4">Comparable Properties &amp; Adjustment Sheet</h2>
          <div className="space-y-8">
            {result.comparables.map((c, i) => (
              <div key={c.comparable.id} className="break-inside-avoid">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">
                    Comparable {i + 1} — {c.comparable.society || c.comparable.label}
                  </h3>
                  <span className="text-xs text-navy-400">{c.quality.label} ({c.quality.percent}%)</span>
                </div>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-left text-navy-400 border-b border-line">
                      <th className="py-1.5 font-medium">Factor</th>
                      <th className="py-1.5 font-medium">Adjustment</th>
                      <th className="py-1.5 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.adjustments.map((a) => (
                      <tr key={a.key} className="border-b border-line/60">
                        <td className="py-1.5 pr-3">{a.label}</td>
                        <td className={`py-1.5 pr-3 font-mono ${a.percent >= 0 ? "text-premium" : "text-discount"}`}>
                          {formatPercent(a.percent)}
                        </td>
                        <td className="py-1.5 text-navy-400">{a.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end gap-8 mt-2 text-xs">
                  <span>Base PSF: <strong className="font-mono">{formatPSF(c.derived.psf)}</strong></span>
                  <span>Total Adjustment: <strong className="font-mono">{formatPercent(c.totalAdjustmentPercent)}</strong></span>
                  <span>Adjusted PSF: <strong className="font-mono text-gold">{formatPSF(c.adjustedPsf)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final valuation */}
        <div className="p-12 border-b border-line">
          <h2 className="font-display font-semibold text-xl mb-4">Final Valuation</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <Row label="Average Adjusted PSF" value={formatPSF(result.averageAdjustedPsf)} />
            <Row label="Subject Area" value={`${result.subject.superBuiltUpAreaSqft.toLocaleString("en-IN")} sqft`} />
            <Row label="Final Market Value" value={formatINR(result.finalMarketValue)} />
            <Row label="Value Range" value={`${formatINR(result.rangeLow)} – ${formatINR(result.rangeHigh)}`} />
            <Row label="Confidence Score" value={`${result.confidenceScore}/100`} />
            <Row label="Comparable Reliability Score" value={`${result.reliabilityScore}/100`} />
          </dl>
        </div>

        {/* Methodology, assumptions, limitations */}
        <div className="p-12 space-y-6 text-sm text-navy-400 leading-relaxed">
          <div>
            <h2 className="font-display font-semibold text-xl mb-2 text-ink">Methodology</h2>
            <p>
              This valuation uses the Comparable Sales Method. Each comparable&apos;s price-per-square-foot is
              adjusted, factor by factor, against the subject property. Area and carpet area are never
              adjusted directly — they only inform PSF and Load Factor. All other factors produce a signed
              percentage adjustment governed by the city&apos;s configured rule set, shown in full above.
            </p>
          </div>
          <div>
            <h2 className="font-display font-semibold text-xl mb-2 text-ink">Assumptions</h2>
            <p>
              Comparable sale/asking prices are taken as provided. Rule sets reflect the city&apos;s adjustment
              engine configuration effective at the time of calculation.
            </p>
          </div>
          <div>
            <h2 className="font-display font-semibold text-xl mb-2 text-ink">Limitations</h2>
            <p>
              This report is a data-driven estimate based on the comparables supplied and is not a
              substitute for a certified valuation or legal title verification.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #valuation-report,
          #valuation-report * {
            visibility: visible;
          }
          #valuation-report {
            position: absolute;
            inset: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line/60 py-1.5">
      <dt className="text-navy-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
