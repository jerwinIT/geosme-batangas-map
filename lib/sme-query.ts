// Shared between app/actions/sme-markers.ts and app/actions/search-smes.ts
// so both queries select/shape SME data identically — kept in a plain
// (non "use server") file since it exports non-function values.

import type { SMEMarkerData } from "@/types/sme";

export const SME_SELECT = {
  id: true,
  name: true,
  latitude: true,
  longitude: true,
  assetSize: true,
  address: true,
  natureOfBusiness: true,
  yearsOfOperation: true,
  typeOfBusinessOrganization: true,
  formsOfBusinessOrganization: true,
  numberOfEmployees: true,
  averageMonthlyIncome: true,
  municipality: { select: { name: true } },
  financialTechnologies: {
    where: { isActive: true },
    select: {
      financialTechnology: {
        select: { name: true, densityColor: true },
      },
    },
  },
} as const;

// Explicit shape for the raw query result — annotating this directly
// avoids relying on inference through prisma.sME.findMany(), which
// otherwise leaves callback parameters implicitly typed as "any".
export type SMERow = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  assetSize: string;
  address: string | null;
  natureOfBusiness: string | null;
  yearsOfOperation: string | null;
  typeOfBusinessOrganization: string | null;
  formsOfBusinessOrganization: string | null;
  numberOfEmployees: string | null;
  averageMonthlyIncome: string | null;
  municipality: { name: string } | null;
  financialTechnologies: {
    financialTechnology: { name: string; densityColor: string | null };
  }[];
};

export function mapSMERows(rows: SMERow[]): SMEMarkerData[] {
  return rows
    .filter(
      (sme): sme is SMERow & { latitude: number; longitude: number } =>
        sme.latitude !== null && sme.longitude !== null,
    )
    .map((sme) => ({
      id: sme.id,
      name: sme.name,
      latitude: sme.latitude,
      longitude: sme.longitude,
      assetSize: sme.assetSize,
      municipality: sme.municipality?.name ?? null,
      address: sme.address,
      natureOfBusiness: sme.natureOfBusiness,
      yearsOfOperation: sme.yearsOfOperation,
      typeOfBusinessOrganization: sme.typeOfBusinessOrganization,
      formsOfBusinessOrganization: sme.formsOfBusinessOrganization,
      numberOfEmployees: sme.numberOfEmployees,
      averageMonthlyIncome: sme.averageMonthlyIncome,
      financialTechnologies: sme.financialTechnologies.map((entry) => ({
        name: entry.financialTechnology.name,
        densityColor: entry.financialTechnology.densityColor,
      })),
    }));
}
