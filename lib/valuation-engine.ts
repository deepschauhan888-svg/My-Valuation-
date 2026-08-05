import {
  AdjustmentLine,
  CategoryOption,
  ComparableResult,
  FlatPayload,
  LiveCategory,
  LiveCityRuleSet,
  MatrixPayload,
  NumericPayload,
  PropertyInput,
  ValuationResult,
} from "./types";
import { scoreComparable } from "./quality-score";

// ---------------------------------------------------------------------------
// Adjustment philosophy (do not change without updating the methodology copy
// on the marketing site — it is documented there verbatim):
//
//   If the SUBJECT is superior on a factor -> the comparable gets a NEGATIVE
//   adjustment (its price is marked down before we can compare it to subject).
//   If the COMPARABLE is superior on a factor -> it gets a POSITIVE adjustment.
//
//   Adjusted PSF = Comparable PSF - (Comparable PSF * Total Adjustment)
//
// Every category below is read live from Supabase (see lib/supabase/queries.ts)
// — nothing here is hardcoded to a specific factor. Two derivations are
// structural rather than admin-configurable, per the product's methodology:
// Load Factor (from area/carpet area) and the Floor ratio (from floor
// number/total floors). Area itself is never adjusted directly.
// ---------------------------------------------------------------------------

function clamp(value: number, cap: number): number {
  return Math.max(-cap, Math.min(cap, value));
}

function loadFactor(sbaSqft: number, carpetSqft: number): number {
  if (sbaSqft <= 0) return 0;
  return ((sbaSqft - carpetSqft) / sbaSqft) * 100;
}

function floorRatio(floorNumber: number, totalFloors: number): number {
  if (totalFloors <= 0) return 0;
  return (floorNumber / totalFloors) * 100;
}

/** Resolves a numeric category's raw value for a property — derived for the
 *  two structural cases, otherwise read straight from `attributes`. */
function numericValueFor(property: PropertyInput, categoryKey: string): number {
  if (categoryKey === "loadFactor") return loadFactor(property.superBuiltUpAreaSqft, property.carpetAreaSqft);
  if (categoryKey === "floor") return floorRatio(property.floorNumber, property.totalFloors);
  const raw = property.attributes[categoryKey];
  return raw !== undefined ? parseFloat(raw) || 0 : 0;
}

function numericAdjustment(subjectValue: number, comparableValue: number, payload: NumericPayload, higherIsBetter: boolean): number {
  if (!payload.enabled) return 0;
  const diff = comparableValue - subjectValue;
  const signedDiff = higherIsBetter ? diff : -diff;
  return clamp(signedDiff * payload.percentPerUnit, payload.capPercent);
}

function categoricalAdjustment(subjectValue: string, comparableValue: string, options: CategoryOption[], payload: MatrixPayload): number {
  if (!payload.enabled) return 0;
  const override = payload.cells?.find((c) => c.subject === subjectValue && c.comparable === comparableValue);
  if (override) return override.percent;
  const subjectRank = options.find((o) => o.value === subjectValue)?.rank ?? 0;
  const comparableRank = options.find((o) => o.value === comparableValue)?.rank ?? 0;
  return clamp((comparableRank - subjectRank) * payload.percentPerRankStep, payload.capPercent);
}

export function categoricalMatrix(options: CategoryOption[], payload: MatrixPayload): { subject: string; comparable: string; percent: number }[] {
  const cells: { subject: string; comparable: string; percent: number }[] = [];
  for (const s of options) {
    for (const c of options) {
      const override = payload.cells?.find((cell) => cell.subject === s.value && cell.comparable === c.value);
      const percent = !payload.enabled ? 0 : override ? override.percent : clamp((c.rank - s.rank) * payload.percentPerRankStep, payload.capPercent);
      cells.push({ subject: s.value, comparable: c.value, percent: Math.round(percent * 100) / 100 });
    }
  }
  return cells;
}

function buildLine(category: LiveCategory, percent: number, reason: string, calculation: string): AdjustmentLine | null {
  if (Math.abs(percent) < 0.001) return null;
  return {
    key: category.key,
    label: category.label,
    ruleName: `${category.label} — ${category.cityName ?? ""}`.trim(),
    percent: Math.round(percent * 100) / 100,
    reason,
    calculation,
    city: category.cityName,
    version: category.version,
    effectiveDate: category.effectiveDate,
    configuredBy: category.configuredBy,
    ruleSource: `${category.cityName} v${category.version}`,
  };
}

function describeDirection(percent: number, subjectPhrase: string, comparablePhrase: string): string {
  return percent < 0
    ? `Subject ${subjectPhrase} — comparable is marked down to match.`
    : `Comparable ${comparablePhrase} — it is marked up before comparison.`;
}

function computeCategoryLine(category: LiveCategory, subject: PropertyInput, comparable: PropertyInput): AdjustmentLine | null {
  if (!category.isActive) return null;

  if (category.kind === "numeric") {
    const payload = category.payload as NumericPayload;
    const higherIsBetter = category.higherIsBetter ?? true;
    const subjectVal = numericValueFor(subject, category.key);
    const comparableVal = numericValueFor(comparable, category.key);
    const percent = numericAdjustment(subjectVal, comparableVal, payload, higherIsBetter);
    if (percent === 0) return null;
    return buildLine(
      category,
      percent,
      `Subject ${category.label.toLowerCase()} ${subjectVal.toFixed(1)} vs comparable ${comparableVal.toFixed(1)}. ` +
        describeDirection(percent, `is more favorable on ${category.label.toLowerCase()}`, `is more favorable on ${category.label.toLowerCase()}`),
      `(${comparableVal.toFixed(1)} ${higherIsBetter ? "−" : "vs"} ${subjectVal.toFixed(1)}) × ${payload.percentPerUnit}%/unit${higherIsBetter ? "" : " × −1"} = ${percent.toFixed(2)}%`
    );
  }

  if (category.kind === "flat") {
    const payload = category.payload as FlatPayload;
    if (!payload.enabled) return null;

    if (category.valueType === "boolean") {
      const subjectFlag = subject.attributes[category.key] === "true";
      const comparableFlag = comparable.attributes[category.key] === "true";
      if (subjectFlag === comparableFlag) return null;
      const percent = comparableFlag ? -payload.percent : payload.percent;
      return buildLine(
        category,
        percent,
        comparableFlag
          ? `Comparable is flagged for ${category.label.toLowerCase()} — marked down.`
          : `Subject is flagged for ${category.label.toLowerCase()} — comparable marked down to match on a like-for-like basis.`,
        `Flat penalty of ${payload.percent}% applied to the side flagged for ${category.label.toLowerCase()}.`
      );
    }

    // count-based (parking, balcony, ...)
    const subjectCount = parseFloat(subject.attributes[category.key] ?? "0") || 0;
    const comparableCount = parseFloat(comparable.attributes[category.key] ?? "0") || 0;
    const diff = comparableCount - subjectCount;
    const percent = clamp(-diff * payload.percent, 100);
    if (percent === 0) return null;
    return buildLine(
      category,
      percent,
      `Subject has ${subjectCount} ${category.label.toLowerCase()}, comparable has ${comparableCount}. ` +
        describeDirection(percent, `has more ${category.label.toLowerCase()}`, `has more ${category.label.toLowerCase()}`),
      `−(${comparableCount} − ${subjectCount}) × ${payload.percent}%/unit = ${percent.toFixed(2)}%`
    );
  }

  // matrix
  const payload = category.payload as MatrixPayload;
  const subjectValue = subject.attributes[category.key] ?? "";
  const comparableValue = comparable.attributes[category.key] ?? "";
  const percent = categoricalAdjustment(subjectValue, comparableValue, category.options, payload);
  if (percent === 0) return null;
  const subjectLabel = category.options.find((o) => o.value === subjectValue)?.label ?? subjectValue;
  const comparableLabel = category.options.find((o) => o.value === comparableValue)?.label ?? comparableValue;
  return buildLine(
    category,
    percent,
    `Subject is "${subjectLabel}", comparable is "${comparableLabel}". ` +
      describeDirection(percent, `ranks higher on ${category.label.toLowerCase()}`, `ranks higher on ${category.label.toLowerCase()}`),
    `rank step difference × ${payload.percentPerRankStep}%/step = ${percent.toFixed(2)}%`
  );
}

export function calculateComparable(subject: PropertyInput, comparable: PropertyInput, ruleSet: LiveCityRuleSet): ComparableResult {
  const subjectLoadFactor = loadFactor(subject.superBuiltUpAreaSqft, subject.carpetAreaSqft);
  const comparableLoadFactor = loadFactor(comparable.superBuiltUpAreaSqft, comparable.carpetAreaSqft);
  const psf = comparable.salePrice ? comparable.salePrice / comparable.superBuiltUpAreaSqft : 0;

  const lines: AdjustmentLine[] = [];

  for (const category of ruleSet.categories) {
    const line = computeCategoryLine(category, subject, comparable);
    if (line) lines.push(line);
  }

  // Unique features — each feature present on only one side contributes its own signed impact.
  const subjectFeatureIds = new Set(subject.uniqueFeatures.map((f) => f.label.toLowerCase()));
  const comparableFeatureIds = new Set(comparable.uniqueFeatures.map((f) => f.label.toLowerCase()));

  comparable.uniqueFeatures.forEach((f) => {
    if (!subjectFeatureIds.has(f.label.toLowerCase()) && Math.abs(f.impactPercent) > 0.001) {
      lines.push({
        key: `feature-${f.id}`,
        label: `Unique Feature: ${f.label}`,
        ruleName: "Unique Feature Premium",
        percent: f.impactPercent,
        reason: `Comparable has "${f.label}" which subject does not — marked up to reflect it.`,
        calculation: `Configured feature impact: ${f.impactPercent > 0 ? "+" : ""}${f.impactPercent}%`,
        city: ruleSet.cityName,
        version: 1,
        effectiveDate: "",
        configuredBy: "Analyst (per-valuation)",
        ruleSource: "Per-valuation feature",
      });
    }
  });
  subject.uniqueFeatures.forEach((f) => {
    if (!comparableFeatureIds.has(f.label.toLowerCase()) && Math.abs(f.impactPercent) > 0.001) {
      lines.push({
        key: `feature-subj-${f.id}`,
        label: `Unique Feature: ${f.label} (subject only)`,
        ruleName: "Unique Feature Premium",
        percent: -f.impactPercent,
        reason: `Subject has "${f.label}" which comparable does not — comparable marked down to match.`,
        calculation: `Configured feature impact: −${f.impactPercent}%`,
        city: ruleSet.cityName,
        version: 1,
        effectiveDate: "",
        configuredBy: "Analyst (per-valuation)",
        ruleSource: "Per-valuation feature",
      });
    }
  });

  const totalAdjustmentPercent = lines.reduce((sum, l) => sum + l.percent, 0);
  const adjustedPsf = psf - psf * (totalAdjustmentPercent / 100);

  return {
    comparable,
    derived: { loadFactorPercent: comparableLoadFactor, psf },
    adjustments: lines,
    totalAdjustmentPercent: Math.round(totalAdjustmentPercent * 100) / 100,
    adjustedPsf: Math.round(adjustedPsf),
    quality: scoreComparable(subject, comparable),
  };
}

export function calculateValuation(subject: PropertyInput, comparables: PropertyInput[], ruleSet: LiveCityRuleSet): ValuationResult {
  const subjectLoadFactor = loadFactor(subject.superBuiltUpAreaSqft, subject.carpetAreaSqft);
  const results = comparables.map((c) => calculateComparable(subject, c, ruleSet));

  const validPsfs = results.map((r) => r.adjustedPsf).filter((v) => v > 0);
  const averageAdjustedPsf = validPsfs.length ? Math.round(validPsfs.reduce((a, b) => a + b, 0) / validPsfs.length) : 0;

  const finalMarketValue = Math.round(averageAdjustedPsf * subject.superBuiltUpAreaSqft);

  const mean = averageAdjustedPsf || 1;
  const variance = validPsfs.length ? validPsfs.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / validPsfs.length : 0;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean ? stdDev / mean : 1;

  const confidenceScore = Math.max(35, Math.min(98, Math.round(98 - coefficientOfVariation * 250)));
  const reliabilityScore = Math.max(30, Math.min(95, Math.round(60 + validPsfs.length * 6 - coefficientOfVariation * 200)));

  const spread = mean * (coefficientOfVariation + 0.03);
  const rangeLow = Math.round((averageAdjustedPsf - spread) * subject.superBuiltUpAreaSqft);
  const rangeHigh = Math.round((averageAdjustedPsf + spread) * subject.superBuiltUpAreaSqft);

  return {
    subject,
    subjectDerived: { loadFactorPercent: subjectLoadFactor },
    comparables: results,
    averageAdjustedPsf,
    finalMarketValue,
    rangeLow: Math.max(0, rangeLow),
    rangeHigh,
    confidenceScore,
    reliabilityScore,
  };
}
