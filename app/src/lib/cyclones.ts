export type Cyclone = { name: string; level: string; lat: number; lng: number; report: string | null };

export async function fetchCyclones(): Promise<Cyclone[]> {
  const response = await fetch('/api/cyclones');
  if (!response.ok) return [];
  return ((await response.json()) as { cyclones: Cyclone[] }).cyclones;
}
