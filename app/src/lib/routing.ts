export type Leg = { meters: number; seconds: number };

export async function routeLegs(points: { lat: number; lng: number }[]): Promise<Leg[] | null> {
  const response = await fetch('/api/route', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ points: points.map((p) => [p.lng, p.lat]) }),
  });
  if (!response.ok) throw new Error(`route: ${response.status}`);
  return ((await response.json()) as { legs: Leg[] | null }).legs;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${minutes} min`;
}
