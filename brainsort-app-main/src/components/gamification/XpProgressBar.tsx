/**
 * XpProgressBar.tsx
 * BrainSort — Barra de progreso de XP hacia el siguiente nivel
 *
 * Referencia: gamification-xp-progression.spec.md §8.1
 *
 * Muestra:
 *   - XP actual / XP necesario para el siguiente nivel
 *   - Barra de progreso animada con gradiente accent
 *   - Porcentaje de progreso
 *   - Mensaje especial si está en nivel máximo
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { DarkSurfaces, DarkText, Accent, Semantic } from '../../styles/colors';
import { FontWeights, FontSizes, TextVariants } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { formatearXP } from '../../utils/xp.utils';
import type { ProgresoNivel } from '../../utils/xp.utils';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface XpProgressBarProps {
  progresoNivel: ProgresoNivel;
  nivelActual: number;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Barra visual de progreso de XP.
 *
 * @example
 * <XpProgressBar
 *   progresoNivel={calcularProgresoNivel(progreso.puntosTotales, progreso.nivelActual)}
 *   nivelActual={progreso.nivelActual}
 * />
 */
export const XpProgressBar: React.FC<XpProgressBarProps> = ({
  progresoNivel,
  nivelActual,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progresoNivel.porcentaje,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, progresoNivel.porcentaje]);

  const barWidth = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Etiquetas nivel actual / siguiente */}
      <View style={styles.labelRow}>
        <Text style={styles.labelNivel}>Nivel {nivelActual}</Text>
        {progresoNivel.esNivelMaximo ? (
          <Text style={styles.labelMax}>¡Nivel máximo! 👑</Text>
        ) : (
          <Text style={styles.labelNivel}>Nivel {nivelActual + 1}</Text>
        )}
      </View>

      {/* Track de la barra */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: barWidth }]} />
      </View>

      {/* XP Info */}
      <View style={styles.xpRow}>
        {progresoNivel.esNivelMaximo ? (
          <Text style={styles.xpLabel}>
            {formatearXP(progresoNivel.xpActual)} XP totales
          </Text>
        ) : (
          <>
            <Text style={styles.xpLabel}>
              {formatearXP(progresoNivel.xpGanado)} / {formatearXP(progresoNivel.xpSiguiente - progresoNivel.xpInicio)} XP
            </Text>
            <Text style={styles.xpFaltante}>
              Faltan {formatearXP(progresoNivel.xpFaltante)} XP
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing[3],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  labelNivel: {
    ...TextVariants.bodySm,
    color: DarkText.secondary,
    fontWeight: FontWeights.semiBold,
  },
  labelMax: {
    ...TextVariants.bodySm,
    color: Semantic.warning,
    fontWeight: FontWeights.semiBold,
  },
  track: {
    height: 10,
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Accent[500],
    borderRadius: BorderRadius.full,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing[1],
  },
  xpLabel: {
    fontSize: FontSizes.xs,
    color: DarkText.muted,
  },
  xpFaltante: {
    fontSize: FontSizes.xs,
    color: DarkText.disabled,
  },
});
