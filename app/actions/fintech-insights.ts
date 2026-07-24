"use server";

import prisma from "@/lib/prisma";
import { parseDensityColors } from "@/lib/density-color";

export interface FintechUsageBar {
  name: string;
  value: number;
  color: string;
}

export interface FintechInsightsData {
  smesWithFintech: number; // distinct SMEs using at least one active technology
  totalStudied: number;
  adoptionRate: number; // 0–1, smesWithFintech / totalStudied
  totalTechnologies: number; // count of active financial technologies in the study
  mostUsedName: string | null;
  usageByTechnology: FintechUsageBar[];
}

const FALLBACK_BAR_COLOR = "#3b82f6";

export async function getFintechInsights(): Promise<FintechInsightsData> {
  const [technologies, totalStudied, smesWithFintech] = await Promise.all([
    prisma.financialTechnology.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        densityColor: true,
        smes: {
          where: { isActive: true, sme: { isActive: true } },
          select: { id: true },
        },
      },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.sME.count({ where: { isActive: true } }),
    prisma.sME.count({
      where: {
        isActive: true,
        financialTechnologies: { some: { isActive: true } },
      },
    }),
  ]);

  const usageByTechnology: FintechUsageBar[] = technologies
    .map((tech) => {
      const scale = parseDensityColors(tech.densityColor);
      return {
        name: tech.name,
        value: tech.smes.length,
        color: scale?.HIGH ?? FALLBACK_BAR_COLOR,
      };
    })
    .sort((a, b) => b.value - a.value);

  const mostUsed = usageByTechnology[0];

  return {
    smesWithFintech,
    totalStudied,
    adoptionRate: totalStudied > 0 ? smesWithFintech / totalStudied : 0,
    totalTechnologies: technologies.length,
    mostUsedName: mostUsed && mostUsed.value > 0 ? mostUsed.name : null,
    usageByTechnology,
  };
}
