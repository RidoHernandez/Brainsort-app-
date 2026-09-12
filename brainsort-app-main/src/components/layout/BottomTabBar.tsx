/**
 * BottomTabBar.tsx
 * BrainSort — Barra de tabs inferior
 *
 * task_breakdown.md T-FE-082
 *
 * Props:
 *   • state: Estado actual de navegación
 *   • descriptors: Descriptores de navegación de React Navigation
 *   • navigation: Objeto de navegación
 *
 * Tabs: Biblioteca | Progreso | Offline | Perfil
 *
 * Referencia: 02-frontend-app.md §1 components/layout/BottomTabBar.tsx
 *            styles/colors.ts, styles/typography.ts
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, DarkText, DarkSurfaces, Accent } from '../../styles/colors';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface TabItem {
  key: string;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { key: 'Library', label: 'Biblioteca', icon: '📚' },
  { key: 'Progress', label: 'Progreso', icon: '📊' },
  { key: 'Offline', label: 'Offline', icon: '📴' },
  { key: 'Profile', label: 'Perfil', icon: '👤' },
];

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Componente de barra de tabs inferior con iconos y labels.
 *
 * @example
 * <BottomTabBar
 *   state={state}
 *   descriptors={descriptors}
 *   navigation={navigation}
 * />
 */
export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel as string
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const tabInfo = TABS.find((tab) => tab.key === route.name) || TABS[0];

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={tabInfo.label}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={[styles.tabContent, isFocused && styles.tabFocused]}>
              <Text style={[styles.icon, isFocused && styles.iconFocused]}>
                {tabInfo.icon}
              </Text>
              <Text style={[styles.label, isFocused && styles.labelFocused]}>
                {tabInfo.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: DarkSurfaces.surface,
    borderTopWidth: 1,
    borderTopColor: DarkSurfaces.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabFocused: {
    // Focus visual indicator
    ...(Platform.OS === 'web' && {
      borderRadius: 8,
    }),
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  iconFocused: {
    // Web focused icon
    ...(Platform.OS === 'web' && {
      opacity: 1,
    }),
  },
  label: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
    color: DarkText.muted,
  },
  labelFocused: {
    color: Accent[500],
    fontWeight: FontWeights.semiBold,
  },
});
