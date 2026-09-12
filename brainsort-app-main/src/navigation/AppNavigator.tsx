/**
 * AppNavigator.tsx
 * BrainSort — Navigator raíz con manejo de sesión
 *
 * task_breakdown.md T-FE-088
 *
 * Responsabilidades:
 *   1. Llama restoreSession() al montar — intenta recuperar sesión guardada
 *   2. Escucha isAuthenticated del AuthContext
 *   3. Muestra AuthNavigator cuando no hay sesión
 *   4. Muestra MainTabNavigator cuando hay sesión activa
 *   5. Muestra SplashLoader mientras carga la sesión
 *
 * Referencia: architecture-auth.spec.md §3.1 «Restore session»
 *             02-frontend-app.md §6 Navegación
 */

import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import DiagnosticTestScreen from '../screens/onboarding/DiagnosticTestScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useAuthContext } from '../context/AuthContext';
import { useApiTokenSync } from '../services/api';
import { DarkSurfaces, DarkText, Accent } from '../styles/colors';
import { FontFamilies, FontSizes } from '../styles/typography';

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  splashLogo: { fontSize: 56 },
  splashText: {
    fontFamily: FontFamilies.semiBold,
    fontSize: FontSizes.lg,
    color: DarkText.muted,
  },
});

// ─── Splash loader ────────────────────────────────────────────────────────────

function SplashLoader() {
  return (
    <View style={styles.splash}>
      <Text style={styles.splashLogo}>⇅</Text>
      <ActivityIndicator color={Accent[500]} size="large" />
      <Text style={styles.splashText}>Cargando BrainSort…</Text>
    </View>
  );
}

// ─── Authenticated Navigator ──────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator();

function AuthenticatedNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="MainTabs" component={MainTabNavigator} />
      <AuthStack.Screen name="DiagnosticTest" component={DiagnosticTestScreen} options={{ presentation: 'fullScreenModal' }} />
    </AuthStack.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

function RootNavigator() {
  const { restoreSession } = useAuth();
  const { isAuthenticated, isLoading, setAuth } = useAuthContext();

  // Sincroniza token del contexto con el cliente HTTP
  useApiTokenSync();

  // Al montar, intentar restaurar sesión desde almacenamiento persistente
  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mientras se restaura la sesión, mostrar splash
  if (isLoading) {
    return <SplashLoader />;
  }

  return (
    <>
      {isAuthenticated ? <AuthenticatedNavigator /> : <AuthNavigator />}
    </>
  );
}

// ─── AppNavigator ─────────────────────────────────────────────────────────────

/**
 * Punto de entrada de navegación. Envuelve todo en NavigationContainer.
 * Los providers (AuthProvider, QueryClientProvider) deben estar en App.tsx
 * por encima de este componente.
 */
export default function AppNavigator() {
  return (
    <NavigationContainer
      documentTitle={{
        formatter: (options, route) => {
          const title = options?.title ?? route?.name;
          return title ? `${title} | BrainSort` : 'BrainSort';
        },
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}