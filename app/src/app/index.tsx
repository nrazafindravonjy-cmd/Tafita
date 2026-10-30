import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlaceDetails } from '@/components/place-details';
import { PlacePreview } from '@/components/place-preview';
import { PlacesMap } from '@/components/places-map';
import { ProposePlace } from '@/components/propose-place';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Colors, Spacing } from '@/constants/theme';
import { NavBarHeight, useNavLayout } from '@/hooks/use-nav-layout';
import { fetchCyclones, type Cyclone } from '@/lib/cyclones';
import { neon } from '@/lib/neon';
import { fetchPlaceMarkers, type PlaceMarker } from '@/lib/places';

type Location = { lat: number; lng: number };

export default function MapScreen() {
  const { t } = useTranslation();
  const safeArea = useSafeAreaInsets();
  const layout = useNavLayout();
  const session = neon.auth.useSession();
  const userId = session.data?.user.id;
  const [places, setPlaces] = useState<PlaceMarker[]>([]);
  const [failed, setFailed] = useState(false);
  // Tapping a place previews it; opening the preview shows the full page.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // A shared place link (?place=…) opens that place's page directly.
  const { place: linkedPlace } = useLocalSearchParams<{ place?: string }>();
  const [openId, setOpenId] = useState<string | null>(linkedPlace ?? null);
  const [proposing, setProposing] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<Location | null>(null);

  const [cyclones, setCyclones] = useState<Cyclone[]>([]);
  useEffect(() => {
    fetchCyclones().then(setCyclones, () => {});
  }, []);

  useEffect(() => {
    fetchPlaceMarkers()
      .then(setPlaces)
      .catch(() => setFailed(true));
  }, []);

  const select = useCallback((placeId: string) => setSelectedId(placeId), []);

  function stopProposing() {
    setProposing(false);
    setPickedLocation(null);
  }

  // The map runs under the floating tab bar, so overlays sit clear of it.
  const insets = {
    top: (layout === 'top' ? 88 : 0) + safeArea.top,
    bottom: (layout === 'bottom' ? NavBarHeight : 0) + safeArea.bottom,
  };
  const selected = places.find((place) => place.id === selectedId);
  // Picking a location needs the web map; the native list cannot place points.
  const canPropose = Boolean(userId) && Platform.OS === 'web';

  return (
    <ThemedView style={styles.root}>
      <PlacesMap
        places={places}
        onSelect={select}
        onPickLocation={proposing ? setPickedLocation : undefined}
        pickedLocation={pickedLocation}
        selectedId={selectedId}
        insets={insets}
        cyclones={cyclones}
      />

      {cyclones.length > 0 && !proposing && (
        <Pressable
          accessibilityRole="link"
          onPress={() => cyclones[0].report && Linking.openURL(cyclones[0].report)}
          style={[styles.banner, styles.alert, { top: insets.top + 120 }]}>
          <ThemedText type="smallBold" style={styles.alertText}>
            🌀 {cyclones.map((c) => t('cyclone.alert', { name: c.name, level: t(`cyclone.levels.${c.level}`, { defaultValue: c.level }) })).join(' · ')}
          </ThemedText>
          <ThemedText type="small" style={styles.alertText}>{t('cyclone.source')}</ThemedText>
        </Pressable>
      )}

      {failed && (
        <View style={[styles.banner, { top: insets.top + 72 }]}>
          <ThemedText type="small">{t('common.loadError')}</ThemedText>
        </View>
      )}

      {proposing && userId ? (
        <>
          <View style={[styles.banner, { top: insets.top + 72 }]}>
            <ThemedText type="smallBold">{t('propose.mapHint')}</ThemedText>
          </View>
          <ScrollView style={[styles.sheet, { bottom: insets.bottom + Spacing.three }]}>
            <ProposePlace userId={userId} location={pickedLocation} onClose={stopProposing} />
          </ScrollView>
        </>
      ) : selected ? (
        <PlacePreview
          key={selected.id}
          place={selected}
          bottom={insets.bottom + Spacing.three}
          onOpen={() => setOpenId(selected.id)}
          onClose={() => setSelectedId(null)}
        />
      ) : (
        canPropose && (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setSelectedId(null);
              setProposing(true);
            }}
            style={[styles.fab, { bottom: insets.bottom + Spacing.three }]}>
            <ThemedText style={styles.fabPlus} aria-hidden>
              +
            </ThemedText>
            <ThemedText type="smallBold" style={styles.fabText}>
              {t('propose.open')}
            </ThemedText>
          </Pressable>
        )
      )}

      {openId && <PlaceDetails key={openId} placeId={openId} onClose={() => setOpenId(null)} />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  banner: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    alignSelf: 'center',
    maxWidth: 460,
    padding: Spacing.three,
    borderRadius: 16,
    backgroundColor: Colors.dark.backgroundElement,
  },
  alert: { backgroundColor: '#FFB38A' },
  alertText: { color: Brand.ink },
  sheet: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    maxHeight: '60%',
    borderRadius: 20,
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 999,
    backgroundColor: Brand.green,
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
  },
  fabPlus: { color: Brand.ink, fontSize: 22, lineHeight: 22, fontFamily: 'BricolageGrotesque_800ExtraBold' },
  fabText: { color: Brand.ink },
});
