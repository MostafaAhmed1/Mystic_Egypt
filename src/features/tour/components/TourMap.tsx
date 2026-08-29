"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import { Icon, type LatLngExpression, type Map as LeafletMap } from "leaflet";
import { CircleDot } from "lucide-react";
import type { TourPointDto } from "@/features/tour/types";

// Leaflet's default marker PNGs break under bundlers, so a self-contained SVG
// data-URI marker is used instead (no external network request, no CDN).
const MARKER_ICON = new Icon({
  iconUrl:
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40">` +
        `<path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z" fill="#d97706"/>` +
        `<circle cx="14" cy="14" r="6" fill="#fff"/></svg>`,
    ),
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -38],
});

export function TourMap({ route }: { route: TourPointDto[] }) {
  const mapRef = useRef<LeafletMap | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (mapRef.current && route.length > 1) {
      const coords: LatLngExpression[] = route.map((p) => [p.lat, p.lng]);
      mapRef.current.fitBounds(coords as [number, number][], { padding: [40, 40] });
    }
  }, [route, ready]);

  const { position, line, stops } = useMemo(() => {
    return {
      position: [route[0].lat, route[0].lng] as [number, number],
      line: route.map((p) => [p.lat, p.lng]) as LatLngExpression[],
      stops: route.filter((p) => p.is_stop),
    };
  }, [route]);

  if (route.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border bg-muted/30 text-sm text-muted-foreground">
        <CircleDot className="mr-2 size-4" aria-hidden />
        Route map not available for this tour yet.
      </div>
    );
  }

  if (!ready) {
    return <div className="h-72 w-full rounded-2xl border bg-muted/30" />;
  }

  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl border">
      <MapContainer
        center={position}
        zoom={5}
        scrollWheelZoom={false}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline positions={line} pathOptions={{ color: "#d97706", weight: 3 }} />
        {stops.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lng]} icon={MARKER_ICON}>
            <Popup>{point.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
