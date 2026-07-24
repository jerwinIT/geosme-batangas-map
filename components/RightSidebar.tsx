"use client";

import { useEffect, useState } from "react";
import { PanelRightClose } from "lucide-react";

import DashboardPanel from "./DashboardPanel";

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function RightSidebar({ isOpen, onToggle }: RightSidebarProps) {
  // Same mount-until-animation-ends pattern as LeftSidebar, so closing
  // slides smoothly and leaves nothing behind once fully closed.
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  if (!shouldRender) return null;

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
        className={`fixed inset-y-0 right-0 z-40 flex h-full w-[34rem] max-w-[90vw] flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sidebar-border p-4">
          <span className="text-sm font-semibold text-sidebar-foreground">
            Dashboard
          </span>

          <button
            type="button"
            onClick={onToggle}
            aria-label="Collapse dashboard"
            className="rounded-md p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DashboardPanel />
        </div>
      </aside>
    </>
  );
}
