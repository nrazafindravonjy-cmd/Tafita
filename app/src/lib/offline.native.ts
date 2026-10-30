import type { PlaceMarker } from '@/lib/places';

// The native app will store regions with MapLibre Native's offline packs.
export function registerOfflineSupport() {}

export async function prepareOffline(_places: PlaceMarker[], _onProgress: (done: number, total: number) => void) {
  throw new Error('Offline preparation is only available on web for now.');
}
