/**
 * Header.tsx
 * BrainSort — Cabecera de la aplicación
 *
 * task_breakdown.md T-FE-081
 *
 * Props:
 *   • title: Título de la pantalla
 *   • showBackButton: Mostrar botón de regreso
 *   • onBackPress: Callback al presionar regreso
 *   • rightComponent: Componente opcional a la derecha (ej: avatar, menú)
 *
 * Se usa en todas las pantallas principales para navegación y contexto.
 *
 * Referencia: 02-frontend-app.md §1 components/layout/Header.tsx
 *            styles/colors.ts, styles/typography.ts
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBackToMenu } from '../../hooks/useBackToMenu';
import { DarkText, DarkSurfaces } from '../../styles/colors';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  style?: ViewStyle;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Componente de cabecera reutilizable con botón de regreso opcional.
 *
 * @example
 * <Header
 *   title="Biblioteca"
 *   showBackButton={false}
 * />
 *
 * @example
 * <Header
 *   title="Detalle de Algoritmo"
 *   showBackButton={true}
 *   onBackPress={() => navigation.goBack()}
 * />
 */
export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  style,
}) => {
  const backToMenu = useBackToMenu();
  const handleBackPress = onBackPress ?? backToMenu;

  return (
    <SafeAreaView edges={['top']} style={[styles.container, style]}>
      <View style={styles.content}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Volver al menú"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {rightComponent && <View style={styles.right}>{rightComponent}</View>}
      </View>
    </SafeAreaView>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkSurfaces.surface,
    borderBottomWidth: 1,
    borderBottomColor: DarkSurfaces.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  backButton: {
    marginRight: 8,
    padding: 4,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '600',
    color: DarkText.primary,
  },
  title: {
    flex: 1,
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xl,
    color: DarkText.primary,
    textAlign: 'left',
  },
  right: {
    marginLeft: 8,
  },
});
