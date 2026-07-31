import { CityRuleSet } from "./types";

// These are seed defaults only. In production these rows live in Supabase
// and are edited from /admin — nothing here should require a code change
// to retune for a new city or a new set of premiums/discounts.

const defaultUnitTypeRank: CityRuleSet["unitType"] = {
  entries: [
    { value: "studio", rank: 1 },
    { value: "1bhk", rank: 2 },
    { value: "2bhk", rank: 3 },
    { value: "3bhk", rank: 4 },
    { value: "4bhk", rank: 5 },
    { value: "villa", rank: 6 },
  ],
  percentPerRankStep: 1.2,
  capPercent: 6,
  enabled: true,
};

const defaultConstructionStatusRank: CityRuleSet["constructionStatus"] = {
  entries: [
    { value: "under-construction", rank: 1 },
    { value: "new-launch", rank: 2 },
    { value: "ready-to-move", rank: 3 },
  ],
  percentPerRankStep: 2.5,
  capPercent: 5,
  enabled: true,
};

const defaultConditionRank: CityRuleSet["condition"] = {
  entries: [
    { value: "needs-repair", rank: 1 },
    { value: "average", rank: 2 },
    { value: "good", rank: 3 },
    { value: "excellent", rank: 4 },
  ],
  percentPerRankStep: 2,
  capPercent: 6,
  enabled: true,
};

const defaultFurnishingRank: CityRuleSet["furnishing"] = {
  entries: [
    { value: "unfurnished", rank: 1 },
    { value: "semi-furnished", rank: 2 },
    { value: "fully-furnished", rank: 3 },
  ],
  percentPerRankStep: 1.5,
  capPercent: 4,
  enabled: true,
};

const defaultFacingRank: CityRuleSet["facing"] = {
  entries: [
    { value: "south", rank: 1 },
    { value: "south-west", rank: 2 },
    { value: "west", rank: 3 },
    { value: "other", rank: 3 },
    { value: "north", rank: 4 },
    { value: "north-east", rank: 5 },
    { value: "east", rank: 5 },
  ],
  percentPerRankStep: 1,
  capPercent: 3,
  enabled: true,
};

function baseRuleSet(city: string): CityRuleSet {
  return {
    city,
    effectiveDate: "2026-04-01",
    version: 1,
    notes: "Seed defaults — tune from Admin > Adjustment Engine.",
    loadFactor: { percentPerUnit: 0.4, capPercent: 5, enabled: true },
    age: { percentPerUnit: 0.6, capPercent: 8, enabled: true },
    unitType: defaultUnitTypeRank,
    constructionStatus: defaultConstructionStatusRank,
    condition: defaultConditionRank,
    furnishing: defaultFurnishingRank,
    floor: { percentPerUnit: 0.25, capPercent: 4, enabled: true },
    facing: defaultFacingRank,
    parkingPerSlot: { percent: 1, enabled: true },
    balconyPerUnit: { percent: 0.5, enabled: true },
    legalIssuesPenalty: { percent: 4, enabled: true },
  };
}

export const CITY_RULE_SETS: Record<string, CityRuleSet> = {
  Mumbai: baseRuleSet("Mumbai"),
  Bengaluru: baseRuleSet("Bengaluru"),
  Delhi_NCR: baseRuleSet("Delhi NCR"),
  Pune: baseRuleSet("Pune"),
  Hyderabad: baseRuleSet("Hyderabad"),
};

export function getRuleSetForCity(city: string): CityRuleSet {
  return CITY_RULE_SETS[city] ?? baseRuleSet(city);
}
