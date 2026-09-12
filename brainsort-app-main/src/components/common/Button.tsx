/**
 * Button.tsx
 * BrainSort — Componente de botón reutilizable
 *
 * task_breakdown.md T-FE-055
 *
 * Props:
 *   • title: Texto del botón
 *   • onPress: Callback al presionar
 *   • disabled: Deshabilitar botón
 *   • loading: Mostrar spinner (para estados async)
 *   • variant: Tipo de botón (primary | secondary | ghost)
 *   • size: Tamaño (small | medium | large)
 *
 * Se usa en toda la app: navegación, formularios, acciones.
 *
 * Referencia: 02-frontend-app.md §1 components/common/Button.tsx
 *            styles/colors.ts, styles/spacing.ts
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Primary, Neutral, Semantic } from '../../styles/colors';
import { Spacing } from '../../styles/spacing';
import { TextVariants, FontSizes, FontFamilies, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const getVariantStyles = (
  variant: 'primary' | 'secondary' | 'ghost' = 'primary',
  disabled: boolean = false,
): { container: ViewStyle; text: TextStyle } => {
  const baseContainer: ViewStyle = {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  };

  const baseText: TextStyle = {
    ...TextVariants.labelMd,
    fontWeight: '600',
  };

  switch (variant) {
    case 'primary':
      return {
        container: {
          ...baseContainer,
          backgroundColor: disabled ? Neutral[400] : Primary[500],
        },
        text: {
          ...baseText,
          color: Neutral[0],
        },
      };

    case 'secondary':
      return {
        container: {
          ...baseContainer,
          backgroundColor: disabled ? Neutral[200] : Neutral[100],
          borderWidth: 1,
          borderColor: disabled ? Neutral[300] : Neutral[400],
        },
        text: {
          ...baseText,
          color: disabled ? Neutral[400] : Neutral[700],
        },
      };

    case 'ghost':
      return {
        container: {
          ...baseContainer,
          backgroundColor: 'transparent',
        },
        text: {
          ...baseText,
          color: disabled ? Neutral[400] : Primary[500],
        },
      };

    default:
      return {
        container: baseContainer,
        text: baseText,
      };
  }
};

const getSizeStyles = (
  size: 'small' | 'medium' | 'large' = 'medium',
): { container: ViewStyle; text: TextStyle } => {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingVertical: Spacing[2],
          paddingHorizontal: Spacing[3],
          minHeight: 32,
        },
        text: {
          fontSize: 12,
        },
      };

    case 'large':
      return {
        container: {
          paddingVertical: Spacing[6],
          paddingHorizontal: Spacing[8],
          minHeight: 48,
        },
        text: {
          fontSize: 16,
        },
      };

    case 'medium':
    default:
      return {
        container: {
          paddingVertical: Spacing[3],
          paddingHorizontal: Spacing[6],
          minHeight: 40,
        },
        text: {
          fontSize: 14,
        },
      };
  }
};

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Componente de botón reutilizable con soporte para estados (disabled, loading).
 *
 * @example
 * <Button
 *   title="Presione aquí"
 *   onPress={handlePress}
 *   variant="primary"
 *   size="medium"
 * />
 *
 * @example
 * <Button
 *   title="Cargando..."
 *   onPress={handleAsync}
 *   loading={isLoading}
 *   disabled={isLoading}
 * />
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  const variantStyles = getVariantStyles(variant, disabled || loading);
  const sizeStyles = getSizeStyles(size);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={disabled || loading ? 1 : 0.7}
      style={[
        variantStyles.container,
        sizeStyles.container,
        style,
        (disabled || loading) && { opacity: 0.6 },
      ]}
    >
      {loading && (
        <ActivityIndicator
          color={variantStyles.text.color as string}
          size="small"
          style={{ marginRight: Spacing[2] }}
        />
      )}
      <Text style={[variantStyles.text, sizeStyles.text]}>{title}</Text>
    </TouchableOpacity>
  );
};
