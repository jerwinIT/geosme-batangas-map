"use client";

import dynamic from "next/dynamic";

// Leaflet touches `window` on import, so it must never render on the server.
const BatangasMapView = dynamic(() => import("./BatangasMapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-500 dark:bg-zinc-900">
      Loading map…
    </div>
  ),
});

export default function BatangasMapWrapper() {
  return <BatangasMapView />;
}
