import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { legalDocument, Publisher, type LegalDocumentId } from '@/constants/legal';
import { Brand, Spacing } from '@/constants/theme';

type LegalDocumentViewProps = { id: LegalDocumentId; onClose: () => void };

export function LegalDocumentView({ id, onClose }: LegalDocumentViewProps) {
  const { t, i18n } = useTranslation();
  const document = legalDocument(id, i18n.language);

  return (
    <ThemedView style={styles.overlay}>
      <ScrollView contentContainerStyle={[styles.content, Platform.OS === 'web' && styles.webOffset]}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.back}>
          <ThemedText type="smallBold" style={styles.backText}>
            ← {t('legal.back')}
          </ThemedText>
        </Pressable>
        <ThemedText type="subtitle">{document.title}</ThemedText>
        {document.sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <ThemedText type="smallBold">{section.title}</ThemedText>
            <ThemedText>{section.body}</ThemedText>
          </View>
        ))}
        <ThemedText type="small" themeColor="textSecondary">
          {t('legal.updated', { date: Publisher.updatedOn })}
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 },
  content: { padding: Spacing.four, gap: Spacing.three, maxWidth: 720, width: '100%', alignSelf: 'center' },
  // Clears the floating web tab bar.
  webOffset: { paddingTop: Spacing.six + Spacing.five },
  back: { alignSelf: 'flex-start', backgroundColor: Brand.cream, borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one },
  backText: { color: Brand.ink },
  section: { gap: Spacing.one },
});
