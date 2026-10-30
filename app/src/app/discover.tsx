import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ListView } from '@/components/list-view';
import { PlaceDetails } from '@/components/place-details';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Brand, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { loadCoverPhotos, previewUrl, type CoverPhoto } from '@/lib/place-photos';
import { fetchList, type PlaceList } from '@/lib/lists';
import { neon } from '@/lib/neon';
import { fetchPlaceMarkers, type PlaceMarker } from '@/lib/places';

const CATEGORIES = ['nature', 'beach', 'culture', 'food', 'hidden-gem'] as const;

export default function DiscoverScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [places, setPlaces] = useState<PlaceMarker[]>([]);
  const [covers, setCovers] = useState<Record<string, CoverPhoto>>({});
  const [category, setCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  // A shared list link (?list=…) opens that list over the feed.
  const { list: linkedList } = useLocalSearchParams<{ list?: string }>();
  const [sharedList, setSharedList] = useState<PlaceList | null>(null);
  const userId = neon.auth.useSession().data?.user.id;

  useEffect(() => {
    if (linkedList) fetchList(linkedList).then(setSharedList, () => {});
  }, [linkedList]);

  useEffect(() => {
    Promise.all([fetchPlaceMarkers(), loadCoverPhotos()])
      .then(([loadedPlaces, loadedCovers]) => {
        setPlaces(loadedPlaces);
        setCovers(loadedCovers);
      })
      .catch(() => setFailed(true));
  }, []);

  const shown = useMemo(
    () => places.filter((place) => !category || place.category_slug === category),
    [places, category],
  );
  // One column on phones, up to three on wide screens.
  const columns = Math.min(3, Math.max(1, Math.floor(Math.min(width, MaxContentWidth + 400) / 340)));

  return (
    <View style={styles.root}>
      <Screen title={t('discover.title')} subtitle={t('discover.subtitle')}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {[null, ...CATEGORIES].map((slug) => {
            const active = slug === category;
            return (
              <Pressable
                key={slug ?? 'all'}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setCategory(slug)}
                style={[styles.chip, active && styles.chipActive]}>
                <ThemedText type="smallBold" style={active ? styles.chipTextActive : undefined}>
                  {slug ? t(`categories.${slug}`) : t('discover.all')}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
        {failed && <ThemedText themeColor="textSecondary">{t('common.loadError')}</ThemedText>}
        <ScrollView contentContainerStyle={styles.grid}>
          {shown.map((place) => {
            const cover = covers[place.name];
            return (
              <Pressable
                key={place.id}
                accessibilityRole="button"
                accessibilityLabel={place.name}
                onPress={() => setSelectedId(place.id)}
                style={[styles.card, { width: `${100 / columns - 2}%` }]}>
                {cover && (
                  <Image
                    source={cover.url}
                    placeholder={{ uri: previewUrl(cover.url) }}
                    placeholderContentFit="cover"
                    transition={250}
                    contentFit="cover"
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <LinearGradient
                  colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.05)', 'rgba(14,22,9,0.92)']}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.pill}>
                  <ThemedText type="smallBold" style={styles.pillText}>
                    {t(`categories.${place.category_slug}`)}
                  </ThemedText>
                </View>
                <View style={styles.caption}>
                  <ThemedText type="subtitle" style={columns > 1 && styles.compactTitle}>
                    {place.name}
                  </ThemedText>
                  {place.region && <ThemedText type="smallBold">{place.region}</ThemedText>}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </Screen>
      {selectedId && <PlaceDetails key={selectedId} placeId={selectedId} onClose={() => setSelectedId(null)} />}
      {sharedList && (
        <ListView
          list={sharedList}
          editable={Boolean(userId) && sharedList.owner_id === userId}
          onClose={() => setSharedList(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  chips: { gap: Spacing.two, paddingVertical: Spacing.two },
  chip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
    backgroundColor: Colors.dark.backgroundElement,
  },
  chipActive: { backgroundColor: Brand.green },
  chipTextActive: { color: Brand.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, paddingBottom: Spacing.six },
  card: {
    aspectRatio: 4 / 5,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.backgroundElement,
    flexGrow: 1,
  },
  pill: {
    alignSelf: 'flex-start',
    margin: Spacing.three,
    backgroundColor: Brand.cream,
    borderRadius: 999,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.half,
  },
  pillText: { color: Brand.ink, fontSize: 12, lineHeight: 16 },
  caption: { padding: Spacing.three, gap: Spacing.half },
  // Narrow columns would otherwise break long names mid-word.
  compactTitle: { fontSize: 24, lineHeight: 27 },
});
