// Indian numbering formatting — crore / lakh, the way a valuation report should read.

export function formatINR(value: number): string {
  if (value >= 1_00_00_000) {
    return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatPSF(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}/sqft`;
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
