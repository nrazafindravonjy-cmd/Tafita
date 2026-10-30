import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ListView } from '@/components/list-view';
import { ThemedText } from '@/components/themed-text';
import { Brand, Colors, Spacing } from '@/constants/theme';
import { badges, fetchStats, levelFor, points, type ContributorStats } from '@/lib/levels';
import { fetchMyLists, type PlaceList } from '@/lib/lists';
import { fetchVisitedIds } from '@/lib/visits';

const TOTAL_PLACES_HINT = 60;

export function ContributorCard({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ContributorStats | null>(null);
  const [visited, setVisited] = useState(0);

  useEffect(() => {
    fetchStats(userId).then(setStats, () => {});
    fetchVisitedIds(userId).then((ids) => setVisited(ids.size), () => {});
  }, [userId]);

  if (!stats) return null;
  const score = points(stats);
  const { current, next } = levelFor(score);
  const progress = next ? (score - current.min) / (next.min - current.min) : 1;

  return (
    <View style={styles.card}>
      <ThemedText type="small" style={styles.eyebrow}>{t('levels.title')}</ThemedText>
      <ThemedText type="subtitle">{t(`levels.${current.id}`)}</ThemedText>
      <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {next ? t('levels.toNext', { points: next.min - score, level: t(`levels.${next.id}`) }) : t('levels.top')}
      </ThemedText>
      <ThemedText type="small">
        {t('levels.summary', { reviews: stats.reviews, photos: stats.photos, places: stats.places, answers: stats.answers })}
      </ThemedText>
      <ThemedText type="small">{t('levels.visited', { count: visited, total: TOTAL_PLACES_HINT })}</ThemedText>
      <View style={styles.badges}>
        {badges(stats, visited).map((badge) => (
          <View key={badge.id} style={[styles.badge, badge.earned && styles.badgeEarned]}>
            <ThemedText type="smallBold" style={badge.earned ? styles.badgeTextEarned : styles.badgeText}>
              {badge.earned ? '★ ' : '☆ '}
              {t(`badges.${badge.id}.name`)}
            </ThemedText>
            <ThemedText type="small" style={badge.earned ? styles.badgeTextEarned : styles.badgeText}>
              {t(`badges.${badge.id}.how`)}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

export function MyLists({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [lists, setLists] = useState<PlaceList[]>([]);
  const [open, setOpen] = useState<PlaceList | null>(null);

  const load = useCallback(() => {
    fetchMyLists(userId).then(setLists, () => {});
  }, [userId]);

  useEffect(load, [load]);

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{t('lists.mine')}</ThemedText>
      {lists.length === 0 && <ThemedText type="small" themeColor="textSecondary">{t('lists.empty')}</ThemedText>}
      {lists.map((list) => (
        <Pressable key={list.id} accessibilityRole="button" onPress={() => setOpen(list)} style={styles.listRow}>
          <ThemedText>{list.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('lists.count', { count: list.place_ids.length })}
            {list.is_shared ? ` · ${t('lists.shared')}` : ''} ›
          </ThemedText>
        </Pressable>
      ))}
      {open && <ListView key={open.id} list={open} editable onClose={() => setOpen(null)} onChanged={load} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.one, padding: Spacing.three, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement, marginTop: Spacing.two },
  eyebrow: { color: Brand.green, textTransform: 'uppercase', letterSpacing: 1 },
  track: { height: 8, borderRadius: 4, backgroundColor: Colors.dark.backgroundSelected, overflow: 'hidden', marginVertical: Spacing.one },
  fill: { height: 8, borderRadius: 4, backgroundColor: Brand.green },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  badge: { width: '47%', flexGrow: 1, gap: 2, padding: Spacing.two, borderRadius: 14, backgroundColor: Colors.dark.backgroundSelected },
  badgeEarned: { backgroundColor: Brand.cream },
  badgeText: { color: Colors.dark.textSecondary },
  badgeTextEarned: { color: Brand.ink },
  section: { gap: Spacing.two, marginTop: Spacing.three },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.three, borderRadius: 16, backgroundColor: Colors.dark.backgroundElement },
});
