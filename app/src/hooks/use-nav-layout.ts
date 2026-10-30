import { Platform, useWindowDimensions } from 'react-native';

// Phones get the web tab bar at the bottom, within thumb reach; wider screens keep it on top.
export const NavBarHeight = 72;

export function useNavLayout(): 'top' | 'bottom' | 'native' {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web') return 'native';
  return width < 700 ? 'bottom' : 'top';
}
