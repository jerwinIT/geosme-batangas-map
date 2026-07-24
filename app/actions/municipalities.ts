"use server";

import prisma from "@/lib/prisma";
import type { MunicipalityData } from "@/types/municipality";

export async function getMunicipalities(): Promise<MunicipalityData[]> {
  const municipalities: MunicipalityData[] = await prisma.municipality.findMany(
    {
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        area: true,
        boundary: true,
      },
      orderBy: { name: "asc" },
    },
  );

  return municipalities;
}
