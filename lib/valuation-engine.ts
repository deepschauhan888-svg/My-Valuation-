import {
  AdjustmentLine,
  CategoricalRule,
  CityRuleSet,
  ComparableResult,
  NumericRule,
  PropertyInput,
  ValuationResult,
} from "./types";

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
//   Total Adjustment is the sum of signed percentages below, expressed as a
//   decimal (e.g. -0.03 for -3%).
// ---------------------------------------------------------------------------

function clamp(value: number, cap: number): number {
  return Math.max(-cap, Math.min(cap, value));
}

function loadFactor(sbaSqft: number, carpetSqft: number): number {
  if (sbaSqft <= 0) return 0;
  return ((sbaSqft - carpetSqft) / sbaSqft) * 100;
}

function numericAdjustment(
  subjectValue: number,
  comparableValue: number,
  rule: NumericRule,
  higherIsBetter: boolean
): number {
  if (!rule.enabled) return 0;
  const diff = comparableValue - subjectValue; // positive if comparable's raw number is bigger
  const signedDiff = higherIsBetter ? diff : -diff;
  return clamp(signedDiff * rule.percentPerUnit, rule.capPercent);
}

function categoricalAdjustment(
  subjectValue: string,
  comparableValue: string,
  rule: CategoricalRule
): number {
  if (!rule.enabled) return 0;
  const subjectRank = rule.entries.find((e) => e.value === subjectValue)?.rank ?? 0;
  const comparableRank = rule.entries.find((e) => e.value === comparableValue)?.rank ?? 0;
  const rankDiff = comparableRank - subjectRank;
  return clamp(rankDiff * rule.percentPerRankStep, rule.capPercent);
}

function buildLine(
  key: string,
  label: string,
  percent: number,
  reason: string,
  ruleSource: string
): AdjustmentLine | null {
  if (Math.abs(percent) < 0.001) return null;
  return { key, label, percent: Math.round(percent * 100) / 100, reason, ruleSource };
}

function describeDirection(percent: number, subjectPhrase: string, comparablePhrase: string): string {
  return percent < 0
    ? `Subject ${subjectPhrase} — comparable is marked down to match.`
    : `Comparable ${comparablePhrase} — it is marked up before comparison.`;
}

export function calculateComparable(
  subject: PropertyInput,
  comparable: PropertyInput,
  rules: CityRuleSet
): ComparableResult {
  const subjectLoadFactor = loadFactor(subject.superBuiltUpAreaSqft, subject.carpetAreaSqft);
  const comparableLoadFactor = loadFactor(comparable.superBuiltUpAreaSqft, comparable.carpetAreaSqft);
  const psf = comparable.salePrice ? comparable.salePrice / comparable.superBuiltUpAreaSqft : 0;

  const lines: AdjustmentLine[] = [];

  // Load factor: LOWER load factor (less common-area loss) is better.
  const lfPercent = numericAdjustment(subjectLoadFactor, comparableLoadFactor, rules.loadFactor, false);
  const lfLine = buildLine(
    "loadFactor",
    "Load Factor",
    lfPercent,
    lfPercent !== 0
      ? `Subject load factor ${subjectLoadFactor.toFixed(1)}% vs comparable ${comparableLoadFactor.toFixed(1)}%. ` +
        describeDirection(lfPercent, "has a leaner load factor", "carries more efficient carpet area")
      : "",
    `${rules.city} v${rules.version}`
  );
  if (lfLine) lines.push(lfLine);

  // Age: NEWER is better (lower age).
  const agePercent = numericAdjustment(subject.ageYears, comparable.ageYears, rules.age, false);
  const ageLine = buildLine(
    "age",
    "Age of Property",
    agePercent,
    agePercent !== 0
      ? `Subject is ${subject.ageYears} yrs, comparable is ${comparable.ageYears} yrs. ` +
        describeDirection(agePercent, "is newer", "is newer")
      : "",
    `${rules.city} v${rules.version}`
  );
  if (ageLine) lines.push(ageLine);

  // Unit type
  const unitPercent = categoricalAdjustment(subject.unitType, comparable.unitType, rules.unitType);
  const unitLine = buildLine(
    "unitType",
    "Unit Type",
    unitPercent,
    unitPercent !== 0
      ? `Subject is ${subject.unitType.toUpperCase()}, comparable is ${comparable.unitType.toUpperCase()}. ` +
        describeDirection(unitPercent, "is the larger configuration", "is the larger configuration")
      : "",
    `${rules.city} v${rules.version}`
  );
  if (unitLine) lines.push(unitLine);

  // Construction status
  const csPercent = categoricalAdjustment(
    subject.constructionStatus,
    comparable.constructionStatus,
    rules.constructionStatus
  );
  const csLine = buildLine(
    "constructionStatus",
    "Construction Status",
    csPercent,
    csPercent !== 0
      ? `Subject is "${subject.constructionStatus}", comparable is "${comparable.constructionStatus}". ` +
        describeDirection(csPercent, "is further along / more ready", "is further along / more ready")
      : "",
    `${rules.city} v${rules.version}`
  );
  if (csLine) lines.push(csLine);

  // Condition
  const condPercent = categoricalAdjustment(subject.condition, comparable.condition, rules.condition);
  const condLine = buildLine(
    "condition",
    "Property Condition",
    condPercent,
    condPercent !== 0
      ? `Subject condition "${subject.condition}" vs comparable "${comparable.condition}". ` +
        describeDirection(condPercent, "is in better condition", "is in better condition")
      : "",
    `${rules.city} v${rules.version}`
  );
  if (condLine) lines.push(condLine);

  // Furnishing
  const furnPercent = categoricalAdjustment(subject.furnishing, comparable.furnishing, rules.furnishing);
  const furnLine = buildLine(
    "furnishing",
    "Furnishing",
    furnPercent,
    furnPercent !== 0
      ? `Subject is "${subject.furnishing}", comparable is "${comparable.furnishing}". ` +
        describeDirection(furnPercent, "is more furnished", "is more furnished")
      : "",
    `${rules.city} v${rules.version}`
  );
  if (furnLine) lines.push(furnLine);

  // Floor: higher floor generally preferred (as a fraction of total floors, so it's comparable across buildings)
  const subjectFloorRatio = subject.totalFloors > 0 ? subject.floorNumber / subject.totalFloors : 0;
  const comparableFloorRatio = comparable.totalFloors > 0 ? comparable.floorNumber / comparable.totalFloors : 0;
  const floorPercent = numericAdjustment(
    subjectFloorRatio * 100,
    comparableFloorRatio * 100,
    rules.floor,
    true
  );
  const floorLine = buildLine(
    "floor",
    "Floor Number",
    floorPercent,
    floorPercent !== 0
      ? `Subject: floor ${subject.floorNumber}/${subject.totalFloors}. Comparable: floor ${comparable.floorNumber}/${comparable.totalFloors}. ` +
        describeDirection(floorPercent, "sits on the higher relative floor", "sits on the higher relative floor")
      : "",
    `${rules.city} v${rules.version}`
  );
  if (floorLine) lines.push(floorLine);

  // Facing
  const facingPercent = categoricalAdjustment(subject.facing, comparable.facing, rules.facing);
  const facingLine = buildLine(
    "facing",
    "Facing",
    facingPercent,
    facingPercent !== 0
      ? `Subject faces ${subject.facing}, comparable faces ${comparable.facing}. ` +
        describeDirection(facingPercent, "has the more preferred orientation", "has the more preferred orientation")
      : "",
    `${rules.city} v${rules.version}`
  );
  if (facingLine) lines.push(facingLine);

  // Parking
  if (rules.parkingPerSlot.enabled) {
    const parkingDiff = comparable.coveredParkingCount - subject.coveredParkingCount;
    const parkingPercent = clamp(-parkingDiff * rules.parkingPerSlot.percent, 100);
    const parkingLine = buildLine(
      "parking",
      "Parking",
      parkingPercent,
      parkingPercent !== 0
        ? `Subject has ${subject.coveredParkingCount} covered slot(s), comparable has ${comparable.coveredParkingCount}. ` +
          describeDirection(parkingPercent, "has more covered parking", "has more covered parking")
        : "",
      `${rules.city} v${rules.version}`
    );
    if (parkingLine) lines.push(parkingLine);
  }

  // Balcony
  if (rules.balconyPerUnit.enabled) {
    const balconyDiff = comparable.balconyCount - subject.balconyCount;
    const balconyPercent = clamp(-balconyDiff * rules.balconyPerUnit.percent, 100);
    const balconyLine = buildLine(
      "balcony",
      "Balcony",
      balconyPercent,
      balconyPercent !== 0
        ? `Subject has ${subject.balconyCount} balcon(y/ies), comparable has ${comparable.balconyCount}. ` +
          describeDirection(balconyPercent, "has more balconies", "has more balconies")
        : "",
      `${rules.city} v${rules.version}`
    );
    if (balconyLine) lines.push(balconyLine);
  }

  // Legal issues — only the side that has issues is marked down.
  if (rules.legalIssuesPenalty.enabled && subject.hasLegalIssues !== comparable.hasLegalIssues) {
    const percent = comparable.hasLegalIssues
      ? -rules.legalIssuesPenalty.percent
      : rules.legalIssuesPenalty.percent;
    const legalLine = buildLine(
      "legalIssues",
      "Legal Issues",
      percent,
      comparable.hasLegalIssues
        ? "Comparable carries a flagged legal/title issue — marked down."
        : "Subject carries a flagged legal/title issue — comparable is marked down to match on a like-for-like basis.",
      `${rules.city} v${rules.version}`
    );
    if (legalLine) lines.push(legalLine);
  }

  // Unique features — each feature present on only one side contributes its own signed impact.
  const subjectFeatureIds = new Set(subject.uniqueFeatures.map((f) => f.label.toLowerCase()));
  const comparableFeatureIds = new Set(comparable.uniqueFeatures.map((f) => f.label.toLowerCase()));

  comparable.uniqueFeatures.forEach((f) => {
    if (!subjectFeatureIds.has(f.label.toLowerCase())) {
      const line = buildLine(
        `feature-${f.id}`,
        `Unique Feature: ${f.label}`,
        f.impactPercent,
        `Comparable has "${f.label}" which subject does not — marked up to reflect it.`,
        `${rules.city} v${rules.version}`
      );
      if (line) lines.push(line);
    }
  });
  subject.uniqueFeatures.forEach((f) => {
    if (!comparableFeatureIds.has(f.label.toLowerCase())) {
      const line = buildLine(
        `feature-subj-${f.id}`,
        `Unique Feature: ${f.label} (subject only)`,
        -f.impactPercent,
        `Subject has "${f.label}" which comparable does not — comparable marked down to match.`,
        `${rules.city} v${rules.version}`
      );
      if (line) lines.push(line);
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
  };
}

export function calculateValuation(
  subject: PropertyInput,
  comparables: PropertyInput[],
  rules: CityRuleSet
): ValuationResult {
  const subjectLoadFactor = loadFactor(subject.superBuiltUpAreaSqft, subject.carpetAreaSqft);
  const results = comparables.map((c) => calculateComparable(subject, c, rules));

  const validPsfs = results.map((r) => r.adjustedPsf).filter((v) => v > 0);
  const averageAdjustedPsf = validPsfs.length
    ? Math.round(validPsfs.reduce((a, b) => a + b, 0) / validPsfs.length)
    : 0;

  const finalMarketValue = Math.round(averageAdjustedPsf * subject.superBuiltUpAreaSqft);

  // Spread across comparables drives confidence: tight cluster of adjusted PSFs -> high confidence.
  const mean = averageAdjustedPsf || 1;
  const variance = validPsfs.length
    ? validPsfs.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / validPsfs.length
    : 0;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean ? stdDev / mean : 1;

  const confidenceScore = Math.max(35, Math.min(98, Math.round(98 - coefficientOfVariation * 250)));
  const reliabilityScore = Math.max(
    30,
    Math.min(95, Math.round(60 + validPsfs.length * 6 - coefficientOfVariation * 200))
  );

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
