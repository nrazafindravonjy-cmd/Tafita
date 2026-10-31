import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { lightGlassView, OnLightGlass } from '@/constants/glass';
import { Brand, Colors, Spacing } from '@/constants/theme';
import { loadCoverPhotos, previewUrl, type CoverPhoto } from '@/lib/place-photos';
import type { PlaceMarker } from '@/lib/places';

type PlacePreviewProps = { place: PlaceMarker; onOpen: () => void; onClose: () => void; bottom: number };

// A small card over the map: browse places without leaving it, open one in full.
export function PlacePreview({ place, onOpen, onClose, bottom }: PlacePreviewProps) {
  const { t } = useTranslation();
  const [cover, setCover] = useState<CoverPhoto | null>(null);

  useEffect(() => {
    loadCoverPhotos().then((covers) => setCover(covers[place.name] ?? null));
  }, [place.name]);

  return (
    <View style={[styles.wrap, { bottom }]} pointerEvents="box-none">
      <Pressable accessibilityRole="button" accessibilityLabel={t('preview.open', { name: place.name })} onPress={onOpen} style={styles.card}>
        {cover ? (
          <Image
            source={cover.url}
            placeholder={{ uri: previewUrl(cover.url) }}
            placeholderContentFit="cover"
            transition={200}
            contentFit="cover"
            style={styles.photo}
          />
        ) : (
          <View style={[styles.photo, styles.noPhoto]} />
        )}
        <View style={styles.text}>
          <ThemedText type="smallBold" style={styles.category}>
            {t(`categories.${place.category_slug}`)}
          </ThemedText>
          <ThemedText style={styles.name} numberOfLines={2}>
            {place.name}
          </ThemedText>
          {place.region && (
            <ThemedText type="small" style={styles.region}>
              {place.region}
            </ThemedText>
          )}
        </View>
        <ThemedText style={styles.chevron} aria-hidden>
          ›
        </ThemedText>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={t('place.close')} onPress={onClose} style={styles.close}>
        <ThemedText style={styles.closeText} aria-hidden>
          ✕
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: Spacing.three, right: Spacing.three, alignItems: 'center', zIndex: 10 },
  card: {
    width: '100%',
    maxWidth: 460,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    paddingRight: Spacing.three,
    borderRadius: 26,
    ...lightGlassView,
  },
  photo: { width: 84, height: 84, borderRadius: 16 },
  noPhoto: { backgroundColor: Colors.dark.backgroundSelected },
  text: { flex: 1, gap: 2 },
  category: { color: OnLightGlass.accent, fontSize: 12, lineHeight: 16 },
  region: { color: OnLightGlass.secondary },
  name: { fontSize: 19, lineHeight: 22, fontFamily: 'BricolageGrotesque_800ExtraBold', color: OnLightGlass.text },
  chevron: { fontSize: 30, lineHeight: 32, color: OnLightGlass.text },
  closeText: { fontSize: 13, lineHeight: 16, color: Brand.cream, fontFamily: 'BricolageGrotesque_800ExtraBold' },
  close: {
    position: 'absolute',
    top: -10,
    right: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OnLightGlass.text,
  },
});
