"use server";

import prisma from "@/lib/prisma";
import type { CategoryCount } from "@/types/insights";
import {
  formatAssetSize,
  formatAverageMonthlyIncome,
  formatBusinessForm,
  formatBusinessType,
  formatNumberOfEmployees,
  formatYearsOfOperation,
} from "@/lib/sme-format";

export interface SMEInsightsData {
  totalStudied: number;
  municipalitiesCovered: number;
  municipalityDistribution: CategoryCount[];
  years: CategoryCount[];
  type: CategoryCount[];
  forms: CategoryCount[];
  assetSize: CategoryCount[];
  employees: CategoryCount[];
  income: CategoryCount[];
}

// Canonical display order for each enum — Prisma's groupBy doesn't
// guarantee ordering, and these are ordinal categories (years/employees/
// income buckets should read low → high, not alphabetically).
const YEARS_ORDER = [
  "ONE_TO_FIVE",
  "SIX_TO_TEN",
  "ELEVEN_TO_FIFTEEN",
  "SIXTEEN_TO_TWENTY",
  "MORE_THAN_TWENTY",
];
const TYPE_ORDER = [
  "SOLE_PROPRIETORSHIP",
  "PARTNERSHIP",
  "CORPORATION",
  "COOPERATIVES",
];
const FORMS_ORDER = ["MERCHANDISING", "SERVICE", "HYBRID", "MANUFACTURING"];
const ASSET_SIZE_ORDER = ["SMALL", "MEDIUM"];
const EMPLOYEES_ORDER = [
  "ONE_TO_FIFTY",
  "FIFTY_ONE_TO_HUNDRED",
  "ONE_HUNDRED_TO_ONE_FIFTY",
  "ONE_FIFTY_TO_TWO_HUNDRED",
  "MORE_THAN_TWO_HUNDRED",
];
const INCOME_ORDER = [
  "BELOW_P50_000",
  "P50_001_TO_P100_000",
  "P100_001_TO_P150_000",
  "P150_001_TO_P200_000",
  "MORE_THAN_P200_000",
];

// The DTI study covers exactly these 5 municipalities — matched by
// case-insensitive substring so naming variants (e.g. "Tanauan" vs
// "Tanauan City") in the DB still resolve correctly.
const STUDY_MUNICIPALITIES = [
  "Lipa",
  "Batangas City",
  "Santo Tomas",
  "Tanauan",
  "Calaca",
];

function toOrderedCounts(
  counts: Map<string, number>,
  order: string[],
  formatter: (value: string | null) => string | null,
): CategoryCount[] {
  return order.map((key) => ({
    name: formatter(key) ?? key,
    value: counts.get(key) ?? 0,
  }));
}

function countBy<T extends string | null>(
  rows: { value: T }[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!row.value) continue;
    counts.set(row.value, (counts.get(row.value) ?? 0) + 1);
  }
  return counts;
}

export async function getSMEInsights(): Promise<SMEInsightsData> {
  const [smes, municipalities] = await Promise.all([
    prisma.sME.findMany({
      where: { isActive: true },
      select: {
        municipalityId: true,
        yearsOfOperation: true,
        typeOfBusinessOrganization: true,
        formsOfBusinessOrganization: true,
        assetSize: true,
        numberOfEmployees: true,
        averageMonthlyIncome: true,
      },
    }),
    prisma.municipality.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    }),
  ]);

  const yearsCounts = countBy(smes.map((s) => ({ value: s.yearsOfOperation })));
  const typeCounts = countBy(
    smes.map((s) => ({ value: s.typeOfBusinessOrganization })),
  );
  const formsCounts = countBy(
    smes.map((s) => ({ value: s.formsOfBusinessOrganization })),
  );
  const assetSizeCounts = countBy(smes.map((s) => ({ value: s.assetSize })));
  const employeesCounts = countBy(
    smes.map((s) => ({ value: s.numberOfEmployees })),
  );
  const incomeCounts = countBy(
    smes.map((s) => ({ value: s.averageMonthlyIncome })),
  );

  // Municipality distribution, restricted to the study's 5 municipalities.
  const smeCountByMunicipalityId = new Map<string, number>();
  for (const sme of smes) {
    if (!sme.municipalityId) continue;
    smeCountByMunicipalityId.set(
      sme.municipalityId,
      (smeCountByMunicipalityId.get(sme.municipalityId) ?? 0) + 1,
    );
  }

  const municipalityDistribution: CategoryCount[] = STUDY_MUNICIPALITIES.map(
    (target) => {
      const match = municipalities.find((m) =>
        m.name.toLowerCase().includes(target.toLowerCase()),
      );
      const value = match ? (smeCountByMunicipalityId.get(match.id) ?? 0) : 0;
      return { name: match?.name ?? target, value };
    },
  ).sort((a, b) => b.value - a.value);

  return {
    totalStudied: smes.length,
    municipalitiesCovered: municipalityDistribution.filter((m) => m.value > 0)
      .length,
    municipalityDistribution,
    years: toOrderedCounts(yearsCounts, YEARS_ORDER, formatYearsOfOperation),
    type: toOrderedCounts(typeCounts, TYPE_ORDER, formatBusinessType),
    forms: toOrderedCounts(formsCounts, FORMS_ORDER, formatBusinessForm),
    assetSize: toOrderedCounts(
      assetSizeCounts,
      ASSET_SIZE_ORDER,
      formatAssetSize,
    ),
    employees: toOrderedCounts(
      employeesCounts,
      EMPLOYEES_ORDER,
      formatNumberOfEmployees,
    ),
    income: toOrderedCounts(
      incomeCounts,
      INCOME_ORDER,
      formatAverageMonthlyIncome,
    ),
  };
}
