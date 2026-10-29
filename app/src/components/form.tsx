import { Pressable, StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Field(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[styles.field, { color: theme.text, backgroundColor: theme.backgroundElement }]}
    />
  );
}

type ButtonProps = { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean };

export function Button({ label, onPress, disabled, secondary }: ButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: secondary ? theme.backgroundElement : '#0F766E' },
        (pressed || disabled) && styles.dimmed,
      ]}>
      <ThemedText type="smallBold" style={!secondary && styles.primaryLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { borderRadius: 12, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, fontSize: 16 },
  button: { borderRadius: 12, paddingVertical: Spacing.two + Spacing.one, alignItems: 'center' },
  primaryLabel: { color: '#ffffff' },
  dimmed: { opacity: 0.6 },
});
