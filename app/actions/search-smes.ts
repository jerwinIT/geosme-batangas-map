"use server";

import prisma from "@/lib/prisma";
import type { SMEMarkerData } from "@/types/sme";
import { SME_SELECT, mapSMERows, type SMERow } from "@/lib/sme-query";

// Powers the map search bar's live-as-you-type results. Matches on
// business name, nature of business, and address; returns full
// SMEMarkerData (same shape as getSMEMarkers) so selecting a result can
// render its popup immediately without a second round trip.
export async function searchSMEs(query: string): Promise<SMEMarkerData[]> {
  const trimmed = query.trim();

  // Avoid firing a broad query on very short input (e.g. a single
  // keystroke), which would be noisy and mostly unhelpful.
  if (trimmed.length < 2) return [];

  const smes: SMERow[] = await prisma.sME.findMany({
    where: {
      isActive: true,
      latitude: { not: null },
      longitude: { not: null },
      OR: [
        { name: { contains: trimmed, mode: "insensitive" } },
        { natureOfBusiness: { contains: trimmed, mode: "insensitive" } },
        { address: { contains: trimmed, mode: "insensitive" } },
        { ownerName: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    select: SME_SELECT,
    orderBy: { name: "asc" },
    // Keep the dropdown short — this is a typeahead, not a full results page.
    take: 8,
  });

  return mapSMERows(smes);
}
