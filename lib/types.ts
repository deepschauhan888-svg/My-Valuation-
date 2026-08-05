// Core domain types for the Transparent Valuation Engine.
//
// Everything that used to be a fixed TypeScript field for a "rule" — age,
// facing, condition, furnishing, unit type, construction status, parking,
// balcony, legal issues — now lives in `attributes`, keyed by the rule
// category's `key` column in Supabase. This is what makes it possible for
// an admin to add a brand new category from the Rule Engine and have it
// participate in valuations without a code change.
//
// Two things stay structural (not admin-editable categories), because
// they're derivations the product's methodology treats as fixed math, not
// configurable rules: Load Factor (derived from area/carpet area) and the
// Floor adjustment's ratio (derived from floor number/total floors). Area
// itself is still never adjusted directly — see lib/valuation-engine.ts.

export interface UniqueFeature {
  id: string;
  label: string; // e.g. "Private terrace", "Corner unit"
  /** signed percentage impact of THIS feature when present on one side only */
  impactPercent: number;
}

export interface PropertyInput {
  id: string;
  label: string; // "Subject Property" or "Comparable 1"
  society: string;
  city: string; // city slug
  superBuiltUpAreaSqft: number;
  carpetAreaSqft: number;
  floorNumber: number;
  totalFloors: number;
  uniqueFeatures: UniqueFeature[];
  /** every other rule category's raw value, keyed by RuleCategory.key */
  attributes: Record<string, string>;
  /** only present on comparables — the transacted / asking price */
  salePrice?: number;
}

/** Derived, never entered directly. */
export interface DerivedMetrics {
  loadFactorPercent: number; // (SBA - Carpet) / SBA * 100
  psf: number; // salePrice / SBA, comparables only
}

export interface AdjustmentLine {
  key: string;
  label: string;
  ruleName: string; // e.g. "Facing Preference — Mumbai"
  percent: number; // signed: + means comparable is superior, - means subject is superior
  reason: string;
  calculation: string; // e.g. "Comparable rank 5 − Subject rank 4 = +1 step × 1.0%/step"
  city: string;
  version: number;
  effectiveDate: string;
  configuredBy: string;
  ruleSource: string; // legacy display string: "<city> v<version>"
}

export interface ComparableQualityScore {
  percent: number; // 0-100
  stars: number; // 0-5
  label: string; // "Excellent Comparable" | "Good Comparable" | ...
  reasons: { label: string; met: boolean }[];
}

export interface ComparableResult {
  comparable: PropertyInput;
  derived: DerivedMetrics;
  adjustments: AdjustmentLine[];
  totalAdjustmentPercent: number;
  adjustedPsf: number;
  quality: ComparableQualityScore;
}

export interface ValuationResult {
  subject: PropertyInput;
  subjectDerived: Pick<DerivedMetrics, "loadFactorPercent">;
  comparables: ComparableResult[];
  averageAdjustedPsf: number;
  finalMarketValue: number;
  rangeLow: number;
  rangeHigh: number;
  confidenceScore: number; // 0-100
  reliabilityScore: number; // 0-100, based on spread across comparables
}

// ---- Live rule categories, assembled from Supabase (see lib/supabase/queries.ts) ----

export type RuleKind = "numeric" | "flat" | "matrix";

export interface CategoryOption {
  value: string;
  label: string;
  rank: number;
}

export interface NumericPayload {
  percentPerUnit: number;
  capPercent: number;
  enabled: boolean;
}

export interface FlatPayload {
  percent: number;
  enabled: boolean;
}

export interface MatrixPayload {
  percentPerRankStep: number;
  capPercent: number;
  enabled: boolean;
  /** Explicit per-pair overrides. When present for a (subject, comparable)
   *  pair, this value wins over the rank-derived calculation — this is
   *  what makes every matrix cell independently editable. */
  cells?: { subject: string; comparable: string; percent: number }[];
}

/** One row from rule_categories, joined with its live (draft or published) payload. */
export interface LiveCategory {
  id: string;
  cityId: string;
  cityName: string;
  kind: RuleKind;
  key: string;
  label: string;
  description: string | null;
  comparisonRule: string | null;
  example: string | null;
  higherIsBetter: boolean | null; // numeric only
  valueType: "count" | "boolean" | null; // flat only
  isActive: boolean;
  sortOrder: number;
  options: CategoryOption[]; // matrix only
  payload: NumericPayload | FlatPayload | MatrixPayload;
  version: number;
  effectiveDate: string;
  configuredBy: string;
}

export interface LiveCityRuleSet {
  city: string; // slug
  cityName: string;
  categories: LiveCategory[];
}
