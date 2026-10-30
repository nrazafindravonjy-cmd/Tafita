import { loadCoverPhotos } from '@/lib/place-photos';
import { fetchPlaceMarkers, type PlaceMarker } from '@/lib/places';
import { fetchQuestions } from '@/lib/questions';
import { fetchPhotos, fetchPlace, fetchReviews, photoUrl } from '@/lib/reviews';

// Registers the service worker in sw.js, which serves cached content offline.
export function registerOfflineSupport() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  if (location.hostname === 'localhost') return;
  // On a first visit the page loads before the worker takes over, so nothing
  // is cached yet: fetch it all again once the worker is in control.
  if (!navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('controllerchange', warmCache, { once: true });
  }
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

const CACHED_HOSTS = ['tiles.openfreemap.org', 'tiles.maps.eox.at', 'commons.wikimedia.org', 'upload.wikimedia.org'];

async function warmCache() {
  const urls = performance
    .getEntriesByType('resource')
    .map((entry) => new URL(entry.name))
    .filter((url) => url.origin === location.origin || CACHED_HOSTS.includes(url.hostname));
  await Promise.all(
    urls.map((url) =>
      fetch(url.href, url.origin === location.origin ? {} : { mode: 'no-cors' }).catch(() => null),
    ),
  );
  // Data API requests need the session token, so they go through the app's own calls.
  await Promise.all([fetchPlaceMarkers().catch(() => null), loadCoverPhotos()]);
}

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
// Enough to read roads and labels around a place without a huge download.
const ZOOMS = [8, 10, 12, 13];

function tileXY(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const rad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n);
  return { x, y };
}

async function vectorTileTemplate(): Promise<string | null> {
  const style = await (await fetch(STYLE_URL)).json();
  const source = Object.values(style.sources as Record<string, { type: string; url?: string }>).find(
    (s) => s.type === 'vector' && s.url,
  );
  if (!source?.url) return null;
  const tilejson = await (await fetch(source.url)).json();
  return (tilejson.tiles as string[])[0] ?? null;
}

// Fetches everything a list's places need, so the service worker keeps a copy:
// place data, reviews, questions, photos and the map around each place.
export async function prepareOffline(places: PlaceMarker[], onProgress: (done: number, total: number) => void) {
  const covers = await loadCoverPhotos();
  const template = await vectorTileTemplate().catch(() => null);
  const tiles = new Set<string>();
  if (template) {
    for (const place of places) {
      for (const zoom of ZOOMS) {
        const { x, y } = tileXY(place.lat, place.lng, zoom);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            tiles.add(template.replace('{z}', String(zoom)).replace('{x}', String(x + dx)).replace('{y}', String(y + dy)));
          }
        }
      }
    }
  }

  const jobs: (() => Promise<unknown>)[] = [];
  for (const place of places) {
    jobs.push(() => fetchPlace(place.id));
    jobs.push(() => fetchReviews(place.id));
    jobs.push(() => fetchQuestions(place.id));
    jobs.push(async () => {
      const photos = await fetchPhotos(place.id);
      await Promise.all(photos.map((photo) => fetch(photoUrl(photo.storage_key)).catch(() => null)));
    });
    const cover = covers[place.name];
    if (cover) jobs.push(() => fetch(cover.url, { mode: 'no-cors' }));
  }
  for (const tile of tiles) jobs.push(() => fetch(tile));

  let done = 0;
  // A few at a time, to stay gentle on slow connections and on the tile server.
  const queue = [...jobs];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (queue.length) {
        await queue.shift()!().catch(() => null);
        onProgress(++done, jobs.length);
      }
    }),
  );
}
