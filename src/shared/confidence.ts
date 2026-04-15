/**
 * Shared confidence heuristic for Endless Testing.
 *
 * MVP confidence heuristic based on sample size and uplift.
 * NOT a real statistical test — rough directional guidance only.
 *
 * Canonical source — all other packages re-export from here.
 */

export type ConfidenceLevel = "low-data" | "not-significant" | "significant" | "winner";

export interface ConfidenceResult {
  level: ConfidenceLevel;
  label: string;
  /** Tailwind text color class (e.g. "text-amber-700"). Only meaningful in UI contexts. */
  color: string;
  /** Tailwind bg color class (e.g. "bg-amber-100"). Only meaningful in UI contexts. */
  bgColor: string;
}

export function getConfidence(
  controlImpressions: number,
  controlConversions: number,
  variantImpressions: number,
  variantConversions: number,
): ConfidenceResult {
  const totalConversions = controlConversions + variantConversions;

  // Low data: fewer than 30 visitors per variant OR fewer than 5 total conversions
  if (variantImpressions < 30 || controlImpressions < 30 || totalConversions < 5) {
    return { level: "low-data", label: "Low data", color: "text-amber-700", bgColor: "bg-amber-100" };
  }

  const controlRate = controlImpressions > 0 ? controlConversions / controlImpressions : 0;
  const variantRate = variantImpressions > 0 ? variantConversions / variantImpressions : 0;
  const uplift = controlRate > 0 ? ((variantRate - controlRate) / controlRate) * 100 : 0;

  // Winner: 200+ visitors, positive uplift >= 30%
  if (variantImpressions >= 200 && controlImpressions >= 100 && uplift >= 30) {
    return { level: "winner", label: "Winner", color: "text-emerald-700", bgColor: "bg-emerald-100" };
  }

  // Significant: 100+ visitors each, uplift >= 20%
  if (variantImpressions >= 100 && controlImpressions >= 100 && Math.abs(uplift) >= 20) {
    return { level: "significant", label: "Significant", color: "text-blue-700", bgColor: "bg-blue-100" };
  }

  // Not significant: has data but no clear signal
  return { level: "not-significant", label: "Not significant", color: "text-gray-500", bgColor: "bg-gray-100" };
}
