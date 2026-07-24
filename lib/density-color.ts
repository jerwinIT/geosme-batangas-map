import type { DensityColorScale, DensityTier } from "@/types/density";

const REQUIRED_TIERS: DensityTier[] = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"];

// The DB stores densityColor as a JSON string, e.g.
// {"LOW":"#fdced5","MEDIUM":"#fb9dab","HIGH":"#f73b57","VERY_HIGH":"#621722"}
// Parse it defensively — malformed or partial data falls back to null so
// callers can apply a sane default rather than crashing on bad JSON.
export function parseDensityColors(
  raw: string | null,
): DensityColorScale | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const hasAllTiers = REQUIRED_TIERS.every(
      (tier) => typeof parsed[tier] === "string",
    );
    return hasAllTiers ? (parsed as DensityColorScale) : null;
  } catch {
    return null;
  }
}

// SME density uses a fixed light-to-dark blue gradient — there's no
// per-item "brand scale" for SMEs the way there is for fintech.
const SME_LOW = { r: 219, g: 234, b: 254 }; // blue-100
const SME_HIGH = { r: 29, g: 78, b: 216 }; // blue-700

export function smeDensityColor(normalized: number): string {
  const t = Math.max(0, Math.min(1, normalized));
  const r = Math.round(SME_LOW.r + (SME_HIGH.r - SME_LOW.r) * t);
  const g = Math.round(SME_LOW.g + (SME_HIGH.g - SME_LOW.g) * t);
  const b = Math.round(SME_LOW.b + (SME_HIGH.b - SME_LOW.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

// Fintech density uses the admin-defined 4-tier color scale directly —
// each municipality's normalized (0–1) value is bucketed into one of
// LOW / MEDIUM / HIGH / VERY_HIGH, and that exact admin-chosen color is
// used as-is (no opacity blending), since the four shades already encode
// increasing intensity.
const FALLBACK_SCALE: DensityColorScale = {
  LOW: "#dbeafe",
  MEDIUM: "#93c5fd",
  HIGH: "#3b82f6",
  VERY_HIGH: "#1d4ed8",
};

export function tierForNormalized(normalized: number): DensityTier {
  const t = Math.max(0, Math.min(1, normalized));
  if (t <= 0.25) return "LOW";
  if (t <= 0.5) return "MEDIUM";
  if (t <= 0.75) return "HIGH";
  return "VERY_HIGH";
}

export function fintechTierColor(
  scale: DensityColorScale | null,
  normalized: number,
): string {
  const tier = tierForNormalized(normalized);
  const activeScale = scale ?? FALLBACK_SCALE;
  return activeScale[tier] ?? FALLBACK_SCALE[tier];
}
