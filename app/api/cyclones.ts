// Current tropical cyclones near Madagascar, from GDACS (the Global Disaster
// Alert and Coordination System of the UN and the European Commission).
const GDACS = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH';

// A generous box around Madagascar and its waters.
const NEAR = { west: 38, east: 60, south: -32, north: -6 };

type Feature = {
  geometry?: { type: string; coordinates: number[] };
  properties?: { name?: string; eventname?: string; alertlevel?: string; iscurrent?: string; url?: { report?: string } };
};

export async function GET() {
  const now = new Date();
  const from = new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10);
  const url = `${GDACS}?eventlist=TC&fromDate=${from}&toDate=${now.toISOString().slice(0, 10)}`;
  const response = await fetch(url, { headers: { accept: 'application/json' } }).catch(() => null);
  if (!response?.ok) return Response.json({ cyclones: [], error: 'gdacs unavailable' }, { status: 200 });

  const data = (await response.json().catch(() => ({}))) as { features?: Feature[] };
  const cyclones = (data.features ?? [])
    .filter((f) => f.properties?.iscurrent === 'true' && f.geometry?.type === 'Point')
    .map((f) => {
      const [lng, lat] = f.geometry!.coordinates;
      return {
        name: f.properties?.eventname || f.properties?.name || 'Cyclone',
        level: (f.properties?.alertlevel ?? 'Green').toLowerCase(),
        lat,
        lng,
        report: f.properties?.url?.report ?? null,
      };
    })
    .filter((c) => c.lng >= NEAR.west && c.lng <= NEAR.east && c.lat >= NEAR.south && c.lat <= NEAR.north);

  return Response.json({ cyclones }, { headers: { 'cache-control': 'public, s-maxage=1800' } });
}
