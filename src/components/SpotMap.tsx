"use client";

import { useEffect, useRef } from "react";
import { regionLabel } from "@/lib/i18n";
import type { KiteSpotInput } from "@/lib/scoring";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[character];
  });
}

export function SpotMap({ spots }: { spots: KiteSpotInput[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    async function mountMap() {
      if (!containerRef.current) return;
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      const map = L.map(containerRef.current).setView([52.7, 10.4], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      const icon = L.divIcon({
        className: "kite-marker",
        html: "KS",
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      for (const spot of spots) {
        const name = escapeHtml(spot.name);
        const region = escapeHtml(regionLabel(spot.region, "de"));
        const good = escapeHtml(spot.suitableWindDirections.join(", "));
        const unsafe = escapeHtml(spot.offshoreWindDirections.join(", "));
        const href = `/spots/${encodeURIComponent(spot.slug)}`;
        L.marker([spot.latitude, spot.longitude], { icon })
          .addTo(map)
          .bindPopup(`<strong>${name}</strong><br/>${region}<br/>Best: ${good}<br/>Unsafe: ${unsafe}<br/><a href="${href}">Open spot</a>`);
      }

      cleanup = () => map.remove();
    }

    mountMap();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [spots]);

  return <div ref={containerRef} className="h-full min-h-[540px] w-full" />;
}
