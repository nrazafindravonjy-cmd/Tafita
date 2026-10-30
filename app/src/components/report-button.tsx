import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Colors, Spacing } from '@/constants/theme';
import { neon } from '@/lib/neon';
import { REPORT_REASONS, reportContent, type ReportReason, type ReportTarget } from '@/lib/reports';

type ReportButtonProps = { target: ReportTarget; targetId: string };

export function ReportButton({ target, targetId }: ReportButtonProps) {
  const { t } = useTranslation();
  const signedIn = Boolean(neon.auth.useSession().data?.user);
  const [state, setState] = useState<'closed' | 'open' | 'sent' | 'error'>('closed');

  async function send(reason: ReportReason) {
    try {
      await reportContent(target, targetId, reason);
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return <ThemedText type="small" themeColor="textSecondary">{t('report.sent')}</ThemedText>;
  }

  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" onPress={() => setState(state === 'open' ? 'closed' : 'open')}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.link}>
          ⚑ {t('report.action')}
        </ThemedText>
      </Pressable>
      {state === 'open' &&
        (signedIn ? (
          <View style={styles.reasons}>
            {REPORT_REASONS.map((reason) => (
              <Pressable key={reason} accessibilityRole="button" onPress={() => send(reason)} style={styles.reason}>
                <ThemedText type="small">{t(`report.reasons.${reason}`)}</ThemedText>
              </Pressable>
            ))}
          </View>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">{t('report.signIn')}</ThemedText>
        ))}
      {state === 'error' && <ThemedText type="small" style={styles.error}>{t('auth.genericError')}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.one },
  link: { textDecorationLine: 'underline' },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  reason: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.half,
    backgroundColor: Colors.dark.backgroundSelected,
  },
  error: { color: Brand.danger },
});
