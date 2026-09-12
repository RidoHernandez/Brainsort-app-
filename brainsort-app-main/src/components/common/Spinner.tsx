/**
 * Spinner.tsx
 * BrainSort — Componente de indicador de carga temático
 *
 * task_breakdown.md T-FE-058
 *
 * Props:
 *   • size: Tamaño (small | medium | large)
 *   • color: Color del spinner (defecto: primary)
 *
 * Requisito HU-02: Spinner temático durante carga de pantalla de detalles.
 *
 * Referencia: 02-frontend-app.md §1 components/common/Spinner.tsx
 *            constitution.md §3 Design Principles (Aesthetics First)
 */

import React from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import { Primary } from '../../styles/colors';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  centered?: boolean;
}

// ─── Tamaños ──────────────────────────────────────────────────────────────────

const SIZES = {
  small: 'small' as const,
  medium: 'large' as const,
  large: 'large' as const,
};

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Componente de indicador de carga temático.
 * Se usa en pantallas de carga (HU-02) y durante operaciones async.
 *
 * @example
 * {isLoading && <Spinner size="medium" color={colors.primary} />}
 *
 * @example
 * <Spinner centered size="large" />
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'medium',
  color = Primary[500],
  centered = true,
}) => {
  const activityIndicatorSize = SIZES[size] || SIZES.medium;

  const containerStyle: ViewStyle = centered
    ? {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }
    : {
        justifyContent: 'center',
        alignItems: 'center',
      };

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={activityIndicatorSize} color={color} />
    </View>
  );
};
