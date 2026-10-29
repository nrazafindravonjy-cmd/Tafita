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
const SATELLITE_SOURCE: maplibregl.RasterSourceSpecification = {
  type: 'raster',
  tiles: ['https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg'],
  tileSize: 256,
  maxzoom: 15,
  attribution:
    '<a href="https://s2maps.eu" target="_blank">Sentinel-2 cloudless</a> by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2016)',
};

// Hybrid view: satellite imagery under the plan style's roads, borders and labels.
async function buildSatelliteStyle(): Promise<maplibregl.StyleSpecification> {
  const plan: maplibregl.StyleSpecification = await (await fetch(PLAN_STYLE)).json();
  const overlays = plan.layers.filter(
    (layer) =>
      layer.type === 'symbol' ||
      (layer.type === 'line' && /road|highway|boundary|bridge|tunnel/.test(layer.id)),
  );
  return {
    ...plan,
    sources: { ...plan.sources, satellite: SATELLITE_SOURCE },
    layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }, ...overlays],
  };
}

type BaseLayer = 'plan' | 'satellite';

type PlacesMapProps = { places: PlaceMarker[]; onSelect: (placeId: string) => void };

export function PlacesMap({ places, onSelect }: PlacesMapProps) {
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
    const map = mapRef.current;
    if (!map) return;
    if (baseLayer === 'plan') {
      map.setStyle(PLAN_STYLE);
      return;
    }
    let cancelled = false;
    // Without the labels the imagery is still useful, so fall back to it alone.
    buildSatelliteStyle()
      .catch((): maplibregl.StyleSpecification => ({
        version: 8,
        sources: { satellite: SATELLITE_SOURCE },
        layers: [{ id: 'satellite', type: 'raster', source: 'satellite' }],
      }))
      .then((style) => {
        if (!cancelled) map.setStyle(style);
      });
    return () => {
      cancelled = true;
    };
  }, [baseLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = places.map((place) => {
      const marker = new maplibregl.Marker({ color: '#0F766E' }).setLngLat([place.lng, place.lat]).addTo(map);
      const element = marker.getElement();
      element.style.cursor = 'pointer';
      element.title = place.region ? `${place.name} · ${place.region}` : place.name;
      element.addEventListener('click', () => onSelect(place.id));
      return marker;
    });
    return () => markers.forEach((marker) => marker.remove());
  }, [places, onSelect]);

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
