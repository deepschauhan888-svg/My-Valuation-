export interface FactorDetail {
  key: string;
  definition: string;
  comparisonRule: string;
  adjustmentLogic: string;
  example: string;
  adjustable: boolean;
}

export const FACTOR_DETAILS: Record<string, FactorDetail> = {
  "Super Built-up Area": {
    key: "Super Built-up Area",
    definition: "The total area of the unit including its share of common areas — lobbies, stairwells, lift shafts.",
    comparisonRule: "Never compared as an adjustment. Used only to calculate PSF (price ÷ SBA) and Load Factor.",
    adjustmentLogic: "No premium or discount is ever applied for area directly — this is a deliberate rule, not an oversight.",
    example: "A 1,000 sqft and a 1,400 sqft unit are compared on their PSF, not marked up or down for being bigger or smaller.",
    adjustable: false,
  },
  "Carpet Area": {
    key: "Carpet Area",
    definition: "The actual usable floor area inside the walls of the unit.",
    comparisonRule: "Never compared as an adjustment. Used with SBA to calculate Load Factor.",
    adjustmentLogic: "Feeds Load Factor Efficiency, which is the adjustable factor — carpet area itself is not.",
    example: "SBA 1,000 sqft with 750 sqft carpet → Load Factor 25%, which then feeds the Load Factor rule below.",
    adjustable: false,
  },
  "Load Factor": {
    key: "Load Factor",
    definition: "The share of Super Built-up Area that isn't usable carpet area — (SBA − Carpet) ÷ SBA.",
    comparisonRule: "Lower load factor (less area lost to common space) is preferred.",
    adjustmentLogic: "If the comparable has a leaner load factor than the subject, it's marked up; if the subject is leaner, the comparable is marked down.",
    example: "Subject load factor 28%, comparable 24% → comparable is more efficient → comparable gets a positive adjustment.",
    adjustable: true,
  },
  "Age of Property": {
    key: "Age of Property",
    definition: "Years since the property was constructed or handed over.",
    comparisonRule: "Newer is preferred.",
    adjustmentLogic: "If the comparable is newer than the subject, it's marked up; if the subject is newer, the comparable is marked down.",
    example: "Subject is 8 years old, comparable is 3 years old → comparable is newer → comparable gets a positive adjustment.",
    adjustable: true,
  },
  "Unit Type": {
    key: "Unit Type",
    definition: "The configuration of the unit — Studio, 1BHK, 2BHK, 3BHK, 4BHK, or Villa.",
    comparisonRule: "Larger configurations rank higher on a fixed scale.",
    adjustmentLogic: "The rank difference between subject and comparable, multiplied by the configured percent-per-step, sets the direction and size.",
    example: "Subject is 2BHK, comparable is 3BHK → comparable ranks higher → comparable gets a positive adjustment.",
    adjustable: true,
  },
  "Construction Status": {
    key: "Construction Status",
    definition: "Under-construction, new-launch, or ready-to-move.",
    comparisonRule: "Ready-to-move ranks highest, followed by new-launch, then under-construction.",
    adjustmentLogic: "The comparable is marked up or down based on how its readiness ranks against the subject's.",
    example: "Subject is under-construction, comparable is ready-to-move → comparable ranks higher → positive adjustment.",
    adjustable: true,
  },
  "Property Condition": {
    key: "Property Condition",
    definition: "The physical state of the unit — needs-repair, average, good, or excellent.",
    comparisonRule: "Better condition ranks higher on a fixed scale.",
    adjustmentLogic: "Rank difference between subject and comparable, multiplied by the configured percent-per-step.",
    example: "Subject is in average condition, comparable is excellent → comparable ranks higher → positive adjustment.",
    adjustable: true,
  },
  Furnishing: {
    key: "Furnishing",
    definition: "Unfurnished, semi-furnished, or fully-furnished.",
    comparisonRule: "More furnished ranks higher.",
    adjustmentLogic: "Rank difference between subject and comparable, multiplied by the configured percent-per-step.",
    example: "Subject is unfurnished, comparable is fully-furnished → comparable ranks higher → positive adjustment.",
    adjustable: true,
  },
  "Floor Number": {
    key: "Floor Number",
    definition: "The unit's floor, expressed as a fraction of the building's total floors so it's comparable across buildings of different heights.",
    comparisonRule: "A higher relative floor is generally preferred.",
    adjustmentLogic: "The comparable's floor ratio minus the subject's, multiplied by the configured percent-per-point.",
    example: "Subject on floor 6 of 20 (30%), comparable on floor 16 of 20 (80%) → comparable is higher → positive adjustment.",
    adjustable: true,
  },
  Facing: {
    key: "Facing",
    definition: "The direction the unit's main frontage opens to.",
    comparisonRule: "Certain directions are ranked higher per city — for example East and North-East are commonly preferred.",
    adjustmentLogic: "Rank difference between subject and comparable, multiplied by the configured percent-per-step.",
    example: "Subject faces South, comparable faces East → comparable ranks higher → positive adjustment.",
    adjustable: true,
  },
  Parking: {
    key: "Parking",
    definition: "Number of covered parking slots included with the unit.",
    comparisonRule: "More covered slots is preferred.",
    adjustmentLogic: "A flat percent is applied per additional slot on the side that has more, in its favour.",
    example: "Subject has 1 slot, comparable has 2 → comparable has more → comparable gets a positive adjustment.",
    adjustable: true,
  },
  Balcony: {
    key: "Balcony",
    definition: "Number of balconies attached to the unit.",
    comparisonRule: "More balconies is preferred.",
    adjustmentLogic: "A flat percent is applied per additional balcony on the side that has more, in its favour.",
    example: "Subject has 1 balcony, comparable has 2 → comparable has more → comparable gets a positive adjustment.",
    adjustable: true,
  },
  "Legal Issues": {
    key: "Legal Issues",
    definition: "Whether the property carries a flagged legal or title issue.",
    comparisonRule: "A clean title is always preferred over a flagged one.",
    adjustmentLogic: "A flat penalty is applied only to whichever side — subject or comparable — carries the flag.",
    example: "Comparable has a flagged title issue, subject doesn't → comparable is marked down by the configured penalty.",
    adjustable: true,
  },
  "Unique Features": {
    key: "Unique Features",
    definition: "Any feature present on only one property — a private terrace, corner unit, clubhouse view, and so on.",
    comparisonRule: "A feature present on only one side earns that side its own configured impact.",
    adjustmentLogic: "Each one-sided feature contributes its own signed percent, added independently to the total adjustment.",
    example: "Comparable has a private terrace, subject doesn't → comparable is marked up by that feature's configured impact.",
    adjustable: true,
  },
};
