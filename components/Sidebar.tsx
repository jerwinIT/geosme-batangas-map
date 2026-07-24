"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Minus, PanelLeftClose } from "lucide-react";

import DashboardPanel from "./DashboardPanel";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  onZoomIn,
  onZoomOut,
}: SidebarProps) {
  // Keep the sidebar mounted for the duration of the close animation, then
  // unmount it entirely so no off-screen element (and no border artifact)
  // lingers in the DOM once it's fully closed.
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop, closes the drawer on click (mobile only — desktop sidebar sits inline) */}
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
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-[34rem] max-w-[90vw] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header: logo + collapse toggle */}
        <div className="flex items-center justify-between border-b border-sidebar-border p-4">
          <Image
            src="/images/geosme-batangas.jpg"
            alt="Geosme Batangas"
            width={100}
            height={100}
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

        {/* Scrollable content */}
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

          {/* Dashboard */}
          <DashboardPanel />
        </div>
      </aside>
    </>
  );
}
