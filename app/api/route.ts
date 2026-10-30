// Driving distance and time between consecutive places, from the public OSRM
// server on OpenStreetMap roads. Malagasy tracks are often slower than OSM
// assumes, so the app presents these as estimates.
const OSRM = 'https://router.project-osrm.org/route/v1/driving';

export async function POST(request: Request) {
  const { points } = (await request.json().catch(() => ({}))) as { points?: unknown };
  const valid =
    Array.isArray(points) &&
    points.length >= 2 &&
    points.length <= 25 &&
    points.every(
      (p) => Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === 'number' && Number.isFinite(n)),
    );
  if (!valid) return Response.json({ error: 'invalid points' }, { status: 400 });

  const coordinates = (points as [number, number][]).map(([lng, lat]) => `${lng},${lat}`).join(';');
  const response = await fetch(`${OSRM}/${coordinates}?overview=false&steps=false`, {
    headers: { 'user-agent': 'Tafita (https://tafita-eight.vercel.app)' },
  });
  if (!response.ok) return Response.json({ error: 'routing unavailable' }, { status: 502 });
  const result = (await response.json()) as {
    code: string;
    routes?: { legs: { distance: number; duration: number }[] }[];
  };
  if (result.code !== 'Ok' || !result.routes?.[0]) return Response.json({ legs: null });
  return Response.json(
    { legs: result.routes[0].legs.map((leg) => ({ meters: leg.distance, seconds: leg.duration })) },
    { headers: { 'cache-control': 'public, s-maxage=86400' } },
  );
}
