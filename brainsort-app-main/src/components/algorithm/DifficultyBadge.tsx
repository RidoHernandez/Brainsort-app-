/**
 * DifficultyBadge.tsx
 * BrainSort — Indicador visual de dificultad de algoritmo
 *
 * task_breakdown.md T-FE-063
 *
 * Muestra un chip de color con el nivel de dificultad:
 *   - Facil   → Verde lima (dashboard HU-01)
 *   - Medio   → Cian (#19BFD2)
 *   - Dificil → Rojo (#D0021B)
 *
 * Intencionalmente no usa ThemeContext para poder ser un
 * componente "dumb" puro, sin dependencias de contexto.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Semantic } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Dificultad = 'Facil' | 'Medio' | 'Dificil';

export interface DifficultyBadgeProps {
  dificultad: Dificultad;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

export const DIFFICULTY_CONFIG: Record<
  Dificultad,
  { label: string; color: string; background: string; border: string }
> = {
  Facil: {
    label: 'Fácil',
    color: '#B7FF55',
    background: 'rgba(166, 255, 46, 0.17)',
    border: 'rgba(166, 255, 46, 0.38)',
  },
  Medio: {
    label: 'Medio',
    color: '#19BFD2',
    background: 'rgba(25, 191, 210, 0.16)',
    border: 'rgba(25, 191, 210, 0.38)',
  },
  Dificil: {
    label: 'Difícil',
    color: Semantic.error,
    background: 'rgba(208, 2, 27, 0.16)',
    border: 'rgba(208, 2, 27, 0.38)',
  },
};

/** Normaliza valores de API o legacy al enum de dificultad. */
export function normalizeDificultad(value?: string): Dificultad {
  if (!value) return 'Facil';
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (normalized.includes('dific')) return 'Dificil';
  if (normalized.includes('medi')) return 'Medio';
  return 'Facil';
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderWidth: 1,
    maxWidth: 152,
  },
  label: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Chip de nivel de dificultad con color semántico.
 *
 * @example
 * <DifficultyBadge dificultad="Facil" />
 * <DifficultyBadge dificultad="Dificil" />
 */
export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  dificultad,
}) => {
  const config = DIFFICULTY_CONFIG[dificultad];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.background,
          borderColor: config.border,
        },
      ]}
      accessibilityLabel={`Dificultad: ${config.label}`}
      accessibilityRole="text"
    >
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};
