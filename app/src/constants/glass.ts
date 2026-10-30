import type { CSSProperties } from 'react';
import { Platform, type ViewStyle } from 'react-native';

// Frosted glass for elements floating over photos and the map: a dark forest
// tint, a blurred and saturated backdrop, and a light rim like Apple's glass.
// Without backdrop blur, or when the viewer asks for less transparency, it
// falls back to the same tint made opaque.
const BLUR = 'blur(22px) saturate(180%)';

function glassSupported(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const blur = CSS.supports('backdrop-filter', BLUR) || CSS.supports('-webkit-backdrop-filter', BLUR);
  const reduce = window.matchMedia?.('(prefers-reduced-transparency: reduce)').matches;
  return blur && !reduce;
}

const supported = glassSupported();

export const glassCss: CSSProperties = supported
  ? {
      background: 'rgba(14, 22, 9, 0.52)',
      backdropFilter: BLUR,
      WebkitBackdropFilter: BLUR,
      border: '1px solid rgba(255, 246, 230, 0.16)',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 10px 30px rgba(0, 0, 0, 0.28)',
      color: '#FFF6E6',
    }
  : {
      background: 'rgba(26, 39, 18, 0.97)',
      border: '1px solid rgba(255, 246, 230, 0.12)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.28)',
      color: '#FFF6E6',
    };

// The same treatment for React Native views; the web renderer passes these through.
export const glassView: ViewStyle = {
  backgroundColor: glassCss.background as string,
  borderWidth: 1,
  borderColor: supported ? 'rgba(255, 246, 230, 0.16)' : 'rgba(255, 246, 230, 0.12)',
  boxShadow: glassCss.boxShadow as string,
  ...(supported ? ({ backdropFilter: BLUR, WebkitBackdropFilter: BLUR } as ViewStyle) : null),
};
