"use server";

import prisma from "@/lib/prisma";
import { parseDensityColors } from "@/lib/density-color";
import type { FinancialTechnologyOption } from "@/types/density";

export async function getFinancialTechnologies(): Promise<
  FinancialTechnologyOption[]
> {
  const rows = await prisma.financialTechnology.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, densityColor: true },
    orderBy: { displayOrder: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    densityColors: parseDensityColors(row.densityColor),
  }));
}
