// Builds public/search-index.json from OpenStreetMap through the free Overpass
// API. It runs before each Vercel build but keeps the committed index, which
// also has area bounds, unless REFRESH_SEARCH_INDEX=1. On failure the build
// goes on and the map search falls back to Nominatim.
//
// Each entry is [name, lat, lng, kind, rank]; lower ranks are more prominent.

import { access, mkdir, writeFile } from 'node:fs/promises';

const OUTPUT = new URL('../public/search-index.json', import.meta.url);
const ENDPOINT = 'https://overpass-api.de/api/interpreter';

// [tag, values] -> rank. Order matters: the first matching tag wins.
const KINDS = [
  ['place', { city: 0, town: 1, island: 2, village: 3, suburb: 3, islet: 4, hamlet: 4, quarter: 4, neighbourhood: 4, locality: 4 }],
  ['boundary', { national_park: 1, protected_area: 2 }],
  ['leisure', { nature_reserve: 2, park: 4 }],
  ['natural', { beach: 3, peak: 3, volcano: 3, bay: 3, cape: 3, cave_entrance: 4 }],
  ['waterway', { waterfall: 3 }],
  ['tourism', { attraction: 3, museum: 3, viewpoint: 3, hotel: 4, guest_house: 4, hostel: 4, camp_site: 4 }],
  ['historic', null],
  ['aeroway', { aerodrome: 3 }],
  ['amenity', { marketplace: 4, restaurant: 5, cafe: 5, bar: 5 }],
];

function selectors() {
  return KINDS.map(([tag, values]) =>
    values ? `nwr["name"]["${tag}"~"^(${Object.keys(values).join('|')})$"](area.mg);` : `nwr["name"]["${tag}"](area.mg);`,
  ).join('\n');
}

export function classify(tags) {
  for (const [tag, values] of KINDS) {
    const value = tags[tag];
    if (value === undefined) continue;
    if (!values) return [tag, 3];
    if (value in values) return [value, values[value]];
  }
  return null;
}

export function toEntries(elements) {
  const groups = new Map();
  for (const element of elements) {
    const name = element.tags?.name;
    const kind = element.tags && classify(element.tags);
    const lat = element.lat ?? element.center?.lat;
    const lng = element.lon ?? element.center?.lon;
    if (!name || !kind || lat === undefined || lng === undefined) continue;
    // The same place is often mapped both as a node and as an area.
    const key = `${name}\u0000${kind[0]}`;
    const twins = groups.get(key) ?? [];
    if (twins.some((twin) => Math.abs(twin[1] - lat) < 0.1 && Math.abs(twin[2] - lng) < 0.1)) continue;
    twins.push([name, Math.round(lat * 1e5) / 1e5, Math.round(lng * 1e5) / 1e5, kind[0], kind[1]]);
    groups.set(key, twins);
  }
  return [...groups.values()].flat().sort((a, b) => a[4] - b[4] || a[0].localeCompare(b[0]));
}

async function main() {
  const exists = await access(OUTPUT).then(() => true, () => false);
  if (exists && process.env.REFRESH_SEARCH_INDEX !== '1') {
    console.log('Search index: keeping the committed file');
    return;
  }
  const query = `[out:json][timeout:180];
area["ISO3166-1"="MG"][admin_level=2]->.mg;
(
${selectors()}
);
out tags center qt;`;
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'user-agent': 'Tafita search index builder' },
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(240_000),
  });
  if (!response.ok) throw new Error(`Overpass responded ${response.status}`);
  const { elements } = await response.json();
  const entries = toEntries(elements);
  await mkdir(new URL('.', OUTPUT), { recursive: true });
  await writeFile(OUTPUT, JSON.stringify(entries));
  console.log(`Search index: ${entries.length} places`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => console.warn(`Search index skipped: ${error.message}`));
}
