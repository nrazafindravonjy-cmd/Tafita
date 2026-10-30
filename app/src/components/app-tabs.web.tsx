import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { useTranslation } from 'react-i18next';
import { Pressable, View, StyleSheet } from 'react-native';

import { Brand, MaxContentWidth, Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export default function AppTabs() {
  const { t } = useTranslation();
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>{t('tabs.map')}</TabButton>
          </TabTrigger>
          <TabTrigger name="discover" href="/discover" asChild>
            <TabButton>{t('tabs.discover')}</TabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton>{t('tabs.profile')}</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

// The trigger ref targets a component type Pressable cannot accept, so it is dropped.
export function TabButton({ children, isFocused, ref: _ref, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View style={[styles.tabButtonView, isFocused && styles.tabButtonActive]}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={isFocused ? styles.tabTextActive : undefined}>
          {children}
        </ThemedText>
      </View>
    </Pressable>
  );
}

// The logo: a cream curve over the brand green.
function TafitaLogo() {
  return (
    <View style={styles.logo}>
      <View style={styles.logoCurve} />
    </View>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <View style={styles.brand}>
          <TafitaLogo />
          <ThemedText type="smallBold" style={styles.brandText}>
            Tafita
          </ThemedText>
        </View>

        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginRight: 'auto' },
  brandText: { fontSize: 17 },
  logo: { width: 26, height: 26, borderRadius: 7, backgroundColor: Brand.green, overflow: 'hidden' },
  logoCurve: {
    position: 'absolute',
    left: -6,
    top: -4,
    width: 22,
    height: 34,
    borderRadius: 17,
    backgroundColor: Brand.cream,
  },
  tabButtonActive: { backgroundColor: Brand.green },
  tabTextActive: { color: Brand.ink },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
