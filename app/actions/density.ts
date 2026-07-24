"use server";

import prisma from "@/lib/prisma";
import { getMunicipalities } from "./municipalities";
import type {
  SMEDensityMunicipality,
  FintechDensityMunicipality,
} from "@/types/density";

// SME density — how spatially concentrated the studied SMEs are per
// municipality, measured as count per km² rather than raw count. Raw
// count alone conflates "genuinely dense" with "just a big municipality";
// dividing by area answers the actual saturation question.
export async function getSMEDensity(): Promise<SMEDensityMunicipality[]> {
  const [municipalities, smes] = await Promise.all([
    getMunicipalities(),
    prisma.sME.findMany({
      where: { isActive: true, municipalityId: { not: null } },
      select: { municipalityId: true, assetSize: true },
    }),
  ]);

  const counts = new Map<string, { small: number; medium: number }>();
  for (const sme of smes) {
    if (!sme.municipalityId) continue;
    const entry = counts.get(sme.municipalityId) ?? { small: 0, medium: 0 };
    if (sme.assetSize === "SMALL") entry.small += 1;
    else if (sme.assetSize === "MEDIUM") entry.medium += 1;
    counts.set(sme.municipalityId, entry);
  }

  const rows = municipalities.map((m) => {
    const c = counts.get(m.id) ?? { small: 0, medium: 0 };
    const total = c.small + c.medium;
    const areaKm2 = m.area && m.area > 0 ? m.area : null;
    const densityPerKm2 = areaKm2 ? total / areaKm2 : null;

    return {
      municipalityId: m.id,
      name: m.name,
      boundary: m.boundary,
      smallCount: c.small,
      mediumCount: c.medium,
      total,
      areaKm2,
      densityPerKm2,
      hasAreaData: areaKm2 !== null,
    };
  });

  const maxDensity = Math.max(0, ...rows.map((r) => r.densityPerKm2 ?? 0));

  return rows.map((r) => ({
    kind: "sme" as const,
    ...r,
    // Municipalities without area data can't be placed on the density
    // scale at all — they're rendered as a distinct neutral state instead
    // of silently defaulting to 0 (which would visually read as "confirmed
    // low density" rather than "unknown").
    normalized:
      r.hasAreaData && maxDensity > 0 ? (r.densityPerKm2 ?? 0) / maxDensity : 0,
  }));
}

// Fintech density — what share of the SMEs *DTI actually studied* in each
// municipality use one specific financial technology. Since the 380-SME
// dataset is a research sample, not the true population of businesses,
// there's no real-world total to compare against — the sample itself is
// the only honest denominator. Municipalities with very few sampled SMEs
// are flagged as insufficientData rather than shown as a potentially
// misleading tier (e.g. 1 of 2 sampled SMEs would otherwise read as a
// confident 50% "HIGH" density).
const MIN_RELIABLE_SAMPLE_SIZE = 3;

export async function getFintechDensity(
  financialTechnologyId: string,
): Promise<FintechDensityMunicipality[]> {
  const [municipalities, allSMEs, usages] = await Promise.all([
    getMunicipalities(),
    prisma.sME.findMany({
      where: { isActive: true, municipalityId: { not: null } },
      select: { municipalityId: true },
    }),
    prisma.sMEFinancialTechnology.findMany({
      where: {
        financialTechnologyId,
        isActive: true,
        sme: { isActive: true, municipalityId: { not: null } },
      },
      select: { sme: { select: { municipalityId: true } } },
    }),
  ]);

  const totalCounts = new Map<string, number>();
  for (const sme of allSMEs) {
    if (!sme.municipalityId) continue;
    totalCounts.set(
      sme.municipalityId,
      (totalCounts.get(sme.municipalityId) ?? 0) + 1,
    );
  }

  const usageCounts = new Map<string, number>();
  for (const usage of usages) {
    const municipalityId = usage.sme.municipalityId;
    if (!municipalityId) continue;
    usageCounts.set(municipalityId, (usageCounts.get(municipalityId) ?? 0) + 1);
  }

  return municipalities.map((m) => {
    const totalSMEs = totalCounts.get(m.id) ?? 0;
    const count = usageCounts.get(m.id) ?? 0;
    const rate = totalSMEs > 0 ? count / totalSMEs : 0;

    return {
      kind: "fintech" as const,
      municipalityId: m.id,
      name: m.name,
      boundary: m.boundary,
      count,
      totalSMEs,
      rate,
      normalized: rate,
      insufficientData: totalSMEs < MIN_RELIABLE_SAMPLE_SIZE,
    };
  });
}
