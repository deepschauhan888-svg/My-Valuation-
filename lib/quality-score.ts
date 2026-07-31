import { ComparableQualityScore, PropertyInput } from "./types";

// Each check is worth a slice of the 100%. This is intentionally simple and
// transparent — a comparable's score is the sum of concrete, visible reasons,
// not a hidden model.
const CHECKS: {
  label: string;
  weight: number;
  test: (subject: PropertyInput, comparable: PropertyInput) => boolean;
}[] = [
  { label: "Same society", weight: 25, test: (s, c) => !!s.society && s.society.trim().toLowerCase() === c.society.trim().toLowerCase() },
  { label: "Same city", weight: 10, test: (s, c) => s.city === c.city },
  { label: "Similar configuration (unit type)", weight: 20, test: (s, c) => s.unitType === c.unitType },
  { label: "Construction age within 5 years", weight: 15, test: (s, c) => Math.abs(s.ageYears - c.ageYears) <= 5 },
  { label: "Comparable area within 15%", weight: 15, test: (s, c) => {
    const diff = Math.abs(s.superBuiltUpAreaSqft - c.superBuiltUpAreaSqft) / (s.superBuiltUpAreaSqft || 1);
    return diff <= 0.15;
  } },
  { label: "No flagged legal issues", weight: 10, test: (_s, c) => !c.hasLegalIssues },
  { label: "Similar furnishing level", weight: 5, test: (s, c) => s.furnishing === c.furnishing },
];

export function scoreComparable(subject: PropertyInput, comparable: PropertyInput): ComparableQualityScore {
  const reasons = CHECKS.map((check) => ({ label: check.label, met: check.test(subject, comparable) }));
  const percent = Math.round(
    reasons.reduce((sum, r, i) => sum + (r.met ? CHECKS[i].weight : 0), 0)
  );
  const stars = Math.max(1, Math.round((percent / 100) * 5));
  const label =
    percent >= 85 ? "Excellent Comparable" : percent >= 65 ? "Good Comparable" : percent >= 45 ? "Fair Comparable" : "Weak Comparable";

  return { percent, stars, label, reasons };
}
