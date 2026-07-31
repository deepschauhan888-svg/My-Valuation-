import { PropertyInput } from "./types";

let counter = 0;
function nextId(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function blankSubject(): PropertyInput {
  return {
    id: nextId("subject"),
    label: "Subject Property",
    society: "",
    city: "Mumbai",
    superBuiltUpAreaSqft: 1000,
    carpetAreaSqft: 720,
    ageYears: 5,
    unitType: "2bhk",
    constructionStatus: "ready-to-move",
    condition: "good",
    furnishing: "semi-furnished",
    floorNumber: 6,
    totalFloors: 20,
    facing: "east",
    coveredParkingCount: 1,
    balconyCount: 1,
    hasLegalIssues: false,
    uniqueFeatures: [],
  };
}

export function blankComparable(index: number): PropertyInput {
  return {
    ...blankSubject(),
    id: nextId("comparable"),
    label: `Comparable ${index}`,
    salePrice: 1_02_50_000,
  };
}
