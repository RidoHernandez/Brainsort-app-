/**
 * MainTabNavigator.tsx
 * BrainSort — Bottom Tab Navigator principal
 *
 * Tabs:
 *   Biblioteca  → LibraryStackNavigator  (T-FE-090)
 *   Ruta        → LearningPathScreen
 *   Progreso    → ProgressScreen (T-FE-099)
 *   Offline     → placeholder
 *   Perfil      → ProfileStackNavigator
 *
 * Referencia: task_breakdown.md T-FE-090
 */

import React from 'react';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaWrapper } from '../components/layout/SafeAreaWrapper';
import { Header } from '../components/layout/Header';
import Svg, { Circle, Path } from 'react-native-svg';
import LibraryStackNavigator, { LibraryStackParamList } from './LibraryStackNavigator';
import ProfileStackNavigator, { ProfileStackParamList } from './ProfileStackNavigator';
import LearningPathScreen from '../screens/learning-path/LearningPathScreen';
import { ProgressScreen } from '../screens/gamification/ProgressScreen';
import { DarkSurfaces, DarkText, Accent } from '../styles/colors';
import { FontFamilies, FontSizes, FontWeights } from '../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MainTabParamList = {
  Biblioteca: NavigatorScreenParams<LibraryStackParamList> | undefined;
  Ruta: undefined;
  Progreso: undefined;
  Offline: undefined;
  Perfil: NavigatorScreenParams<ProfileStackParamList> | undefined;
};
type TabIconName = 'library' | 'route' | 'progress' | 'offline' | 'profile';

// ─── Placeholder genérico ─────────────────────────────────────────────────────

const PlaceholderScreen = ({ label }: { label: string }) => (
  <SafeAreaWrapper>
    <Header title={label} showBackButton />
    <View style={placeholderSt.container}>
      <Text style={placeholderSt.text}>{label} — Próximamente</Text>
    </View>
  </SafeAreaWrapper>
);

const placeholderSt = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.md,
    color: DarkText.muted,
  },
});

// ─── Tab icons ────────────────────────────────────────────────────────────────

const tabIcon = (name: TabIconName, color: string) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    {name === 'library' && (
      <>
        <Path
          d="M5 5.5C5 4.7 5.7 4 6.5 4H10c1.1 0 2 .9 2 2v13c0-1.1-.9-2-2-2H6.5C5.7 17 5 16.3 5 15.5v-10Z"
          stroke={color}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19 5.5C19 4.7 18.3 4 17.5 4H14c-1.1 0-2 .9-2 2v13c0-1.1.9-2 2-2h3.5c.8 0 1.5-.7 1.5-1.5v-10Z"
          stroke={color}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {name === 'route' && (
      <>
        <Circle cx={6.5} cy={6.5} r={2.1} stroke={color} strokeWidth={1.9} />
        <Circle cx={17.5} cy={17.5} r={2.1} stroke={color} strokeWidth={1.9} />
        <Path
          d="M8.6 6.5h3.8c2.3 0 3.6 1.1 3.6 3 0 2-1.3 3-3.6 3H11c-2.2 0-3.4 1-3.4 3v2"
          stroke={color}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {name === 'progress' && (
      <Path
        d="M4 16 8.5 11.5 12 14.5 19 7.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
    {name === 'offline' && (
      <>
        <Path
          d="M7.3 17.5h9.3a4 4 0 0 0 .3-8 5.6 5.6 0 0 0-10.7 1.7A3.2 3.2 0 0 0 7.3 17.5Z"
          stroke={color}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M12 7.8v8.4M8.8 13l3.2 3.2 3.2-3.2" stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      </>
    )}
    {name === 'profile' && (
      <>
        <Circle cx={12} cy={8.2} r={3.2} stroke={color} strokeWidth={1.9} />
        <Path
          d="M5.8 19.5c.8-3.1 3.1-4.9 6.2-4.9s5.4 1.8 6.2 4.9"
          stroke={color}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </Svg>
);

// ─── Navegador ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B1117',
          borderTopColor: 'rgba(126, 157, 183, 0.22)',
          borderTopWidth: 1,
          height: 64,
          display: isDesktop ? 'none' : 'flex',
        },
        tabBarActiveTintColor: Accent[500],
        tabBarInactiveTintColor: DarkText.muted,
        tabBarLabelStyle: {
          fontFamily: FontFamilies.medium,
          fontWeight: FontWeights.medium,
          fontSize: FontSizes.xs,
          marginBottom: 6,
        },
      }}
    >
      <Tab.Screen
        name="Biblioteca"
        component={LibraryStackNavigator}
        options={{
          tabBarIcon: ({ color }) => tabIcon('library', color),
          tabBarAccessibilityLabel: 'Biblioteca de algoritmos',
        }}
      />
      <Tab.Screen
        name="Ruta"
        component={LearningPathScreen}
        options={{
          tabBarIcon: ({ color }) => tabIcon('route', color),
          tabBarAccessibilityLabel: 'Mi ruta de aprendizaje',
        }}
      />
      <Tab.Screen
        name="Progreso"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ color }) => tabIcon('progress', color),
          tabBarAccessibilityLabel: 'Mi progreso',
        }}
      />
      <Tab.Screen
        name="Offline"
        children={() => <PlaceholderScreen label="Offline" />}
        options={{
          tabBarIcon: ({ color }) => tabIcon('offline', color),
          tabBarAccessibilityLabel: 'Módulos sin conexión',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color }) => tabIcon('profile', color),
          tabBarAccessibilityLabel: 'Mi perfil',
        }}
      />
    </Tab.Navigator>
  );
}

