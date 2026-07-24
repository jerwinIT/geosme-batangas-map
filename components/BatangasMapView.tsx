"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import { Menu, LayoutDashboard } from "lucide-react";
import "leaflet/dist/leaflet.css";

import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import MapSearchBar from "./MapSearchBar";
import SMEMarkers from "./SMEMarkers";
import SearchResultMarker from "./SearchResultMarker";
import MunicipalityBoundaries from "./MunicipalityBoundaries";
import DensityHeatmap from "./DensityHeatmap";
import { getMunicipalities } from "@/app/actions/municipalities";
import { getFinancialTechnologies } from "@/app/actions/financial-technologies";
import type { SMEMarkerData } from "@/types/sme";
import type { MunicipalityData } from "@/types/municipality";
import type { FinancialTechnologyOption } from "@/types/density";

// Approximate center of Batangas province, Philippines
const BATANGAS_CENTER: [number, number] = [13.7565, 121.0583];

type LayerKey = "smeMarkers" | "municipalities" | "density";

export default function BatangasMapView() {
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);

  // Lifted up from LeftSidebar so the SME marker query can react to them.
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    smeMarkers: true,
    municipalities: false,
    density: false,
  });
  const [assetSizes, setAssetSizes] = useState<string[]>([]);
  const [businessType, setBusinessType] = useState("All Types");
  const [businessForms, setBusinessForms] = useState<string[]>([]);

  // Municipalities fetched once from the DB, plus which ones are
  // currently checked in the sidebar's Municipality filter.
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [selectedMunicipalityIds, setSelectedMunicipalityIds] = useState<
    string[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    getMunicipalities()
      .then((data) => {
        if (!cancelled) setMunicipalities(data);
      })
      .catch((err) => console.error("Failed to load municipalities:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  // Financial technologies for the Density → Financial Technologies
  // sub-dropdown, fetched once (admin-managed list, rarely changes).
  const [fintechOptions, setFintechOptions] = useState<
    FinancialTechnologyOption[]
  >([]);
  const [densityType, setDensityType] = useState("SME");
  // Empty string (not null) so DropdownMenuRadioGroup is a controlled
  // component from the very first render — starting at null/undefined and
  // switching to a real value later trips Base UI's controlled/uncontrolled
  // consistency check.
  const [selectedFintechId, setSelectedFintechId] = useState("");

  useEffect(() => {
    let cancelled = false;
    getFinancialTechnologies()
      .then((data) => {
        if (!cancelled) setFintechOptions(data);
      })
      .catch((err) =>
        console.error("Failed to load financial technologies:", err),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedFintech =
    fintechOptions.find((f) => f.id === selectedFintechId) ?? null;

  // The SME currently selected from the search bar — renders its own
  // marker + auto-opened popup regardless of the SME Markers layer state.
  const [searchSelection, setSearchSelection] = useState<SMEMarkerData | null>(
    null,
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      <LeftSidebar
        isOpen={isLeftOpen}
        onToggle={() => setIsLeftOpen((prev) => !prev)}
        onZoomIn={() => map?.zoomIn()}
        onZoomOut={() => map?.zoomOut()}
        layers={layers}
        onLayersChange={setLayers}
        assetSizes={assetSizes}
        onAssetSizesChange={setAssetSizes}
        businessType={businessType}
        onBusinessTypeChange={setBusinessType}
        businessForms={businessForms}
        onBusinessFormsChange={setBusinessForms}
        municipalities={municipalities}
        selectedMunicipalityIds={selectedMunicipalityIds}
        onSelectedMunicipalityIdsChange={setSelectedMunicipalityIds}
        densityType={densityType}
        onDensityTypeChange={setDensityType}
        fintechOptions={fintechOptions}
        selectedFintechId={selectedFintechId}
        onSelectedFintechIdChange={setSelectedFintechId}
      />

      <RightSidebar
        isOpen={isRightOpen}
        onToggle={() => setIsRightOpen((prev) => !prev)}
      />

      <div className="relative h-full w-full">
        <MapSearchBar map={map} onSelect={setSearchSelection} />

        {/* Trigger to reopen the left sidebar once it's collapsed */}
        {!isLeftOpen && (
          <button
            type="button"
            onClick={() => setIsLeftOpen(true)}
            aria-label="Open sidebar"
            className="absolute left-3 top-3 z-20 rounded-md border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground shadow-sm"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* Trigger to reopen the dashboard once it's collapsed */}
        {!isRightOpen && (
          <button
            type="button"
            onClick={() => setIsRightOpen(true)}
            aria-label="Open dashboard"
            className="absolute right-3 top-3 z-20 rounded-md border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>
        )}

        <MapContainer
          ref={setMap}
          center={BATANGAS_CENTER}
          zoom={10}
          scrollWheelZoom
          zoomControl={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {layers.smeMarkers && (
            <SMEMarkers
              assetSizes={assetSizes}
              businessType={businessType}
              businessForms={businessForms}
            />
          )}

          <MunicipalityBoundaries
            municipalities={municipalities}
            selectedIds={selectedMunicipalityIds}
            visible={layers.municipalities}
          />

          <DensityHeatmap
            visible={layers.density}
            densityType={densityType}
            selectedFintech={selectedFintech}
          />

          {searchSelection && (
            <SearchResultMarker
              sme={searchSelection}
              onClose={() => setSearchSelection(null)}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
