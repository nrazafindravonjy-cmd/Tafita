import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { PlaceMarker } from '@/lib/places';

// The native map needs a development build with MapLibre Native; until then
// the mobile app lists the same places.
export function PlacesMap({ places }: { places: PlaceMarker[] }) {
  return (
    <ThemedView style={styles.list}>
      {places.map((place) => (
        <ThemedText key={place.id}>
          {place.region ? `${place.name} · ${place.region}` : place.name}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
});
