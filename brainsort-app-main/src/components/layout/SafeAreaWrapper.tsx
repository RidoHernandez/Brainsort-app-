/**
 * SafeAreaWrapper.tsx
 * BrainSort — Wrapper de zona segura
 *
 * task_breakdown.md T-FE-083
 *
 * Props:
 *   • children: Componentes hijos
 *   • edges: Bordes a aplicar safe area (top | bottom | left | right | ['top', 'bottom'])
 *   • style: Estilos adicionales
 *
 * Envuelve el contenido para evitar áreas no seguras en dispositivos con notch,
 * home indicator, etc. Usa react-native-safe-area-context.
 *
 * Referencia: 02-frontend-app.md §1 components/layout/SafeAreaWrapper.tsx
 *            styles/colors.ts
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DarkSurfaces } from '../../styles/colors';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SafeAreaWrapperProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: ViewStyle;
  disableSafeArea?: boolean;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Wrapper de zona segura que maneja áreas no seguras (notch, home indicator).
 *
 * @example
 * <SafeAreaWrapper edges={['top', 'bottom']}>
 *   <ScreenContent />
 * </SafeAreaWrapper>
 *
 * @example
 * <SafeAreaWrapper disableSafeArea>
 *   <FullScreenContent />
 * </SafeAreaWrapper>
 */
export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  edges = ['top', 'bottom'],
  style,
  disableSafeArea = false,
}) => {
  if (disableSafeArea) {
    return <View style={[styles.container, style]}>{children}</View>;
  }

  return (
    <SafeAreaView edges={edges} style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
  },
});
