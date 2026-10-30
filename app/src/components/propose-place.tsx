import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Field } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, Spacing } from '@/constants/theme';
import type { Language } from '@/i18n';
import { fetchCategories, proposePlace, type Category } from '@/lib/submissions';

type ProposePlaceProps = {
  userId: string;
  location: { lat: number; lng: number } | null;
  onClose: () => void;
};

export function ProposePlace({ userId, location, onClose }: ProposePlaceProps) {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setMessage(t('common.loadError')));
  }, [t]);

  async function submit() {
    if (!location) {
      setMessage(t('propose.pickLocation'));
      return;
    }
    if (!name.trim() || categoryId === null) {
      setMessage(t('propose.missingFields'));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await proposePlace({
        userId,
        categoryId,
        name,
        region,
        description,
        language: i18n.language as Language,
        ...location,
      });
      setSent(true);
    } catch {
      setMessage(t('auth.genericError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <View style={styles.header}>
        <ThemedText type="smallBold" style={styles.title}>
          {t('propose.title')}
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={onClose}>
          <ThemedText themeColor="textSecondary">{t('place.close')}</ThemedText>
        </Pressable>
      </View>
      {sent ? (
        <ThemedText type="small">{t('propose.sent')}</ThemedText>
      ) : (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {location
              ? t('propose.located', { lat: location.lat.toFixed(5), lng: location.lng.toFixed(5) })
              : t('propose.pickLocation')}
          </ThemedText>
          <Field placeholder={t('propose.name')} value={name} onChangeText={setName} maxLength={120} />
          <View style={styles.categories}>
            {categories.map((category) => (
              <Button
                key={category.id}
                secondary={categoryId !== category.id}
                label={i18n.language === 'en' ? category.name_en : category.name_fr}
                onPress={() => setCategoryId(category.id)}
              />
            ))}
          </View>
          <Field placeholder={t('propose.region')} value={region} onChangeText={setRegion} maxLength={80} />
          <Field
            placeholder={t('propose.description')}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={2000}
          />
          {message && <ThemedText style={styles.error}>{message}</ThemedText>}
          <Button label={t('propose.submit')} onPress={submit} disabled={busy} />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  title: { flex: 1, fontSize: 18 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  error: { color: Brand.danger },
});
