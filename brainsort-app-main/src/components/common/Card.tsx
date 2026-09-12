/**
 * Card.tsx
 * BrainSort — Componente de tarjeta reutilizable
 *
 * task_breakdown.md T-FE-056
 *
 * Props:
 *   • children: Contenido de la tarjeta
 *   • onPress: Callback al presionar (opcional)
 *   • style: Estilos adicionales
 *   • elevation/shadow: Sombra nativa
 *
 * Se usa para mostrar: algoritmos, ejercicios, insignias, módulos offline.
 *
 * Referencia: 02-frontend-app.md §1 components/common/Card.tsx
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  ViewStyle,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Spacing } from '../../styles/spacing';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: number;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 12,
    padding: Spacing[6],
    marginBottom: Spacing[4],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  cardPressable: {
    borderRadius: 12,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Componente de tarjeta reutilizable con soporte para onPress.
 * Se usa para mostrar contenido en grillas o listas.
 *
 * @example
 * <Card>
 *   <Text>Contenido de la tarjeta</Text>
 * </Card>
 *
 * @example
 * <Card onPress={() => navigate('Detail')}>
 *   <AlgorithmCardContent />
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  elevation = 3,
}) => {
  const containerStyle: ViewStyle = {
    ...styles.card,
    ...(Platform.OS === 'android' && { elevation }),
  };

  const content = <View style={containerStyle}>{children}</View>;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.cardPressable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};
