import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Field } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { neon } from '@/lib/neon';

type Mode = 'signIn' | 'signUp';

export function AuthForm() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    // Validated here rather than by disabling the button, because browsers
    // hide autofilled values from the page until the user interacts with it.
    if (!email.trim() || !password || (mode === 'signUp' && !name.trim())) {
      setError(t('auth.missingFields'));
      return;
    }
    setBusy(true);
    setError(null);
    const result =
      mode === 'signUp'
        ? await neon.auth.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await neon.auth.signIn.email({ email: email.trim(), password });
    if (result.error) setError(result.error.message ?? t('auth.genericError'));
    setBusy(false);
  }

  return (
    <View style={styles.form}>
      <ThemedText type="smallBold">{t(`auth.${mode}.title`)}</ThemedText>
      {mode === 'signUp' && (
        <Field placeholder={t('auth.name')} value={name} onChangeText={setName} autoComplete="name" />
      )}
      <Field
        placeholder={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <Field
        placeholder={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
      />
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
      <Button label={t(`auth.${mode}.submit`)} onPress={submit} disabled={busy} />
      <Button
        secondary
        label={t(`auth.${mode}.switch`)}
        onPress={() => {
          setMode(mode === 'signIn' ? 'signUp' : 'signIn');
          setError(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.two, marginTop: Spacing.three },
  error: { color: '#DC2626' },
});
