"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Minus, PanelLeftClose, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import type { MunicipalityData } from "@/types/municipality";
import type { FinancialTechnologyOption } from "@/types/density";

type LayerKey = "smeMarkers" | "municipalities" | "density";

interface LeftSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  layers: Record<LayerKey, boolean>;
  onLayersChange: (layers: Record<LayerKey, boolean>) => void;
  assetSizes: string[];
  onAssetSizesChange: (sizes: string[]) => void;
  businessType: string;
  onBusinessTypeChange: (type: string) => void;
  businessForms: string[];
  onBusinessFormsChange: (forms: string[]) => void;
  municipalities: MunicipalityData[];
  selectedMunicipalityIds: string[];
  onSelectedMunicipalityIdsChange: (ids: string[]) => void;
  densityType: string;
  onDensityTypeChange: (type: string) => void;
  fintechOptions: FinancialTechnologyOption[];
  selectedFintechId: string;
  onSelectedFintechIdChange: (id: string) => void;
}

const MAP_LAYERS: { key: LayerKey; label: string }[] = [
  { key: "smeMarkers", label: "SME Markers" },
  { key: "municipalities", label: "Municipalities" },
  { key: "density", label: "Density" },
];

const ASSET_SIZES = ["Small", "Medium"];

const BUSINESS_TYPES = [
  "All Types",
  "Corporation",
  "Sole Proprietorship",
  "Partnership",
  "Cooperatives",
];

const BUSINESS_FORMS = ["Merchandising", "Service", "Hybrid", "Manufacturing"];

const DENSITY_TYPES = ["SME", "Financial Technologies"];

function TierScaleSwatch({
  scale,
}: {
  scale: {
    LOW: string;
    MEDIUM: string;
    HIGH: string;
    VERY_HIGH: string;
  } | null;
}) {
  if (!scale) return null;
  return (
    <span className="flex h-2.5 w-6 shrink-0 overflow-hidden rounded-sm border border-black/10">
      <span className="flex-1" style={{ backgroundColor: scale.LOW }} />
      <span className="flex-1" style={{ backgroundColor: scale.MEDIUM }} />
      <span className="flex-1" style={{ backgroundColor: scale.HIGH }} />
      <span className="flex-1" style={{ backgroundColor: scale.VERY_HIGH }} />
    </span>
  );
}

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export default function LeftSidebar({
  isOpen,
  onToggle,
  onZoomIn,
  onZoomOut,
  layers,
  onLayersChange,
  assetSizes,
  onAssetSizesChange,
  businessType,
  onBusinessTypeChange,
  businessForms,
  onBusinessFormsChange,
  municipalities,
  selectedMunicipalityIds,
  onSelectedMunicipalityIdsChange,
  densityType,
  onDensityTypeChange,
  fintechOptions,
  selectedFintechId,
  onSelectedFintechIdChange,
}: LeftSidebarProps) {
  // Keep mounted through the close animation, then unmount — avoids any
  // leftover off-screen element once fully closed.
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  if (!shouldRender) return null;

  const filtersEnabled = layers.smeMarkers;
  const municipalitiesEnabled = layers.municipalities;
  const densityEnabled = layers.density;

  return (
    <>
      {/* Backdrop, closes the drawer on click (mobile only) */}
      <div
        onClick={onToggle}
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        onTransitionEnd={(e) => {
          if (e.propertyName === "transform" && !isOpen) setShouldRender(false);
        }}
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-72 max-w-[90vw] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header: logo + collapse toggle */}
        <div className="flex items-center justify-between border-b border-sidebar-border p-4">
          <Image
            src="/geosme-logo.webp"
            alt="Geosme Batangas"
            width={90}
            height={90}
            className="rounded-md object-contain"
            priority
          />

          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="rounded-md p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Map controls */}
          <div className="flex flex-col gap-2 p-4">
            <span className="px-1 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60">
              Map Controls
            </span>
            <div className="flex flex-col overflow-hidden rounded-md border border-sidebar-border">
              <button
                type="button"
                onClick={onZoomIn}
                aria-label="Zoom in"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Plus className="h-4 w-4" />
                Zoom in
              </button>
              <div className="h-px bg-sidebar-border" />
              <button
                type="button"
                onClick={onZoomOut}
                aria-label="Zoom out"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Minus className="h-4 w-4" />
                Zoom out
              </button>
            </div>
          </div>

          <div className="h-px bg-sidebar-border" />

          {/* Map Layers */}
          <div className="flex flex-col gap-2 p-4">
            <span className="px-1 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60">
              Map Layers
            </span>
            <div className="flex flex-col gap-1">
              {MAP_LAYERS.map((layer) => (
                <label
                  key={layer.key}
                  className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <input
                    type="checkbox"
                    checked={layers[layer.key]}
                    onChange={() =>
                      onLayersChange({
                        ...layers,
                        [layer.key]: !layers[layer.key],
                      })
                    }
                    className="h-4 w-4 rounded border-sidebar-border accent-[var(--sidebar-primary)]"
                  />
                  {layer.label}
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-sidebar-border" />

          {/* SME Marker Filters — only meaningful while the SME Markers layer is on */}
          <div className="flex flex-col gap-2 p-4">
            <span
              className={`px-1 text-xs font-medium uppercase tracking-wide transition-opacity ${
                filtersEnabled
                  ? "text-sidebar-foreground/60"
                  : "text-sidebar-foreground/30"
              }`}
            >
              SME Marker Filters
            </span>

            <div
              className={`flex flex-col gap-2 transition-opacity ${
                filtersEnabled ? "" : "pointer-events-none opacity-40"
              }`}
            >
              {/* Asset Size — multi-select */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={!filtersEnabled}
                  className="flex w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar px-3 py-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span>
                    Asset Size
                    {assetSizes.length > 0 && (
                      <span className="ml-1.5 text-sidebar-foreground/50">
                        ({assetSizes.length})
                      </span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Asset Size</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ASSET_SIZES.map((size) => (
                      <DropdownMenuCheckboxItem
                        key={size}
                        checked={assetSizes.includes(size)}
                        onCheckedChange={() =>
                          onAssetSizesChange(toggleValue(assetSizes, size))
                        }
                      >
                        {size}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Type of Business — single-select */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={!filtersEnabled}
                  className="flex w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar px-3 py-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span className="truncate">{businessType}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Type of Business</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </DropdownMenuGroup>
                  <DropdownMenuRadioGroup
                    value={businessType}
                    onValueChange={onBusinessTypeChange}
                  >
                    {BUSINESS_TYPES.map((type) => (
                      <DropdownMenuRadioItem key={type} value={type}>
                        {type}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Forms of Business — multi-select */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={!filtersEnabled}
                  className="flex w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar px-3 py-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span>
                    Forms of Business
                    {businessForms.length > 0 && (
                      <span className="ml-1.5 text-sidebar-foreground/50">
                        ({businessForms.length})
                      </span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Forms of Business</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {BUSINESS_FORMS.map((form) => (
                      <DropdownMenuCheckboxItem
                        key={form}
                        checked={businessForms.includes(form)}
                        onCheckedChange={() =>
                          onBusinessFormsChange(
                            toggleValue(businessForms, form),
                          )
                        }
                      >
                        {form}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="h-px bg-sidebar-border" />

          {/* Municipality — only meaningful while the Municipalities layer is on */}
          <div className="flex flex-col gap-2 p-4">
            <span
              className={`px-1 text-xs font-medium uppercase tracking-wide transition-opacity ${
                municipalitiesEnabled
                  ? "text-sidebar-foreground/60"
                  : "text-sidebar-foreground/30"
              }`}
            >
              Municipality
            </span>

            <div
              className={`transition-opacity ${
                municipalitiesEnabled ? "" : "pointer-events-none opacity-40"
              }`}
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={!municipalitiesEnabled}
                  className="flex w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar px-3 py-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span>
                    Municipalities
                    {selectedMunicipalityIds.length > 0 && (
                      <span className="ml-1.5 text-sidebar-foreground/50">
                        ({selectedMunicipalityIds.length})
                      </span>
                    )}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Municipalities</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {municipalities.length === 0 && (
                      <p className="px-1.5 py-2 text-xs text-muted-foreground">
                        Loading municipalities…
                      </p>
                    )}
                    {municipalities.map((municipality) => (
                      <DropdownMenuCheckboxItem
                        key={municipality.id}
                        checked={selectedMunicipalityIds.includes(
                          municipality.id,
                        )}
                        onCheckedChange={() =>
                          onSelectedMunicipalityIdsChange(
                            toggleValue(
                              selectedMunicipalityIds,
                              municipality.id,
                            ),
                          )
                        }
                      >
                        {municipality.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="h-px bg-sidebar-border" />

          {/* Density — only meaningful while the Density layer is on */}
          <div className="flex flex-col gap-2 p-4">
            <span
              className={`px-1 text-xs font-medium uppercase tracking-wide transition-opacity ${
                densityEnabled
                  ? "text-sidebar-foreground/60"
                  : "text-sidebar-foreground/30"
              }`}
            >
              Density
            </span>

            <div
              className={`flex flex-col gap-2 transition-opacity ${
                densityEnabled ? "" : "pointer-events-none opacity-40"
              }`}
            >
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={!densityEnabled}
                  className="flex w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar px-3 py-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span className="truncate">{densityType}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Density</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </DropdownMenuGroup>
                  <DropdownMenuRadioGroup
                    value={densityType}
                    onValueChange={onDensityTypeChange}
                  >
                    {DENSITY_TYPES.map((type) => (
                      <DropdownMenuRadioItem key={type} value={type}>
                        {type}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Which financial technology to visualize — only shown once
                  "Financial Technologies" density is selected. */}
              {densityType === "Financial Technologies" && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    disabled={!densityEnabled}
                    className="flex w-full items-center justify-between rounded-md border border-sidebar-border bg-sidebar px-3 py-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <span className="flex items-center gap-2 truncate">
                      {selectedFintechId &&
                        (() => {
                          const selected = fintechOptions.find(
                            (f) => f.id === selectedFintechId,
                          );
                          return (
                            <TierScaleSwatch
                              scale={selected?.densityColors ?? null}
                            />
                          );
                        })()}
                      <span className="truncate">
                        {fintechOptions.find((f) => f.id === selectedFintechId)
                          ?.name ?? "Select technology"}
                      </span>
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>
                        Financial Technology
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {fintechOptions.length === 0 && (
                        <p className="px-1.5 py-2 text-xs text-muted-foreground">
                          Loading technologies…
                        </p>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuRadioGroup
                      value={selectedFintechId}
                      onValueChange={onSelectedFintechIdChange}
                    >
                      {fintechOptions.map((fintech) => (
                        <DropdownMenuRadioItem
                          key={fintech.id}
                          value={fintech.id}
                        >
                          <span className="flex items-center gap-2">
                            <TierScaleSwatch scale={fintech.densityColors} />
                            {fintech.name}
                          </span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
