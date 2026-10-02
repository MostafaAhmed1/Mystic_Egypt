"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, ZoomControl } from "react-leaflet";
import { Icon, type LatLngExpression, type Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { CircleDot } from "lucide-react";
import type { TourPointDto } from "@/features/tour/types";

// Gold custom marker — self-contained SVG data-URI (no external requests, no CDN).
const GOLD_MARKER = new Icon({
  iconUrl:
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44">` +
        `<defs>` +
          `<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">` +
            `<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>` +
          `</filter>` +
        `</defs>` +
        `<path d="M16 2C9.4 2 4 7.4 4 14c0 10 12 28 12 28s12-18 12-28C28 7.4 22.6 2 16 2z" fill="#D4AF37" filter="url(#shadow)"/>` +
        `<circle cx="16" cy="14" r="5" fill="#0B0C10"/>` +
        `<circle cx="16" cy="14" r="2.5" fill="#D4AF37"/>` +
        `</svg>`,
    ),
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -42],
});

// Free map tiles — OpenStreetMap standard (no API key required)
const DARK_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DARK_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function TourMap({ route }: { route: TourPointDto[] }) {
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (map && route.length > 1) {
      const coords: LatLngExpression[] = route.map((p) => [p.lat, p.lng]);
      map.whenReady(() => {
        map.fitBounds(coords as [number, number][], { padding: [50, 50] });
      });
    }
  }, [route]);

  const { position, line, stops } = useMemo(() => {
    return {
      position: [route[0].lat, route[0].lng] as [number, number],
      line: route.map((p) => [p.lat, p.lng]) as LatLngExpression[],
      stops: route.filter((p) => p.is_stop),
    };
  }, [route]);

  if (route.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-gold/10 bg-obsidian/5 text-sm text-obsidian/40">
        <CircleDot className="me-2 size-4 text-gold/40" aria-hidden />
        Route map not available for this tour yet.
      </div>
    );
  }

  return (
    <div className="relative z-0 h-96 w-full overflow-hidden rounded-2xl border border-gold/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <MapContainer
        center={position}
        zoom={6}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution={DARK_ATTRIBUTION}
          url={DARK_TILES}
        />
        <Polyline
          positions={line}
          pathOptions={{
            color: "#D4AF37",
            weight: 3,
            opacity: 0.8,
            dashArray: "8 4",
          }}
        />
        {stops.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lng]} icon={GOLD_MARKER}>
            <Popup>{point.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
