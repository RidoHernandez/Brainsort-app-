/**
 * App.tsx
 * BrainSort — Punto de entrada de la aplicación
 *
 * Providers (de afuera hacia adentro):
 *   QueryClientProvider  → TanStack Query (cache de API)
 *   AuthProvider         → Estado global de autenticación
 *   AppNavigator         → Navegación + restoreSession
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import { SimulationProvider } from './src/context/SimulationContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SimulationProvider>
            <AppNavigator />
          </SimulationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}