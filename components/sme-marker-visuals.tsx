// Shared between SMEMarkers.tsx (the filtered layer of markers) and
// SearchResultMarker.tsx (a single marker flown to from the search bar),
// so both render identical icons and popup content.

import L from "leaflet";

import type { SMEMarkerData } from "@/types/sme";
import {
  formatAssetSize,
  formatAverageMonthlyIncome,
  formatBusinessForm,
  formatBusinessType,
  formatNumberOfEmployees,
  formatYearsOfOperation,
} from "@/lib/sme-format";

const SHADOW_URL =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

// Zoom-responsive base icon size — small while zoomed out (so a dense
// cluster of markers doesn't overwhelm the map), larger once zoomed in.
export function getBaseSize(zoom: number): [number, number] {
  if (zoom <= 10) return [14, 14];
  if (zoom <= 12) return [20, 20];
  return [24, 24];
}

export function buildIcon(
  assetSize: string,
  zoom: number,
  isSelected: boolean,
) {
  const iconUrl =
    assetSize === "MEDIUM"
      ? "/active-medium-markers.svg"
      : "/active-small-markers.svg";

  const [baseWidth, baseHeight] = getBaseSize(zoom);

  // Selected (clicked / navigated-to) marker renders noticeably bigger so
  // it stands out from the rest while its popup is open.
  const scale = isSelected ? 1.8 : 1;
  const width = baseWidth * scale;
  const height = baseHeight * scale;

  const options: L.IconOptions = {
    iconUrl,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
    className: isSelected ? "sme-marker-selected" : undefined,
  };

  // Shadow only once markers are large enough for it to read as a shadow
  // rather than visual clutter at a zoomed-out, dense view.
  if (zoom > 11) {
    options.shadowUrl = SHADOW_URL;
    options.shadowSize = [width * 1.64, height];
    options.shadowAnchor = [width / 2, height];
  }

  return L.icon(options);
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-xs font-medium text-popover-foreground">
        {value}
      </span>
    </div>
  );
}

export function SMEPopupContent({ sme }: { sme: SMEMarkerData }) {
  return (
    <div className="w-full min-w-[260px] max-w-[340px] p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 pr-4">
        <p className="text-sm font-semibold leading-tight text-popover-foreground">
          {sme.name}
        </p>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          {formatAssetSize(sme.assetSize)}
        </span>
      </div>

      {(sme.natureOfBusiness || sme.municipality || sme.address) && (
        <p className="mt-1 text-xs text-muted-foreground">
          {[sme.natureOfBusiness, sme.municipality, sme.address]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      <div className="my-2.5 h-px bg-border" />

      {/* DTI business profile fields */}
      <div className="divide-y divide-border/60">
        <InfoRow
          label="Years of Operation"
          value={formatYearsOfOperation(sme.yearsOfOperation)}
        />
        <InfoRow
          label="Business Type"
          value={formatBusinessType(sme.typeOfBusinessOrganization)}
        />
        <InfoRow
          label="Business Form"
          value={formatBusinessForm(sme.formsOfBusinessOrganization)}
        />
        <InfoRow
          label="Employees"
          value={formatNumberOfEmployees(sme.numberOfEmployees)}
        />
        <InfoRow
          label="Avg. Monthly Income"
          value={formatAverageMonthlyIncome(sme.averageMonthlyIncome)}
        />
      </div>

      {/* Fintech usage */}
      {sme.financialTechnologies.length > 0 && (
        <>
          <div className="my-2.5 h-px bg-border" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Fintech Used
          </span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {sme.financialTechnologies.map((fintech) => (
              <span
                key={fintech.name}
                className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                style={{
                  borderColor: fintech.densityColor ?? "var(--border)",
                  color: fintech.densityColor ?? "var(--popover-foreground)",
                  backgroundColor: fintech.densityColor
                    ? `${fintech.densityColor}1a`
                    : "transparent",
                }}
              >
                {fintech.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
