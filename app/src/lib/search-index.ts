import type { GeocodeResult } from '@/lib/geocode';

// [name, lat, lng, kind, rank, bounds?], where bounds are [south, north, west, east]
// for areas. Built from OpenStreetMap; see scripts/build-search-index.mjs.
type IndexEntry = [string, number, number, string, number, [number, number, number, number]?];

// Without bounds, the zoom follows how big each rank of place usually is.
const ZOOM_BY_RANK = [11, 12, 11, 14, 15, 17];

export type IndexedPlace = GeocodeResult & { kind: string };

type Searchable = { place: IndexedPlace; rank: number; key: string };

export function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

let loading: Promise<Searchable[]> | null = null;

// Downloaded once, on first use, so the map itself stays fast to open.
export function loadSearchIndex(): Promise<Searchable[]> {
  loading ??= fetch('/search-index.json')
    .then((response) => (response.ok ? (response.json() as Promise<IndexEntry[]>) : []))
    .then((entries) =>
      entries.map(([name, lat, lng, kind, rank, bounds]) => ({
        place: { name, lat, lng, kind, bounds: bounds ?? null, zoom: ZOOM_BY_RANK[rank] },
        rank,
        key: normalize(name),
      })),
    )
    .catch(() => {
      loading = null;
      return [];
    });
  return loading;
}

// Names starting with the query come first, then prominent places.
export function searchIndex(index: Searchable[], query: string, limit = 8): IndexedPlace[] {
  const needle = normalize(query.trim());
  if (needle.length < 2) return [];
  return index
    .filter((item) => item.key.includes(needle))
    .map((item) => ({ item, prefix: item.key.startsWith(needle) || item.key.includes(` ${needle}`) ? 0 : 1 }))
    .sort((a, b) => a.prefix - b.prefix || a.item.rank - b.item.rank || a.item.key.length - b.item.key.length)
    .slice(0, limit)
    .map(({ item }) => item.place);
}
