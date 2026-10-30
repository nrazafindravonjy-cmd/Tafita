import { Pressable, StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Brand, Spacing, Typeface } from '@/constants/theme';
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
        { backgroundColor: secondary ? theme.backgroundSelected : Brand.green },
        (pressed || disabled) && styles.dimmed,
      ]}>
      <ThemedText type="smallBold" style={!secondary && styles.primaryLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
    fontSize: 16,
    fontFamily: Typeface.regular,
  },
  button: { borderRadius: 14, paddingVertical: Spacing.two + Spacing.one, alignItems: 'center' },
  primaryLabel: { color: Brand.ink, fontFamily: Typeface.extrabold },
  dimmed: { opacity: 0.6 },
});
