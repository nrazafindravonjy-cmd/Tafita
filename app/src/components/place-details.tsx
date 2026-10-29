import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Field } from '@/components/form';
import { PhotoPicker } from '@/components/photo-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Language } from '@/i18n';
import { compressImage } from '@/lib/compress-image';
import { neon } from '@/lib/neon';
import { fetchProfile } from '@/lib/profiles';
import {
  createReview,
  fetchPhotoKeys,
  fetchPlace,
  fetchReviews,
  photoUrl,
  uploadPhoto,
  type PlaceDetails as Place,
  type Review,
} from '@/lib/reviews';

type PlaceDetailsProps = { placeId: string; onClose: () => void };

export function PlaceDetails({ placeId, onClose }: PlaceDetailsProps) {
  const { t, i18n } = useTranslation();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photoKeys, setPhotoKeys] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    Promise.all([fetchPlace(placeId), fetchReviews(placeId), fetchPhotoKeys(placeId)])
      .then(([loadedPlace, loadedReviews, loadedKeys]) => {
        setPlace(loadedPlace);
        setReviews(loadedReviews);
        setPhotoKeys(loadedKeys);
      })
      .catch(() => setFailed(true));
  }, [placeId]);

  useEffect(load, [load]);

  const description = i18n.language === 'en' ? place?.description_en : place?.description_fr;
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;

  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText type="smallBold" style={styles.title}>
            {place?.name ?? ''}
          </ThemedText>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <ThemedText themeColor="textSecondary">{t('place.close')}</ThemedText>
          </Pressable>
        </View>
        {failed && <ThemedText themeColor="textSecondary">{t('common.loadError')}</ThemedText>}
        {!place && !failed && <ActivityIndicator />}
        {place && (
          <>
            {place.region && <ThemedText themeColor="textSecondary">{place.region}</ThemedText>}
            <ThemedText type="small">
              {average === null
                ? t('place.noReviews')
                : t('place.rating', { average: average.toFixed(1), count: reviews.length })}
            </ThemedText>
            {description && <ThemedText type="small">{description}</ThemedText>}
            {photoKeys.length > 0 && (
              <ScrollView horizontal contentContainerStyle={styles.photos}>
                {photoKeys.map((key) => (
                  <Image key={key} source={photoUrl(key)} style={styles.photo} contentFit="cover" />
                ))}
              </ScrollView>
            )}
            <ReviewForm placeId={placeId} onSaved={load} />
            {reviews.map((review) => (
              <View key={review.id} style={styles.review}>
                <ThemedText type="smallBold">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)} · @{review.author?.username ?? '?'}
                </ThemedText>
                {review.body && <ThemedText type="small">{review.body}</ThemedText>}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function ReviewForm({ placeId, onSaved }: { placeId: string; onSaved: () => void }) {
  const { t, i18n } = useTranslation();
  const session = neon.auth.useSession();
  const userId = session.data?.user.id;
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchProfile(userId)
      .then((profile) => setHasProfile(profile !== null))
      .catch(() => setHasProfile(false));
  }, [userId]);

  if (!userId) return <ThemedText themeColor="textSecondary">{t('place.signInToReview')}</ThemedText>;
  if (hasProfile === false) return <ThemedText themeColor="textSecondary">{t('place.usernameFirst')}</ThemedText>;
  if (hasProfile === null) return null;

  async function submit() {
    if (!userId) return;
    if (rating === 0) {
      setMessage(t('place.pickRating'));
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await createReview({ placeId, authorId: userId, rating, body, language: i18n.language as Language });
      for (const photo of photos) await uploadPhoto(placeId, userId, await compressImage(photo));
      setRating(0);
      setBody('');
      setPhotos([]);
      onSaved();
    } catch (error) {
      // The reviews table allows one review per place and person.
      const duplicate = (error as { code?: string }).code === '23505';
      setMessage(duplicate ? t('place.alreadyReviewed') : t('auth.genericError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.form}>
      <ThemedText type="smallBold">{t('place.yourReview')}</ThemedText>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value}`} onPress={() => setRating(value)}>
            <ThemedText type="subtitle">{value <= rating ? '★' : '☆'}</ThemedText>
          </Pressable>
        ))}
      </View>
      <Field placeholder={t('place.comment')} value={body} onChangeText={setBody} multiline maxLength={2000} />
      <PhotoPicker label={t('place.addPhotos', { count: photos.length })} onPick={setPhotos} />
      {message && <ThemedText style={styles.error}>{message}</ThemedText>}
      <Button label={t('place.publish')} onPress={submit} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 16, maxHeight: 420 },
  content: { padding: Spacing.three, gap: Spacing.two },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  title: { flex: 1, fontSize: 18 },
  photos: { gap: Spacing.two },
  photo: { width: 160, height: 120, borderRadius: 12 },
  form: { gap: Spacing.two, marginVertical: Spacing.two },
  stars: { flexDirection: 'row', gap: Spacing.one },
  review: { gap: Spacing.half, paddingTop: Spacing.two },
  error: { color: '#DC2626' },
});
