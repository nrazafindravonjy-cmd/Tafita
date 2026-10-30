import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import {
  fetchMySubmissions,
  fetchPendingSubmissions,
  moderatePlace,
  type Submission,
} from '@/lib/submissions';

function osmLink(submission: Submission) {
  return `https://www.openstreetmap.org/?mlat=${submission.lat}&mlon=${submission.lng}#map=16/${submission.lat}/${submission.lng}`;
}

export function MySubmissions({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    // An empty list is a fine fallback for this secondary section.
    fetchMySubmissions(userId).then(setSubmissions, () => {});
  }, [userId]);

  if (!submissions.length) return null;

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{t('submissions.mine')}</ThemedText>
      {submissions.map((submission) => (
        <ThemedText key={submission.id} type="small">
          {submission.name} · {t(`submissions.status.${submission.status}`)}
        </ThemedText>
      ))}
    </View>
  );
}

export function ModerationQueue() {
  const { t, i18n } = useTranslation();
  const [pending, setPending] = useState<Submission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchPendingSubmissions().then(setPending, () => setError(t('common.loadError')));
  }, [t]);

  useEffect(load, [load]);

  async function decide(placeId: string, status: 'published' | 'rejected') {
    setError(null);
    try {
      await moderatePlace(placeId, status);
      load();
    } catch {
      setError(t('auth.genericError'));
    }
  }

  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{t('submissions.moderation', { count: pending?.length ?? 0 })}</ThemedText>
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      {pending?.length === 0 && <ThemedText themeColor="textSecondary">{t('submissions.empty')}</ThemedText>}
      {pending?.map((submission) => {
        const description = (i18n.language === 'en' ? submission.description_en : submission.description_fr) ??
          submission.description_fr ??
          submission.description_en;
        return (
          <View key={submission.id} style={styles.card}>
            <ThemedText type="smallBold">
              {submission.name} · {t(`categories.${submission.category_slug}`, { defaultValue: submission.category_slug })}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {[submission.region, `@${submission.author_username ?? '?'}`].filter(Boolean).join(' · ')}
            </ThemedText>
            {description && <ThemedText type="small">{description}</ThemedText>}
            <Button secondary label={t('submissions.viewMap')} onPress={() => Linking.openURL(osmLink(submission))} />
            <View style={styles.actions}>
              <View style={styles.action}>
                <Button label={t('submissions.publish')} onPress={() => decide(submission.id, 'published')} />
              </View>
              <View style={styles.action}>
                <Button secondary label={t('submissions.reject')} onPress={() => decide(submission.id, 'rejected')} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two, marginTop: Spacing.three },
  card: { gap: Spacing.one, paddingVertical: Spacing.two },
  actions: { flexDirection: 'row', gap: Spacing.two },
  action: { flex: 1 },
  error: { color: '#DC2626' },
});
