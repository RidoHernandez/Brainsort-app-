/**
 * ProfileStackNavigator.tsx
 * BrainSort — Stack Navigator del módulo de Perfil
 *
 * Pantallas:
 *   Profile  → ProfileScreen  (pantalla principal del perfil)
 *   Settings → SettingsScreen (configuración de la app)
 *
 * Referencia: 02-frontend-app.md §3.1 «Tab: Perfil»
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

// ─── Navegador ────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
