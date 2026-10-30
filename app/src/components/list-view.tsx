import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { PlaceDetails } from '@/components/place-details';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Colors, Spacing } from '@/constants/theme';
import { deleteList, listLink, reorderList, setListShared, type PlaceList } from '@/lib/lists';
import { prepareOffline } from '@/lib/offline';
import { loadCoverPhotos, previewUrl, type CoverPhoto } from '@/lib/place-photos';
import { fetchPlaceMarkers, type PlaceMarker } from '@/lib/places';
import { formatDuration, routeLegs, type Leg } from '@/lib/routing';

type ListViewProps = { list: PlaceList; editable: boolean; onClose: () => void; onChanged?: () => void };

export function ListView({ list, editable, onClose, onChanged }: ListViewProps) {
  const { t } = useTranslation();
  const [all, setAll] = useState<PlaceMarker[]>([]);
  const [covers, setCovers] = useState<Record<string, CoverPhoto>>({});
  const [order, setOrder] = useState(list.place_ids);
  const [shared, setShared] = useState(list.is_shared);
  const [legs, setLegs] = useState<Leg[] | null | 'loading' | 'error'>('loading');
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [offline, setOffline] = useState<{ done: number; total: number } | 'ready' | null>(null);

  useEffect(() => {
    fetchPlaceMarkers().then(setAll, () => {});
    loadCoverPhotos().then(setCovers);
  }, []);

  const places = useMemo(
    () => order.map((id) => all.find((place) => place.id === id)).filter((p): p is PlaceMarker => Boolean(p)),
    [order, all],
  );

  useEffect(() => {
    if (places.length < 2) return setLegs(null);
    setLegs('loading');
    routeLegs(places).then(setLegs, () => setLegs('error'));
  }, [places]);

  async function move(index: number, by: -1 | 1) {
    const next = [...order];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    setOrder(next);
    await reorderList(list.id, next).catch(() => setNote(t('auth.genericError')));
    onChanged?.();
  }

  async function toggleShare() {
    await setListShared(list.id, !shared).then(
      () => setShared(!shared),
      () => setNote(t('auth.genericError')),
    );
    onChanged?.();
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(listLink(list.id));
      setNote(t('actions.copied'));
    } catch {
      setNote(listLink(list.id));
    }
  }

  const totals =
    Array.isArray(legs) && legs.reduce((sum, leg) => ({ meters: sum.meters + leg.meters, seconds: sum.seconds + leg.seconds }), { meters: 0, seconds: 0 });

  return (
    // A modal covers the whole screen wherever the list is opened from.
    <Modal visible animationType="slide" onRequestClose={onClose}>
    <ThemedView style={styles.overlay}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.back}>
          <ThemedText type="smallBold" style={styles.backText}>← {t('legal.back')}</ThemedText>
        </Pressable>
        <ThemedText type="subtitle">{list.name}</ThemedText>
        <ThemedText themeColor="textSecondary">{t('lists.count', { count: places.length })}</ThemedText>

        {editable && Platform.OS === 'web' && (
          <View style={styles.row}>
            <Chip active={shared} label={shared ? t('lists.shared') : t('lists.share')} onPress={toggleShare} />
            {shared && <Chip label={t('lists.copyLink')} onPress={copyLink} />}
          </View>
        )}
        {note && <ThemedText type="small" themeColor="textSecondary">{note}</ThemedText>}

        {Platform.OS === 'web' && places.length > 0 && (
          <View style={styles.row}>
            <Chip
              active={offline === 'ready'}
              label={
                offline === 'ready'
                  ? t('offline.ready')
                  : offline
                    ? t('offline.progress', { percent: Math.round((offline.done / offline.total) * 100) })
                    : t('offline.prepare')
              }
              onPress={() =>
                offline === null &&
                prepareOffline(places, (done, total) => setOffline({ done, total })).then(
                  () => setOffline('ready'),
                  () => setOffline(null),
                )
              }
            />
          </View>
        )}
        {places.length === 0 && <ThemedText themeColor="textSecondary">{t('lists.emptyList')}</ThemedText>}
        {places.map((place, index) => {
          const cover = covers[place.name];
          const leg = Array.isArray(legs) ? legs[index] : undefined;
          return (
            <View key={place.id} style={styles.stop}>
              <Pressable accessibilityRole="button" onPress={() => setOpenId(place.id)} style={styles.card}>
                {cover ? (
                  <Image source={cover.url} placeholder={{ uri: previewUrl(cover.url) }} placeholderContentFit="cover" contentFit="cover" style={styles.thumb} />
                ) : (
                  <View style={[styles.thumb, styles.noThumb]} />
                )}
                <View style={styles.cardText}>
                  <ThemedText type="smallBold">{index + 1}. {place.name}</ThemedText>
                  {place.region && <ThemedText type="small" themeColor="textSecondary">{place.region}</ThemedText>}
                </View>
                {editable && (
                  <View style={styles.moves}>
                    {index > 0 && <Move label="↑" name={t('lists.moveUp')} onPress={() => move(index, -1)} />}
                    {index < places.length - 1 && <Move label="↓" name={t('lists.moveDown')} onPress={() => move(index, 1)} />}
                  </View>
                )}
              </Pressable>
              {leg && (
                <ThemedText type="small" themeColor="textSecondary" style={styles.leg}>
                  ↓ {Math.round(leg.meters / 1000)} km · {formatDuration(leg.seconds)}
                </ThemedText>
              )}
            </View>
          );
        })}

        {places.length >= 2 && (
          <View style={styles.summary}>
            <ThemedText type="smallBold">{t('itinerary.title')}</ThemedText>
            {legs === 'loading' && <ThemedText type="small" themeColor="textSecondary">{t('itinerary.loading')}</ThemedText>}
            {legs === 'error' && <ThemedText type="small" themeColor="textSecondary">{t('itinerary.error')}</ThemedText>}
            {legs === null && <ThemedText type="small" themeColor="textSecondary">{t('itinerary.noRoute')}</ThemedText>}
            {totals && (
              <ThemedText>
                {t('itinerary.total', { km: Math.round(totals.meters / 1000), time: formatDuration(totals.seconds) })}
              </ThemedText>
            )}
            <ThemedText type="small" themeColor="textSecondary">{t('itinerary.caveat')}</ThemedText>
          </View>
        )}

        {editable && (
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              await deleteList(list.id).catch(() => {});
              onChanged?.();
              onClose();
            }}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.underline}>{t('lists.delete')}</ThemedText>
          </Pressable>
        )}
      </ScrollView>
      {openId && <PlaceDetails key={openId} placeId={openId} onClose={() => setOpenId(null)} />}
    </ThemedView>
    </Modal>
  );
}

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <ThemedText type="smallBold" style={active ? styles.chipTextActive : undefined}>{label}</ThemedText>
    </Pressable>
  );
}

function Move({ label, name, onPress }: { label: string; name: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={name} onPress={onPress} style={styles.move}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  content: { padding: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.two, maxWidth: 720, width: '100%', alignSelf: 'center' },
  back: { alignSelf: 'flex-start', backgroundColor: Brand.cream, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  backText: { color: Brand.ink },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, backgroundColor: Colors.dark.backgroundSelected },
  chipActive: { backgroundColor: Brand.green },
  chipTextActive: { color: Brand.ink },
  stop: { gap: Spacing.one },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.two, borderRadius: 18, backgroundColor: Colors.dark.backgroundElement },
  thumb: { width: 64, height: 64, borderRadius: 12 },
  noThumb: { backgroundColor: Colors.dark.backgroundSelected },
  cardText: { flex: 1, gap: 2 },
  moves: { flexDirection: 'row', gap: Spacing.one },
  move: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.backgroundSelected },
  leg: { marginLeft: Spacing.five },
  summary: { gap: Spacing.one, padding: Spacing.three, borderRadius: 18, backgroundColor: Colors.dark.backgroundElement, marginTop: Spacing.two },
  underline: { textDecorationLine: 'underline', marginTop: Spacing.three },
});
