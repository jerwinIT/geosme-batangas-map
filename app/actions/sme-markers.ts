"use server";

import prisma from "@/lib/prisma";
import type { SMEMarkerData, SMEMarkerFilters } from "@/types/sme";
import { SME_SELECT, mapSMERows, type SMERow } from "@/lib/sme-query";

// --- Verified against the real schema.prisma enum declarations. ---

const ASSET_SIZE_MAP: Record<string, string> = {
  Small: "SMALL",
  Medium: "MEDIUM",
};

const BUSINESS_TYPE_MAP: Record<string, string> = {
  Corporation: "CORPORATION",
  "Sole Proprietorship": "SOLE_PROPRIETORSHIP",
  Partnership: "PARTNERSHIP",
  Cooperatives: "COOPERATIVES",
};

const BUSINESS_FORM_MAP: Record<string, string> = {
  Merchandising: "MERCHANDISING",
  Service: "SERVICE",
  Hybrid: "HYBRID",
  Manufacturing: "MANUFACTURING",
};

export async function getSMEMarkers(
  filters: SMEMarkerFilters = {},
): Promise<SMEMarkerData[]> {
  const { assetSizes = [], businessType, businessForms = [] } = filters;

  const mappedAssetSizes = assetSizes
    .map((size) => ASSET_SIZE_MAP[size])
    .filter(Boolean);

  const mappedBusinessType =
    businessType && businessType !== "All Types"
      ? BUSINESS_TYPE_MAP[businessType]
      : undefined;

  const mappedBusinessForms = businessForms
    .map((form) => BUSINESS_FORM_MAP[form])
    .filter(Boolean);

  const smes: SMERow[] = await prisma.sME.findMany({
    where: {
      isActive: true,
      latitude: { not: null },
      longitude: { not: null },
      // Confirmed enum values: PENDING | APPROVED | REJECTED.
      // Uncomment to only show admin-approved businesses on the map:
      // verificationStatus: "APPROVED",
      ...(mappedAssetSizes.length > 0
        ? { assetSize: { in: mappedAssetSizes as never[] } }
        : {}),
      ...(mappedBusinessType
        ? { typeOfBusinessOrganization: mappedBusinessType as never }
        : {}),
      ...(mappedBusinessForms.length > 0
        ? {
            formsOfBusinessOrganization: { in: mappedBusinessForms as never[] },
          }
        : {}),
    },
    select: SME_SELECT,
    // Safety cap so an unfiltered query on a large table doesn't ship
    // thousands of markers to the browser at once.
    take: 2000,
  });

  return mapSMERows(smes);
}
