export interface SMEDensityMunicipality {
  kind: "sme";
  municipalityId: string;
  name: string;
  boundary: unknown | null;
  smallCount: number;
  mediumCount: number;
  total: number;
  areaKm2: number | null;
  densityPerKm2: number | null; // total / areaKm2 — null if area is unknown
  normalized: number; // 0–1, relative to the highest densityPerKm2 (falls back to raw count if no municipality has area data)
  hasAreaData: boolean; // false if areaKm2 is missing — shown distinctly rather than a misleading density
}

export interface FintechDensityMunicipality {
  kind: "fintech";
  municipalityId: string;
  name: string;
  boundary: unknown | null;
  count: number; // studied SMEs in this municipality using the technology
  totalSMEs: number; // total studied SMEs in this municipality (the sample, not true population)
  rate: number; // count / totalSMEs, 0–1 (0 if totalSMEs is 0)
  normalized: number; // same as rate — kept so SME/fintech rows share tier logic
  insufficientData: boolean; // true if totalSMEs is below the reliability threshold
}

export type DensityMunicipality =
  | SMEDensityMunicipality
  | FintechDensityMunicipality;

export type DensityTier = "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";

export type DensityColorScale = Record<DensityTier, string>;

export interface FinancialTechnologyOption {
  id: string;
  name: string;
  slug: string;
  // Parsed from the DB's JSON-encoded densityColor field, e.g.
  // {"LOW":"#fdced5","MEDIUM":"#fb9dab","HIGH":"#f73b57","VERY_HIGH":"#621722"}
  densityColors: DensityColorScale | null;
}
