"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

import { searchSMEs } from "@/app/actions/search-smes";
import type { SMEMarkerData } from "@/types/sme";

interface MapSearchBarProps {
  map: LeafletMap | null;
  onSelect: (sme: SMEMarkerData) => void;
}

export default function MapSearchBar({ map, onSelect }: MapSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SMEMarkerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced dynamic search — fires ~300ms after the user stops typing,
  // rather than on every keystroke.
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      searchSMEs(trimmed)
        .then((data) => setResults(data))
        .catch((err) => console.error("SME search failed:", err))
        .finally(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(sme: SMEMarkerData) {
    setQuery(sme.name);
    setIsOpen(false);
    setResults([]);
    onSelect(sme);

    if (map) {
      const currentZoom = map.getZoom();
      const targetZoom = Math.max(currentZoom, 16);
      map.flyTo([sme.latitude, sme.longitude], targetZoom, {
        duration: currentZoom < 15 ? 1 : 0.5,
      });
    }
  }

  const showDropdown = isOpen && query.trim().length >= 2;

  return (
    <div
      ref={containerRef}
      className="absolute left-1/2 top-3 z-20 w-full max-w-md -translate-x-1/2 px-14"
    >
      <div className="flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar px-4 py-2 text-sidebar-foreground shadow-md">
        {isLoading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-sidebar-foreground/60" />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />
        )}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search SME..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-sidebar-foreground/50"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            aria-label="Clear search"
            className="shrink-0 rounded-full p-0.5 hover:bg-sidebar-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="mt-1.5 max-h-72 overflow-y-auto rounded-lg border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg">
          {isLoading && results.length === 0 && (
            <p className="px-4 py-3 text-xs text-sidebar-foreground/60">
              Searching…
            </p>
          )}

          {!isLoading && results.length === 0 && (
            <p className="px-4 py-3 text-xs text-sidebar-foreground/60">
              No matching SMEs found.
            </p>
          )}

          {results.map((sme) => (
            <button
              key={sme.id}
              type="button"
              onClick={() => handleSelect(sme)}
              className="flex w-full flex-col items-start gap-0.5 border-b border-sidebar-border/60 px-4 py-2 text-left last:border-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <span className="text-sm font-medium">{sme.name}</span>
              {(sme.natureOfBusiness || sme.municipality) && (
                <span className="text-xs text-sidebar-foreground/60">
                  {[sme.natureOfBusiness, sme.municipality]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
