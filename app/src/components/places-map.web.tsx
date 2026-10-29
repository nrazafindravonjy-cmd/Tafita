import 'maplibre-gl/dist/maplibre-gl.css';

import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PlaceMarker } from '@/lib/places';

// Centered on Madagascar, zoomed out enough to show the whole island.
const MADAGASCAR_CENTER: [number, number] = [46.87, -18.77];
const PLAN_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// Sentinel-2 cloudless 2016 by EOX is CC BY 4.0, so it is free to use with
// attribution. Its 10 m resolution blurs beyond zoom 13.
const SATELLITE_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg'],
      tileSize: 256,
      maxzoom: 15,
      attribution:
        '<a href="https://s2maps.eu" target="_blank">Sentinel-2 cloudless</a> by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016)',
    },
  },
  layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
};

type BaseLayer = 'plan' | 'satellite';

export function PlacesMap({ places }: { places: PlaceMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>('plan');
  const { t } = useTranslation();

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: PLAN_STYLE,
      center: MADAGASCAR_CENTER,
      zoom: 4.6,
    });
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;
    return () => map.remove();
  }, []);

  // Markers are DOM elements, so they survive style changes.
  useEffect(() => {
    mapRef.current?.setStyle(baseLayer === 'plan' ? PLAN_STYLE : SATELLITE_STYLE);
  }, [baseLayer]);

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

  const nextLayer: BaseLayer = baseLayer === 'plan' ? 'satellite' : 'plan';

  return (
    <div style={styles.wrapper}>
      <div ref={containerRef} style={styles.map} />
      <button type="button" style={styles.toggle} onClick={() => setBaseLayer(nextLayer)}>
        {t(`map.layers.${nextLayer}`)}
      </button>
    </div>
  );
}

const styles = {
  wrapper: { position: 'relative', flex: 1, display: 'flex', minHeight: 320 },
  map: { flex: 1, borderRadius: 16, overflow: 'hidden' },
  toggle: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: '6px 12px',
    border: 'none',
    borderRadius: 8,
    background: '#ffffff',
    color: '#000000',
    fontWeight: 600,
    boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  },
} satisfies Record<string, React.CSSProperties>;
