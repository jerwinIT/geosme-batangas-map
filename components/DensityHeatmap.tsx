"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import { getSMEDensity, getFintechDensity } from "@/app/actions/density";
import {
  smeDensityColor,
  fintechTierColor,
  tierForNormalized,
} from "@/lib/density-color";
import type {
  DensityMunicipality,
  FinancialTechnologyOption,
} from "@/types/density";

interface DensityHeatmapProps {
  visible: boolean;
  densityType: string; // "SME" | "Financial Technologies"
  selectedFintech: FinancialTechnologyOption | null;
}

export default function DensityHeatmap({
  visible,
  densityType,
  selectedFintech,
}: DensityHeatmapProps) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Clear whatever's currently drawn before redrawing (or hiding).
    if (layerGroupRef.current) {
      map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
    }

    if (!visible) return;
    // Fintech mode needs a technology chosen before there's anything to query.
    if (densityType === "Financial Technologies" && !selectedFintech) return;

    let cancelled = false;

    async function load() {
      const rows: DensityMunicipality[] =
        densityType === "Financial Technologies" && selectedFintech
          ? await getFintechDensity(selectedFintech.id)
          : await getSMEDensity();

      if (cancelled) return;

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      rows.forEach((row) => {
        if (!row.boundary) return;

        const isFintech = row.kind === "fintech";
        const isUnreliable = isFintech
          ? row.insufficientData
          : !row.hasAreaData;

        const fillColor = isUnreliable
          ? "#e5e7eb" // neutral gray — not enough data here to trust a reading
          : isFintech
            ? fintechTierColor(
                selectedFintech?.densityColors ?? null,
                row.normalized,
              )
            : smeDensityColor(row.normalized);

        // Tier colors are already solid, deliberately-chosen shades — the
        // border just uses the same color at full opacity for a clean
        // outline, rather than blending in a separate hue.
        const strokeColor = isUnreliable
          ? "#9ca3af"
          : isFintech
            ? fillColor
            : "#1d4ed8";

        let tooltipText: string;
        if (isFintech) {
          const percent = Math.round(row.rate * 100);
          if (isUnreliable) {
            tooltipText = `<strong>${row.name}</strong><br/>${row.count} of ${row.totalSMEs} studied SME${
              row.totalSMEs === 1 ? "" : "s"
            } use ${selectedFintech?.name ?? "this technology"}<br/><span style="opacity:0.7">Too few sampled SMEs here for a reliable reading</span>`;
          } else {
            const tierLabel = tierForNormalized(row.normalized).replace(
              "_",
              " ",
            );
            tooltipText = `<strong>${row.name}</strong><br/>${row.count} of ${row.totalSMEs} studied SMEs (${percent}%) use ${
              selectedFintech?.name ?? "this technology"
            }<br/><span style="opacity:0.7">${tierLabel} density</span>`;
          }
        } else if (isUnreliable) {
          tooltipText = `<strong>${row.name}</strong><br/>${row.total} SME${
            row.total === 1 ? "" : "s"
          } studied<br/><span style="opacity:0.7">No area data on file — density can't be computed</span>`;
        } else {
          const densityLabel =
            row.densityPerKm2 !== null
              ? `${row.densityPerKm2.toFixed(1)} SMEs / km²`
              : "";
          tooltipText = `<strong>${row.name}</strong><br/>${row.total} SME${
            row.total === 1 ? "" : "s"
          } studied (${row.smallCount} small, ${row.mediumCount} medium)<br/><span style="opacity:0.7">${densityLabel}</span>`;
        }

        try {
          const layer = L.geoJSON(row.boundary as GeoJSON.GeoJsonObject, {
            style: {
              color: strokeColor,
              weight: 1.5,
              opacity: isUnreliable ? 0.6 : 0.9,
              fillColor,
              fillOpacity: isUnreliable ? 0.35 : 0.75,
            },
          });

          layer.bindTooltip(tooltipText, { sticky: true, direction: "top" });
          layerGroup.addLayer(layer);
        } catch (error) {
          console.error(`Error rendering density for ${row.name}:`, error);
        }
      });
    }

    load();

    return () => {
      cancelled = true;
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
    };
  }, [
    map,
    visible,
    densityType,
    selectedFintech?.id,
    selectedFintech?.densityColors,
    selectedFintech?.name,
  ]);

  return null;
}
