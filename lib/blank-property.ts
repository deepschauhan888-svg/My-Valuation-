import { LiveCategory, PropertyInput } from "./types";

let counter = 0;
function nextId(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

/** Sensible starting attribute values for each live category, so a fresh
 *  form isn't full of empty selects. Falls back gracefully for any
 *  category an admin has added that this doesn't specifically know about. */
function defaultAttributesFor(categories: LiveCategory[]): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const cat of categories) {
    if (cat.key === "loadFactor" || cat.key === "floor") continue; // derived, not attributes
    if (cat.kind === "matrix") {
      attrs[cat.key] = cat.options[0]?.value ?? "";
    } else if (cat.kind === "flat" && cat.valueType === "boolean") {
      attrs[cat.key] = "false";
    } else {
      // numeric or count-based flat
      attrs[cat.key] = cat.key === "age" ? "5" : cat.key === "parking" ? "1" : cat.key === "balcony" ? "1" : "0";
    }
  }
  return attrs;
}

export function blankSubject(categories: LiveCategory[], citySlug: string): PropertyInput {
  return {
    id: nextId("subject"),
    label: "Subject Property",
    society: "",
    city: citySlug,
    superBuiltUpAreaSqft: 1000,
    carpetAreaSqft: 720,
    floorNumber: 6,
    totalFloors: 20,
    uniqueFeatures: [],
    attributes: defaultAttributesFor(categories),
  };
}

export function blankComparable(categories: LiveCategory[], citySlug: string, index: number): PropertyInput {
  return {
    ...blankSubject(categories, citySlug),
    id: nextId("comparable"),
    label: `Comparable ${index}`,
    salePrice: 1_02_50_000,
  };
}
