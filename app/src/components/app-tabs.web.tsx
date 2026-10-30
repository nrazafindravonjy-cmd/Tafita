import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Compass, Map, UserRound, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Pressable, View, StyleSheet } from 'react-native';

import { glassView } from '@/constants/glass';
import { Brand, Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useNavLayout } from '@/hooks/use-nav-layout';

import { ThemedText } from './themed-text';

export default function AppTabs() {
  const { t } = useTranslation();
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon={Map} label={t('tabs.map')} />
          </TabTrigger>
          <TabTrigger name="discover" href="/discover" asChild>
            <TabButton icon={Compass} label={t('tabs.discover')} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon={UserRound} label={t('tabs.profile')} />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: LucideIcon; label: string };

// The trigger ref targets a component type Pressable cannot accept, so it is dropped.
export function TabButton({ icon: Icon, label, isFocused, ref: _ref, ...props }: TabButtonProps) {
  return (
    <Pressable
      {...props}
      accessibilityLabel={label}
      // Shown as a tooltip on hover with a mouse.
      {...({ title: label } as object)}
      style={({ pressed }) => [styles.tabButtonView, isFocused && styles.tabButtonActive, pressed && styles.pressed]}>
      <Icon size={22} strokeWidth={2.2} color={isFocused ? Brand.ink : Colors.dark.textSecondary} aria-hidden />
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
  const layout = useNavLayout();
  return (
    <View {...props} style={[styles.tabListContainer, layout === 'bottom' && styles.tabListBottom]}>
      <View style={[styles.innerContainer, glassView, layout === 'bottom' && styles.innerBottom]}>
        <View style={[styles.brand, layout === 'bottom' && styles.brandHidden]}>
          <TafitaLogo />
          <ThemedText type="smallBold" style={styles.brandText}>
            Tafita
          </ThemedText>
        </View>

        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 30,
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
  tabListBottom: {
    top: 'auto' as unknown as number,
    bottom: 0,
    paddingBottom: 'max(12px, env(safe-area-inset-bottom))' as unknown as number,
  },
  // On phones the bar is only the three tabs, spread across the width.
  brandHidden: { display: 'none' },
  innerBottom: { justifyContent: 'space-around', paddingHorizontal: Spacing.three },
  pressed: {
    opacity: 0.7,
  },
  // At least 44 px tall, the recommended touch target.
  tabButtonView: {
    paddingVertical: Spacing.two + Spacing.half,
    paddingHorizontal: Spacing.four,
    borderRadius: 999,
    alignItems: 'center',
  },
});
