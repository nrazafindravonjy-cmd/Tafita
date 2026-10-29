import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { PlaceMarker } from '@/lib/places';

// The native map needs a development build with MapLibre Native; until then
// the mobile app lists the same places.
type PlacesMapProps = { places: PlaceMarker[]; onSelect: (placeId: string) => void };

export function PlacesMap({ places, onSelect }: PlacesMapProps) {
  return (
    <ThemedView style={styles.list}>
      {places.map((place) => (
        <Pressable key={place.id} accessibilityRole="button" onPress={() => onSelect(place.id)}>
          <ThemedText>{place.region ? `${place.name} · ${place.region}` : place.name}</ThemedText>
        </Pressable>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
});
