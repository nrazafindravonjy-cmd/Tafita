import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor, Typeface } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typeface.medium,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Typeface.bold,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Typeface.regular,
  },
  title: {
    fontSize: 44,
    lineHeight: 46,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: Typeface.extrabold,
    letterSpacing: -0.3,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: Typeface.semibold,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
