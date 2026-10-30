import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Field } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Brand, Colors, Spacing } from '@/constants/theme';
import { addToList, createList, fetchMyLists, removeFromList, type PlaceList } from '@/lib/lists';
import { neon } from '@/lib/neon';
import { fetchVisitedIds, setVisited } from '@/lib/visits';

type PlaceActionsProps = { placeId: string; placeName: string };

// Save to a list, mark as visited and share, right under the place's photo.
export function PlaceActions({ placeId, placeName }: PlaceActionsProps) {
  const { t } = useTranslation();
  const userId = neon.auth.useSession().data?.user.id;
  const [lists, setLists] = useState<PlaceList[]>([]);
  const [visited, setVisitedState] = useState(false);
  const [picking, setPicking] = useState(false);
  const [newName, setNewName] = useState('');
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!userId) return;
    fetchMyLists(userId).then(setLists, () => {});
    fetchVisitedIds(userId).then((ids) => setVisitedState(ids.has(placeId)), () => {});
  }, [userId, placeId]);

  useEffect(load, [load]);

  const saved = lists.some((list) => list.place_ids.includes(placeId));

  async function toggleVisited() {
    if (!userId) return setNote(t('actions.signIn'));
    setVisitedState(!visited);
    await setVisited(userId, placeId, !visited).catch(() => setVisitedState(visited));
  }

  async function toggleInList(list: PlaceList) {
    const inList = list.place_ids.includes(placeId);
    await (inList ? removeFromList(list.id, placeId) : addToList(list, placeId)).catch(() =>
      setNote(t('auth.genericError')),
    );
    load();
  }

  async function addList() {
    const name = newName.trim() || t('lists.defaultName');
    try {
      await addToList(await createList(name), placeId);
      setNewName('');
      load();
    } catch {
      setNote(t('auth.genericError'));
    }
  }

  async function share() {
    const url = `${window.location.origin}/?place=${placeId}`;
    try {
      if (navigator.share) await navigator.share({ title: placeName, url });
      else {
        await navigator.clipboard.writeText(url);
        setNote(t('actions.copied'));
      }
    } catch {
      // Closing the share sheet is not an error worth reporting.
    }
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Chip
          active={saved}
          label={saved ? t('actions.saved') : t('actions.save')}
          onPress={() => (userId ? setPicking(!picking) : setNote(t('actions.signIn')))}
        />
        <Chip active={visited} label={visited ? t('actions.visited') : t('actions.markVisited')} onPress={toggleVisited} />
        {Platform.OS === 'web' && <Chip label={t('actions.share')} onPress={share} />}
      </View>
      {picking && userId && (
        <View style={styles.picker}>
          {lists.map((list) => (
            <Pressable key={list.id} accessibilityRole="checkbox" accessibilityState={{ checked: list.place_ids.includes(placeId) }} onPress={() => toggleInList(list)} style={styles.listRow}>
              <ThemedText>{list.place_ids.includes(placeId) ? '☑' : '☐'} {list.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t('lists.count', { count: list.place_ids.length })}
              </ThemedText>
            </Pressable>
          ))}
          <View style={styles.newList}>
            <View style={styles.newListField}>
              <Field placeholder={t('lists.newPlaceholder')} value={newName} onChangeText={setNewName} maxLength={60} />
            </View>
            <Chip label={t('lists.create')} onPress={addList} />
          </View>
        </View>
      )}
      {note && <ThemedText type="small" themeColor="textSecondary">{note}</ThemedText>}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <ThemedText type="smallBold" style={active ? styles.chipTextActive : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.two },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.dark.backgroundSelected,
  },
  chipActive: { backgroundColor: Brand.green },
  chipTextActive: { color: Brand.ink },
  picker: { gap: Spacing.one, padding: Spacing.three, borderRadius: 18, backgroundColor: Colors.dark.backgroundElement },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.one },
  newList: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  newListField: { flex: 1 },
});
