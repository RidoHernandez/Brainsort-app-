/**
 * TierBadge.tsx
 * BrainSort — Badge visual del tier de progresión del usuario
 *
 * Referencia: gamification-xp-progression.spec.md §4.1 Tiers de Progresión
 *
 * Muestra:
 *   - Icono del tier (emoji)
 *   - Nombre del tier
 *   - Rango de niveles del tier
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkSurfaces, DarkText, Accent } from '../../styles/colors';
import { FontWeights, FontSizes, TextVariants } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';
import type { TierInfo } from '../../utils/xp.utils';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TierBadgeProps {
  tier: TierInfo;
  /** Tamaño del badge: 'sm' para uso inline, 'md' para tarjetas (default) */
  size?: 'sm' | 'md';
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Badge visual del tier actual del usuario.
 *
 * @example
 * const tier = obtenerTier(progreso.nivelActual);
 * <TierBadge tier={tier} />
 */
export const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md' }) => {
  const isSmall = size === 'sm';

  return (
    <View style={[styles.container, isSmall && styles.containerSm]}>
      <Text style={[styles.icon, isSmall && styles.iconSm]}>
        {tier.icono}
      </Text>
      <View style={styles.info}>
        <Text style={[styles.tierName, isSmall && styles.tierNameSm]}>
          {tier.nombre}
        </Text>
        {!isSmall && (
          <Text style={styles.tierRange}>
            Niveles {tier.rango[0]}–{tier.rango[1]}
          </Text>
        )}
      </View>
    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Accent[700],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    alignSelf: 'flex-start',
  },
  containerSm: {
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  icon: {
    fontSize: 28,
    marginRight: Spacing[2],
  },
  iconSm: {
    fontSize: 18,
    marginRight: Spacing[1],
  },
  info: {
    flexDirection: 'column',
  },
  tierName: {
    ...TextVariants.labelMd,
    color: Accent[500],
    fontWeight: FontWeights.bold,
  },
  tierNameSm: {
    fontSize: FontSizes.sm,
  },
  tierRange: {
    fontSize: FontSizes.xs,
    color: DarkText.muted,
    marginTop: 2,
  },
});
