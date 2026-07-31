// Core domain types for the Transparent Valuation Engine.
// Nothing in this file adjusts for size — size only feeds PSF and load factor math,
// per the product's explainability rules.

export type ConstructionStatus = "ready-to-move" | "under-construction" | "new-launch";
export type PropertyCondition = "excellent" | "good" | "average" | "needs-repair";
export type Furnishing = "unfurnished" | "semi-furnished" | "fully-furnished";
export type Facing = "north" | "east" | "north-east" | "west" | "south" | "south-west" | "other";
export type UnitType = "1bhk" | "2bhk" | "3bhk" | "4bhk" | "villa" | "studio";

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
  city: string;
  superBuiltUpAreaSqft: number;
  carpetAreaSqft: number;
  ageYears: number;
  unitType: UnitType;
  constructionStatus: ConstructionStatus;
  condition: PropertyCondition;
  furnishing: Furnishing;
  floorNumber: number;
  totalFloors: number;
  facing: Facing;
  coveredParkingCount: number;
  balconyCount: number;
  hasLegalIssues: boolean;
  uniqueFeatures: UniqueFeature[];
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

// ---- Admin-configurable rule set ----

export interface NumericRule {
  /** percentage adjustment applied per unit of difference (e.g. per year of age, per % load factor) */
  percentPerUnit: number;
  capPercent: number;
  enabled: boolean;
}

export interface CategoricalRuleEntry {
  value: string;
  rank: number; // higher rank = more desirable
}

export interface CategoricalRule {
  entries: CategoricalRuleEntry[];
  percentPerRankStep: number;
  capPercent: number;
  enabled: boolean;
}

export interface FlatRule {
  percent: number;
  enabled: boolean;
}

export interface CityRuleSet {
  city: string;
  effectiveDate: string;
  version: number;
  notes: string;
  configuredBy: string;
  loadFactor: NumericRule;
  age: NumericRule;
  unitType: CategoricalRule;
  constructionStatus: CategoricalRule;
  condition: CategoricalRule;
  furnishing: CategoricalRule;
  floor: NumericRule;
  facing: CategoricalRule;
  parkingPerSlot: FlatRule;
  balconyPerUnit: FlatRule;
  legalIssuesPenalty: FlatRule;
}
