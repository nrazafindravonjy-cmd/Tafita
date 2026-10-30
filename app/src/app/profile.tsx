import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AuthForm } from '@/components/auth-form';
import { Button, Field } from '@/components/form';
import { LegalDocumentView } from '@/components/legal-document';
import { Screen } from '@/components/screen';
import { ModerationQueue, MySubmissions, ReportsQueue } from '@/components/submissions';
import { ThemedText } from '@/components/themed-text';
import type { LegalDocumentId } from '@/constants/legal';
import { Brand, Spacing } from '@/constants/theme';
import { deleteAccount } from '@/lib/account';
import { SupportedLanguages, type Language } from '@/i18n';
import { neon } from '@/lib/neon';
import { createProfile, fetchProfile, updateLanguage, type Profile } from '@/lib/profiles';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const session = neon.auth.useSession();
  const user = session.data?.user;
  const [legal, setLegal] = useState<LegalDocumentId | null>(null);

  return (
    <View style={styles.root}>
      <Screen title={t('profile.title')} subtitle={t(user ? 'profile.subtitle' : 'auth.subtitle')}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <LanguagePicker userId={user?.id} />
          {session.isPending ? (
            <ActivityIndicator />
          ) : user ? (
            <Account userId={user.id} email={user.email} />
          ) : (
            <AuthForm onOpenLegal={setLegal} />
          )}
          <View style={styles.legalLinks}>
            {(['privacy', 'terms'] as const).map((id) => (
              <Pressable key={id} accessibilityRole="link" onPress={() => setLegal(id)}>
                <ThemedText type="small" themeColor="textSecondary" style={styles.underline}>
                  {t(`legal.${id}`)}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </Screen>
      {legal && <LegalDocumentView id={legal} onClose={() => setLegal(null)} />}
    </View>
  );
}

function DeleteAccount({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [step, setStep] = useState<'idle' | 'confirm' | 'busy' | 'partial' | 'error'>('idle');

  async function confirm() {
    setStep('busy');
    try {
      // On full success the session ends and this screen shows the sign-in form.
      if (!(await deleteAccount(userId))) setStep('partial');
    } catch {
      setStep('error');
    }
  }

  if (step === 'partial') return <ThemedText style={styles.error}>{t('account.partial')}</ThemedText>;

  return (
    <View style={styles.danger}>
      {step === 'idle' ? (
        <Button secondary label={t('account.delete')} onPress={() => setStep('confirm')} />
      ) : (
        <>
          <ThemedText type="smallBold">{t('account.confirmTitle')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{t('account.confirmBody')}</ThemedText>
          <View style={styles.dangerActions}>
            <View style={styles.dangerAction}>
              <Button secondary label={t('account.cancel')} onPress={() => setStep('idle')} disabled={step === 'busy'} />
            </View>
            <View style={styles.dangerAction}>
              <Button label={t('account.confirm')} onPress={confirm} disabled={step === 'busy'} />
            </View>
          </View>
          {step === 'error' && <ThemedText style={styles.error}>{t('auth.genericError')}</ThemedText>}
        </>
      )}
    </View>
  );
}

function Account({ userId, email }: { userId: string; email: string }) {
  const { t, i18n } = useTranslation();
  // undefined while loading, null when the user has not picked a username yet.
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile(userId)
      .then((loaded) => {
        setProfile(loaded);
        if (loaded) i18n.changeLanguage(loaded.preferred_language);
      })
      .catch(() => setError(t('common.loadError')));
  }, [userId, i18n, t]);

  async function saveUsername() {
    setError(null);
    try {
      setProfile(await createProfile(username.trim(), i18n.language as Language));
    } catch {
      setError(t('profile.usernameTaken'));
    }
  }

  if (profile === undefined && !error) return <ActivityIndicator />;

  return (
    <View style={styles.section}>
      {profile ? (
        <ThemedText type="subtitle">@{profile.username}</ThemedText>
      ) : (
        <>
          <ThemedText type="smallBold">{t('profile.chooseUsername')}</ThemedText>
          <Field placeholder={t('profile.username')} value={username} onChangeText={setUsername} autoCapitalize="none" />
          <Button label={t('profile.save')} onPress={saveUsername} disabled={username.trim().length < 3} />
        </>
      )}
      <ThemedText themeColor="textSecondary">{email}</ThemedText>
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      <Button secondary label={t('profile.signOut')} onPress={() => neon.auth.signOut()} />
      {profile && <MySubmissions userId={userId} />}
      {profile && profile.role !== 'member' && <ModerationQueue />}
      {profile && profile.role !== 'member' && <ReportsQueue />}
      <DeleteAccount userId={userId} />
    </View>
  );
}

function LanguagePicker({ userId }: { userId?: string }) {
  const { t, i18n } = useTranslation();

  function choose(language: Language) {
    i18n.changeLanguage(language);
    // A failed save only loses the preference for the next visit.
    if (userId) updateLanguage(userId, language).catch(() => {});
  }

  return (
    <View style={styles.languages}>
      {SupportedLanguages.map((language) => (
        <View key={language} style={styles.language}>
          <Button
            secondary={i18n.language !== language}
            label={t(`profile.languages.${language}`)}
            onPress={() => choose(language)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { gap: Spacing.two, paddingBottom: Spacing.six },
  legalLinks: { flexDirection: 'row', gap: Spacing.three, marginTop: Spacing.four },
  underline: { textDecorationLine: 'underline' },
  danger: { gap: Spacing.two, marginTop: Spacing.four },
  dangerActions: { flexDirection: 'row', gap: Spacing.two },
  dangerAction: { flex: 1 },
  section: { gap: Spacing.two, marginTop: Spacing.three },
  languages: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  language: { flex: 1 },
  error: { color: Brand.danger },
});
