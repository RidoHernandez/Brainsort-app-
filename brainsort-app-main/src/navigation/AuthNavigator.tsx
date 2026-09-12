/**
 * AuthNavigator.tsx
 * BrainSort — Stack Navigator del flujo de autenticación
 *
 * task_breakdown.md T-FE-089
 *
 * Rutas:
 *   Welcome  → WelcomeScreen  (pantalla inicial)
 *   Login    → LoginScreen
 *   Register → RegisterScreen
 *
 * Referencia: architecture-auth.spec.md §2
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import { DarkSurfaces, DarkText } from '../styles/colors';
import { FontFamilies, FontSizes, FontWeights } from '../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

// ─── Navegador ────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: DarkSurfaces.background,
        },
        headerTintColor: DarkText.primary,
        headerTitleStyle: {
          fontFamily: FontFamilies.semiBold,
          fontWeight: FontWeights.semiBold,
          fontSize: FontSizes.lg,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: DarkSurfaces.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Iniciar Sesión' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Crear Cuenta' }}
      />
    </Stack.Navigator>
  );
}
