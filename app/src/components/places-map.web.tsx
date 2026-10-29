import 'maplibre-gl/dist/maplibre-gl.css';

import maplibregl from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import type { PlaceMarker } from '@/lib/places';

// Centered on Madagascar, zoomed out enough to show the whole island.
const MADAGASCAR_CENTER: [number, number] = [46.87, -18.77];
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export function PlacesMap({ places }: { places: PlaceMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: STYLE_URL,
      center: MADAGASCAR_CENTER,
      zoom: 4.6,
    });
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;
    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = places.map((place) => {
      const popup = new maplibregl.Popup({ offset: 24 }).setText(
        place.region ? `${place.name} · ${place.region}` : place.name,
      );
      return new maplibregl.Marker({ color: '#0F766E' })
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(map);
    });
    return () => markers.forEach((marker) => marker.remove());
  }, [places]);

  return <div ref={containerRef} style={styles.map} />;
}

const styles = {
  map: { flex: 1, minHeight: 320, borderRadius: 16, overflow: 'hidden' },
} satisfies Record<string, React.CSSProperties>;
