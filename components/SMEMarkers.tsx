"use client";

import { useEffect, useState } from "react";
import { Marker, Popup, Tooltip, useMap, useMapEvents } from "react-leaflet";

import { getSMEMarkers } from "@/app/actions/sme-markers";
import type { SMEMarkerData } from "@/types/sme";
import { buildIcon, SMEPopupContent } from "./sme-marker-visuals";

interface SMEMarkersProps {
  assetSizes: string[];
  businessType: string;
  businessForms: string[];
}

export default function SMEMarkers({
  assetSizes,
  businessType,
  businessForms,
}: SMEMarkersProps) {
  const [markers, setMarkers] = useState<SMEMarkerData[]>([]);
  const [zoom, setZoom] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Keep icon sizing in sync as the user zooms.
  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });

  // Stable string keys so the effect doesn't refire on every render just
  // because the parent passed new array literals with the same contents.
  const assetSizesKey = assetSizes.join(",");
  const businessFormsKey = businessForms.join(",");

  useEffect(() => {
    let cancelled = false;

    getSMEMarkers({ assetSizes, businessType, businessForms })
      .then((data) => {
        if (!cancelled) setMarkers(data);
      })
      .catch((err) => {
        console.error("Failed to load SME markers:", err);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetSizesKey, businessType, businessFormsKey]);

  return (
    <>
      {markers.map((sme) => (
        <SMEMarker
          key={sme.id}
          sme={sme}
          zoom={zoom}
          isSelected={selectedId === sme.id}
          onSelect={() => setSelectedId(sme.id)}
          onDeselect={() =>
            setSelectedId((current) => (current === sme.id ? null : current))
          }
        />
      ))}
    </>
  );
}

function SMEMarker({
  sme,
  zoom,
  isSelected,
  onSelect,
  onDeselect,
}: {
  sme: SMEMarkerData;
  zoom: number;
  isSelected: boolean;
  onSelect: () => void;
  onDeselect: () => void;
}) {
  const map = useMap();
  const icon = buildIcon(sme.assetSize, zoom, isSelected);

  return (
    <Marker
      position={[sme.latitude, sme.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          onSelect();
          const currentZoom = map.getZoom();
          const targetZoom = Math.max(currentZoom, 16);
          map.flyTo([sme.latitude, sme.longitude], targetZoom, {
            duration: currentZoom < 15 ? 1 : 0.5,
          });
        },
        // Shrink back to normal size once its popup is dismissed.
        popupclose: onDeselect,
      }}
    >
      <Tooltip direction="top" offset={[0, -4]} opacity={1}>
        {sme.name}
      </Tooltip>
      <Popup minWidth={280} maxWidth={360}>
        <SMEPopupContent sme={sme} />
      </Popup>
    </Marker>
  );
}
