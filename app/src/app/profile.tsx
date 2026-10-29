import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthForm } from '@/components/auth-form';
import { Button, Field } from '@/components/form';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { SupportedLanguages, type Language } from '@/i18n';
import { neon } from '@/lib/neon';
import { createProfile, fetchProfile, updateLanguage, type Profile } from '@/lib/profiles';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const session = neon.auth.useSession();
  const user = session.data?.user;

  return (
    <Screen title={t('profile.title')} subtitle={t(user ? 'profile.subtitle' : 'auth.subtitle')}>
      <LanguagePicker userId={user?.id} />
      {session.isPending ? <ActivityIndicator /> : user ? <Account userId={user.id} email={user.email} /> : <AuthForm />}
    </Screen>
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
  section: { gap: Spacing.two, marginTop: Spacing.three },
  languages: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  language: { flex: 1 },
  error: { color: '#DC2626' },
});
