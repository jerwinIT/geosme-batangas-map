"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import type { MunicipalityData } from "@/types/municipality";

interface MunicipalityBoundariesProps {
  municipalities: MunicipalityData[];
  selectedIds: string[];
  visible: boolean;
}

export default function MunicipalityBoundaries({
  municipalities,
  selectedIds,
  visible,
}: MunicipalityBoundariesProps) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const previousSelectedIdsRef = useRef<string[]>([]);

  const selectedIdsKey = selectedIds.join(",");

  useEffect(() => {
    // Clear existing boundary layers before redrawing.
    if (layerGroupRef.current) {
      map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
    }

    if (!visible || selectedIds.length === 0) {
      previousSelectedIdsRef.current = selectedIds;
      return;
    }

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;

    // Whichever municipality just got checked (vs. the previous render) is
    // what we fly to — toggling one off, or an unrelated re-render, won't
    // trigger a fly.
    const newlyAddedId = selectedIds.find(
      (id) => !previousSelectedIdsRef.current.includes(id),
    );

    let flyToCenter: [number, number] | null = null;
    let flyToLayer: L.GeoJSON | null = null;

    selectedIds.forEach((id) => {
      const municipality = municipalities.find((m) => m.id === id);
      if (!municipality || !municipality.boundary) return;

      try {
        const geoJsonLayer = L.geoJSON(
          municipality.boundary as GeoJSON.GeoJsonObject,
          {
            style: {
              color: "#d72323",
              weight: 4,
              opacity: 0.9,
              fillColor: "#d72323",
              fillOpacity: 0.08,
              dashArray: "8, 8",
            },
            onEachFeature: (_feature, layer) => {
              layer.bindPopup(
                `<div class="text-center">
                  <p class="font-semibold text-sm">${municipality.name}</p>
                  <p class="text-xs text-muted-foreground">Municipality Boundary</p>
                </div>`,
              );
            },
          },
        );

        layerGroup.addLayer(geoJsonLayer);

        if (id === newlyAddedId) {
          flyToLayer = geoJsonLayer;
          flyToCenter =
            municipality.latitude != null && municipality.longitude != null
              ? [municipality.latitude, municipality.longitude]
              : null;
        }
      } catch (error) {
        console.error(
          `Error rendering boundary for ${municipality.name}:`,
          error,
        );
      }
    });

    if (newlyAddedId) {
      if (flyToCenter) {
        map.flyTo(flyToCenter, 13, { duration: 1 });
      } else if (flyToLayer) {
        const bounds = (flyToLayer as L.GeoJSON).getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { padding: [40, 40], duration: 1 });
        }
      }
    }

    previousSelectedIdsRef.current = selectedIds;

    return () => {
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, municipalities, visible, selectedIdsKey]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current);
      }
    };
  }, [map]);

  return null;
}
