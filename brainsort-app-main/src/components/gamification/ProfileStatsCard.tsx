/**
 * ProfileStatsCard.tsx
 * BrainSort — Card de estadísticas resumidas del perfil
 *
 * Referencia: gamification-xp-progression.spec.md
 *            04-contratos-api.md §6 (campos de GET /api/progreso/me)
 *
 * Muestra:
 *   - Simulaciones completadas
 *   - Ejercicios correctos / totales
 *   - Posición en el ranking global
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkSurfaces, DarkText, Accent, Semantic } from '../../styles/colors';
import { FontWeights, TextVariants } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProfileStatsCardProps {
  simulacionesCompletadas: number;
  ejerciciosCorrectos: number;
  ejerciciosTotales: number;
  posicionRanking: number;
  puntosTotales: number;
}

// ─── Sub-componente: StatItem ──────────────────────────────────────────────────

interface StatItemProps {
  icono: string;
  valor: string;
  etiqueta: string;
  color?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icono, valor, etiqueta, color }) => (
  <View style={statStyles.item}>
    <Text style={statStyles.icon}>{icono}</Text>
    <Text style={[statStyles.value, color ? { color } : undefined]}>{valor}</Text>
    <Text style={statStyles.label}>{etiqueta}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  icon: {
    fontSize: 24,
    marginBottom: Spacing[1],
  },
  value: {
    ...TextVariants.h3,
    color: Accent[500],
    fontWeight: FontWeights.bold,
  },
  label: {
    ...TextVariants.labelSm,
    color: DarkText.muted,
    textAlign: 'center',
    marginTop: Spacing[1],
  },
});

// ─── Componente Principal ─────────────────────────────────────────────────────

/**
 * Card de estadísticas del perfil del usuario.
 *
 * @example
 * <ProfileStatsCard
 *   simulacionesCompletadas={progreso.simulacionesCompletadas}
 *   ejerciciosCorrectos={progreso.ejerciciosCorrectos}
 *   ejerciciosTotales={progreso.ejerciciosTotales}
 *   posicionRanking={progreso.posicionRanking}
 *   puntosTotales={progreso.puntosTotales}
 * />
 */
export const ProfileStatsCard: React.FC<ProfileStatsCardProps> = ({
  simulacionesCompletadas,
  ejerciciosCorrectos,
  ejerciciosTotales,
  posicionRanking,
  puntosTotales,
}) => {
  const precisionEjercicios =
    ejerciciosTotales > 0
      ? Math.round((ejerciciosCorrectos / ejerciciosTotales) * 100)
      : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Estadísticas</Text>
      <View style={styles.divider} />

      {/* Fila 1: Simulaciones y Precisión */}
      <View style={styles.row}>
        <StatItem
          icono="▶️"
          valor={String(simulacionesCompletadas)}
          etiqueta="Simulaciones"
          color={Accent[500]}
        />
        <View style={styles.separator} />
        <StatItem
          icono="🎯"
          valor={`${precisionEjercicios}%`}
          etiqueta="Precisión"
          color={precisionEjercicios >= 70 ? Semantic.success : Semantic.warning}
        />
        <View style={styles.separator} />
        <StatItem
          icono="🏆"
          valor={posicionRanking > 0 ? `#${posicionRanking}` : '—'}
          etiqueta="Ranking"
          color={posicionRanking <= 3 ? Semantic.warning : Accent[500]}
        />
      </View>

      {/* Fila 2: Ejercicios detallados */}
      <View style={styles.exerciseRow}>
        <Text style={styles.exerciseText}>
          <Text style={styles.exerciseHighlight}>{ejerciciosCorrectos}</Text>
          <Text style={styles.exerciseMuted}> / {ejerciciosTotales} ejercicios correctos</Text>
        </Text>
        <Text style={styles.exerciseMuted}>
          {puntosTotales.toLocaleString('es-MX')} XP totales
        </Text>
      </View>
    </View>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[5],
    marginBottom: Spacing[4],
  },
  title: {
    ...TextVariants.h4,
    color: DarkText.secondary,
    marginBottom: Spacing[3],
  },
  divider: {
    height: 1,
    backgroundColor: DarkSurfaces.border,
    marginBottom: Spacing[3],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 48,
    backgroundColor: DarkSurfaces.border,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    borderTopColor: DarkSurfaces.border,
  },
  exerciseText: {
    flex: 1,
  },
  exerciseHighlight: {
    ...TextVariants.bodyMd,
    color: Accent[500],
    fontWeight: FontWeights.bold,
  },
  exerciseMuted: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
  },
});
