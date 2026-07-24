"use client";

import { useEffect, useRef, useState } from "react";
import { Marker, Popup, Tooltip, useMapEvents } from "react-leaflet";
import type L from "leaflet";

import type { SMEMarkerData } from "@/types/sme";
import { buildIcon, SMEPopupContent } from "./sme-marker-visuals";

interface SearchResultMarkerProps {
  sme: SMEMarkerData;
  onClose: () => void;
}

export default function SearchResultMarker({
  sme,
  onClose,
}: SearchResultMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null);
  const [zoom, setZoom] = useState(16);

  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });

  // Open the popup as soon as this marker exists — the map's flyTo (fired
  // by MapSearchBar on selection) animates independently; the popup just
  // follows the marker's lat/lng, so it tracks correctly mid-flight.
  useEffect(() => {
    markerRef.current?.openPopup();
  }, [sme.id]);

  const icon = buildIcon(sme.assetSize, zoom, true);

  return (
    <Marker
      ref={markerRef}
      position={[sme.latitude, sme.longitude]}
      icon={icon}
      eventHandlers={{ popupclose: onClose }}
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
