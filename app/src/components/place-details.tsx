import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Button, Field } from '@/components/form';
import { PhotoPicker } from '@/components/photo-picker';
import { ReportButton } from '@/components/report-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { NavBarHeight, useNavLayout } from '@/hooks/use-nav-layout';
import { Brand, Colors, Spacing } from '@/constants/theme';
import type { Language } from '@/i18n';
import { compressImage, MIN_SIDE, PhotoTooSmallError } from '@/lib/compress-image';
import { neon } from '@/lib/neon';
import { loadCoverPhotos, previewUrl, type CoverPhoto } from '@/lib/place-photos';
import { fetchProfile } from '@/lib/profiles';
import {
  createReview,
  fetchPhotos,
  fetchPlace,
  fetchReviews,
  photoUrl,
  uploadPhoto,
  type PlaceDetails as Place,
  type PlacePhoto,
  type Review,
} from '@/lib/reviews';

type PlaceDetailsProps = { placeId: string; onClose: () => void };

export function PlaceDetails({ placeId, onClose }: PlaceDetailsProps) {
  const { t, i18n } = useTranslation();
  const { height } = useWindowDimensions();
  const layout = useNavLayout();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [failed, setFailed] = useState(false);
  const [cover, setCover] = useState<CoverPhoto | null>(null);

  useEffect(() => {
    if (!place) return;
    loadCoverPhotos().then((covers) => setCover(covers[place.name] ?? null));
  }, [place]);

  const load = useCallback(() => {
    Promise.all([fetchPlace(placeId), fetchReviews(placeId), fetchPhotos(placeId)])
      .then(([loadedPlace, loadedReviews, loadedPhotos]) => {
        setPlace(loadedPlace);
        setReviews(loadedReviews);
        setPhotos(loadedPhotos);
      })
      .catch(() => setFailed(true));
  }, [placeId]);

  useEffect(load, [load]);

  // Escape closes the page with a keyboard, as it would a dialog.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const description = i18n.language === 'en' ? place?.description_en : place?.description_fr;
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;
  // Members' photos stand in for the hero when the place has no Commons photo.
  const hero = cover
    ? { uri: cover.url, preview: previewUrl(cover.url) }
    : photos[0] && { uri: photoUrl(photos[0].storage_key), preview: photos[0].preview ?? undefined };

  return (
    <ThemedView style={styles.overlay}>
      <ScrollView contentContainerStyle={[styles.scroll, layout === 'bottom' && { paddingBottom: NavBarHeight + Spacing.six }]}>
        <View style={[styles.hero, { height: Math.max(360, height * 0.62) }]}>
          {hero && (
            <Image
              source={hero.uri}
              placeholder={hero.preview ? { uri: hero.preview } : undefined}
              placeholderContentFit="cover"
              transition={250}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
              accessibilityLabel={place?.name}
            />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)', 'rgba(14,22,9,0.2)', Colors.dark.background]}
            locations={[0, 0.28, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.heroTop, layout === 'top' && styles.heroTopWeb]}>
            <Pressable accessibilityRole="button" accessibilityLabel={t('place.close')} onPress={onClose} style={styles.pill}>
              <ThemedText type="smallBold" style={styles.pillText}>
                ← {t('place.back')}
              </ThemedText>
            </Pressable>
            {place?.category_slug && (
              <View style={styles.pill}>
                <ThemedText type="smallBold" style={styles.pillText}>
                  {t(`categories.${place.category_slug}`)}
                </ThemedText>
              </View>
            )}
          </View>
          <View style={styles.heroBottom}>
            {!place && !failed && <ActivityIndicator color={Brand.cream} />}
            <ThemedText type="title">{place?.name ?? ''}</ThemedText>
            {place && (
              <ThemedText type="smallBold">
                {average === null
                  ? [place.region, t('place.noReviews')].filter(Boolean).join(' · ')
                  : `★ ${average.toFixed(1)} · ${t('place.reviewCount', { count: reviews.length })}${
                      place.region ? ` · ${place.region}` : ''
                    }`}
              </ThemedText>
            )}
          </View>
        </View>

        <View style={styles.body}>
          {failed && <ThemedText themeColor="textSecondary">{t('common.loadError')}</ThemedText>}
          {description && <ThemedText style={styles.description}>{description}</ThemedText>}
          {cover && (
            <Pressable accessibilityRole="link" onPress={() => Linking.openURL(cover.page)}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.credit}>
                {t('place.photoCredit', { author: cover.author, license: cover.license })}
              </ThemedText>
            </Pressable>
          )}
          {photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
              {photos.map((photo) => (
                <View key={photo.storage_key} style={styles.photoItem}>
                  <Image
                    source={photoUrl(photo.storage_key)}
                    placeholder={photo.preview ? { uri: photo.preview } : undefined}
                    placeholderContentFit="cover"
                    transition={200}
                    style={styles.photo}
                    contentFit="cover"
                  />
                  <ReportButton target="photo" targetId={photo.id} />
                </View>
              ))}
            </ScrollView>
          )}
          {place && <ReviewForm placeId={placeId} onSaved={load} />}
          {reviews.map((review) => (
            <View key={review.id} style={styles.review}>
              <ThemedText type="smallBold">
                <ThemedText type="smallBold" style={styles.stars}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </ThemedText>{' '}
                @{review.author?.username ?? '?'}
              </ThemedText>
              {review.body && <ThemedText type="small">{review.body}</ThemedText>}
              <ReportButton target="review" targetId={review.id} />
            </View>
          ))}
        </View>
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
      // Process every photo before saving anything, so a too-small one stops the whole review.
      const processed = await Promise.all(photos.map(compressImage));
      await createReview({ placeId, authorId: userId, rating, body, language: i18n.language as Language });
      for (const { blob, preview } of processed) await uploadPhoto(placeId, userId, blob, preview);
      setRating(0);
      setBody('');
      setPhotos([]);
      onSaved();
    } catch (error) {
      // The reviews table allows one review per place and person.
      if (error instanceof PhotoTooSmallError) {
        setMessage(t('place.photoTooSmall', { min: MIN_SIDE }));
        return;
      }
      const duplicate = (error as { code?: string }).code === '23505';
      setMessage(duplicate ? t('place.alreadyReviewed') : t('auth.genericError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.form}>
      <ThemedText type="smallBold">{t('place.yourReview')}</ThemedText>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value}`} onPress={() => setRating(value)}>
            <ThemedText style={styles.starButton}>{value <= rating ? '★' : '☆'}</ThemedText>
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
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 },
  scroll: { paddingBottom: Spacing.six },
  hero: { justifyContent: 'space-between' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.three, paddingTop: Spacing.four },
  // Clears the floating web tab bar.
  heroTopWeb: { paddingTop: Spacing.six + Spacing.five },
  heroBottom: { padding: Spacing.four, gap: Spacing.one },
  pill: { backgroundColor: Brand.cream, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  pillText: { color: Brand.ink },
  body: { paddingHorizontal: Spacing.four, gap: Spacing.three, maxWidth: 720, width: '100%', alignSelf: 'center' },
  description: { fontSize: 17, lineHeight: 26 },
  credit: { fontSize: 11, lineHeight: 14 },
  photos: { gap: Spacing.two },
  photoItem: { gap: Spacing.one, width: 220 },
  photo: { width: 220, height: 160, borderRadius: 16 },
  form: { gap: Spacing.two, padding: Spacing.three, borderRadius: 20, backgroundColor: Colors.dark.backgroundElement },
  stars: { color: Brand.green, letterSpacing: 1 },
  starRow: { flexDirection: 'row', gap: Spacing.one },
  starButton: { fontSize: 32, lineHeight: 38, color: Brand.green },
  review: { gap: Spacing.half, paddingTop: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.dark.backgroundSelected },
  error: { color: Brand.danger },
});
