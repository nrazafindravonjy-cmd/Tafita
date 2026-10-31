import 'maplibre-gl/dist/maplibre-gl.css';

import type { FeatureCollection, Point } from 'geojson';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MapSearch, type SearchPick } from '@/components/map-search.web';
import { lightGlassCss } from '@/constants/glass';
import i18n from '@/i18n';
import type { Cyclone } from '@/lib/cyclones';
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

const SOURCE = 'tafita-places';
const CLUSTERS_LAYER = 'tafita-clusters';
const COUNT_LAYER = 'tafita-cluster-count';
const POINTS_LAYER = 'tafita-points';
const SELECTED_LAYER = 'tafita-selected';

// Places as a clustered GeoJSON source, so nearby places merge into a numbered
// bubble when zoomed out instead of stacking markers on top of each other.
function addPlaceLayers(map: maplibregl.Map, { places, selectedId }: { places: PlaceMarker[]; selectedId: string | null }) {
  const data: FeatureCollection = {
    type: 'FeatureCollection',
    features: places.map((place) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [place.lng, place.lat] },
      properties: { id: place.id, name: place.name },
    })),
  };
  const source = map.getSource(SOURCE) as maplibregl.GeoJSONSource | undefined;
  if (source) source.setData(data);
  else map.addSource(SOURCE, { type: 'geojson', data, cluster: true, clusterRadius: 44, clusterMaxZoom: 11 });

  if (!map.getLayer(CLUSTERS_LAYER)) {
    map.addLayer({
      id: CLUSTERS_LAYER,
      type: 'circle',
      source: SOURCE,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#60D42D',
        'circle-radius': ['step', ['get', 'point_count'], 16, 5, 20, 15, 26],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#FFE7BE',
      },
    });
    // Counts need the style's fonts; the bare satellite fallback has none.
    if (map.getStyle().glyphs) {
      map.addLayer({
        id: COUNT_LAYER,
        type: 'symbol',
        source: SOURCE,
        filter: ['has', 'point_count'],
        layout: { 'text-field': '{point_count_abbreviated}', 'text-font': ['Noto Sans Bold'], 'text-size': 14 },
        paint: { 'text-color': '#1E3A12' },
      });
    }
    map.addLayer({
      id: POINTS_LAYER,
      type: 'circle',
      source: SOURCE,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#60D42D',
        'circle-radius': 9,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#FFE7BE',
      },
    });
    map.addLayer({
      id: SELECTED_LAYER,
      type: 'circle',
      source: SOURCE,
      filter: ['==', ['get', 'id'], ''],
      paint: {
        'circle-color': '#FFE7BE',
        'circle-radius': 13,
        'circle-stroke-width': 4,
        'circle-stroke-color': '#60D42D',
      },
    });
  }
  map.setFilter(SELECTED_LAYER, ['all', ['!', ['has', 'point_count']], ['==', ['get', 'id'], selectedId ?? '']]);
}

// Named map features (towns, beaches, shops...) from the OpenMapTiles labels.
function labelsAt(map: maplibregl.Map, point: maplibregl.PointLike) {
  // The style is missing until it loads, and while switching base layers.
  const layers = (map.getStyle()?.layers ?? [])
    .filter((layer) => layer.type === 'symbol')
    .map((layer) => layer.id);
  if (!layers.length) return [];
  return map
    .queryRenderedFeatures(point, { layers })
    .filter((feature) => typeof feature.properties.name === 'string');
}

function featureLabel(properties: Record<string, unknown>): string {
  const name = properties[`name:${i18n.language}`] ?? properties.name;
  const kind = properties.subclass ?? properties.class;
  return typeof kind === 'string' ? `${name} · ${kind.replaceAll('_', ' ')}` : String(name);
}

type PlacesMapProps = {
  places: PlaceMarker[];
  onSelect: (placeId: string) => void;
  // While set, clicking the map picks a location instead of showing labels.
  onPickLocation?: (location: { lat: number; lng: number }) => void;
  pickedLocation?: { lat: number; lng: number } | null;
  selectedId?: string | null;
  // Space taken by the floating tab bar, so controls stay clear of it.
  insets?: { top: number; bottom: number };
  cyclones?: Cyclone[];
};

export function PlacesMap({
  places,
  onSelect,
  onPickLocation,
  pickedLocation,
  selectedId,
  insets = { top: 0, bottom: 0 },
  cyclones = [],
}: PlacesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [baseLayer, setBaseLayer] = useState<BaseLayer>('plan');
  const { t } = useTranslation();
  // The click handler is bound once, so it reads the latest callback here.
  const pickRef = useRef(onPickLocation);
  pickRef.current = onPickLocation;
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  // Read by addPlaceLayers, which runs again after every style change.
  const dataRef = useRef<{ places: PlaceMarker[]; selectedId: string | null }>({ places, selectedId: null });
  dataRef.current = { places, selectedId: selectedId ?? null };

  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current!,
      style: PLAN_STYLE,
      center: MADAGASCAR_CENTER,
      zoom: 4.6,
      attributionControl: false,
    });
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    const popup = new maplibregl.Popup({ closeButton: false, offset: 8 });
    // A style change drops our source and layers, so they are added back each time.
    map.on('styledata', () => {
      if (map.isStyleLoaded()) addPlaceLayers(map, dataRef.current);
    });
    // The compact credits open by default on load; keep them folded to the "i" button.
    map.once('load', () =>
      map.getContainer().querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show'),
    );
    map.on('click', (event) => {
      if (pickRef.current) {
        popup.remove();
        pickRef.current({ lat: event.lngLat.lat, lng: event.lngLat.lng });
        return;
      }
      const [hit] = map.getLayer(POINTS_LAYER)
        ? map.queryRenderedFeatures(event.point, { layers: [CLUSTERS_LAYER, POINTS_LAYER] })
        : [];
      if (hit?.layer.id === CLUSTERS_LAYER) {
        popup.remove();
        const source = map.getSource(SOURCE) as maplibregl.GeoJSONSource;
        source.getClusterExpansionZoom(hit.properties.cluster_id).then((zoom) =>
          map.easeTo({ center: (hit.geometry as Point).coordinates as [number, number], zoom }),
        );
        return;
      }
      if (hit) {
        popup.remove();
        selectRef.current(String(hit.properties.id));
        return;
      }
      const [feature] = labelsAt(map, event.point);
      if (feature) popup.setLngLat(event.lngLat).setText(featureLabel(feature.properties)).addTo(map);
      else popup.remove();
    });
    map.on('mousemove', (event) => {
      if (pickRef.current) {
        map.getCanvas().style.cursor = 'crosshair';
        return;
      }
      const onPlace =
        map.getLayer(POINTS_LAYER) &&
        map.queryRenderedFeatures(event.point, { layers: [CLUSTERS_LAYER, POINTS_LAYER] }).length > 0;
      map.getCanvas().style.cursor = onPlace || labelsAt(map, event.point).length ? 'pointer' : '';
    });
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
    // Places can arrive before the style finishes loading; add them once it has.
    if (map.isStyleLoaded()) addPlaceLayers(map, dataRef.current);
    else map.once('idle', () => addPlaceLayers(map, dataRef.current));
  }, [places, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pickedLocation) return;
    const marker = new maplibregl.Marker({ color: '#F59E0B' })
      .setLngLat([pickedLocation.lng, pickedLocation.lat])
      .addTo(map);
    return () => {
      marker.remove();
    };
  }, [pickedLocation]);

  // Current cyclones from GDACS, drawn as warning markers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = cyclones.map((cyclone) => {
      const element = document.createElement('div');
      element.textContent = '🌀';
      element.title = cyclone.name;
      element.style.cssText = 'font-size:34px;line-height:1;filter:drop-shadow(0 0 6px rgba(255,80,40,0.9))';
      return new maplibregl.Marker({ element }).setLngLat([cyclone.lng, cyclone.lat]).addTo(map);
    });
    return () => markers.forEach((marker) => marker.remove());
  }, [cyclones]);

  function goTo(pick: SearchPick) {
    const map = mapRef.current;
    if (!map) return;
    if (pick.kind === 'tafita') {
      map.flyTo({ center: [pick.place.lng, pick.place.lat], zoom: 13 });
      onSelect(pick.place.id);
      return;
    }
    const { bounds, lat, lng, zoom } = pick.result;
    if (bounds) {
      const [south, north, west, east] = bounds;
      map.fitBounds([[west, south], [east, north]], { padding: 40, maxZoom: 16 });
    } else {
      map.flyTo({ center: [lng, lat], zoom: zoom ?? 15 });
    }
  }

  const nextLayer: BaseLayer = baseLayer === 'plan' ? 'satellite' : 'plan';

  return (
    <div style={styles.wrapper} className="tafita-map">
      {/* Lifts the zoom buttons and credits above the bottom tab bar. */}
      <style>{`
        .tafita-map .maplibregl-ctrl-bottom-right { margin-bottom: ${insets.bottom}px; }
        /* Phones zoom with two fingers, and the buttons would sit under the place card. */
        ${insets.bottom > 0 ? '.tafita-map .maplibregl-ctrl-group { display: none; }' : ''}
        .tafita-map .maplibregl-ctrl-group {
          background: ${lightGlassCss.background}; border: ${lightGlassCss.border}; box-shadow: ${lightGlassCss.boxShadow};
          backdrop-filter: ${lightGlassCss.backdropFilter ?? 'none'}; -webkit-backdrop-filter: ${lightGlassCss.backdropFilter ?? 'none'};
          border-radius: 18px; overflow: hidden;
        }
        .tafita-map .maplibregl-ctrl-group button + button { border-top-color: rgba(30, 58, 18, 0.12); }
      `}</style>
      <div ref={containerRef} style={styles.map} />
      <button
        type="button"
        style={{ ...styles.toggle, top: insets.top + 72 }}
        onClick={() => setBaseLayer(nextLayer)}>
        {t(`map.layers.${nextLayer}`)}
      </button>
      <MapSearch places={places} onPick={goTo} top={insets.top + 12} />
    </div>
  );
}

const styles = {
  wrapper: { position: 'relative', flex: 1, display: 'flex', minHeight: 320 },
  map: { flex: 1 },
  toggle: {
    position: 'absolute',
    left: 12,
    padding: '10px 14px',
    borderRadius: 999,
    ...lightGlassCss,
    fontFamily: 'BricolageGrotesque_700Bold, sans-serif',
    cursor: 'pointer',
  },
} satisfies Record<string, React.CSSProperties>;
