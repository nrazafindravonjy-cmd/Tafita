import { Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenProps = { title: string; subtitle: string; children?: React.ReactNode };

export function Screen({ title, subtitle, children }: ScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={[styles.content, Platform.OS === 'web' && styles.webOffset]}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>
        {children}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  content: { flex: 1, width: '100%', maxWidth: MaxContentWidth, padding: Spacing.four, gap: Spacing.two },
  // Leaves room for the floating web tab bar.
  webOffset: { paddingTop: Spacing.six + Spacing.four },
});
