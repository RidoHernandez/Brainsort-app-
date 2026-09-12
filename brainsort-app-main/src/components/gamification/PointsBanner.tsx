import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkSurfaces, DarkText, Accent } from '../../styles/colors';
import { FontWeights, FontSizes, TextVariants } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

export interface PointsBannerProps {
  puntos: number;
  nivel: number;
}

export const PointsBanner: React.FC<PointsBannerProps> = ({ puntos, nivel }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Puntos Totales</Text>
      <Text style={styles.pointsValue}>{puntos}</Text>
      <Text style={styles.levelLabel}>Nivel {nivel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[5],
    marginBottom: Spacing[4],
  },
  cardTitle: {
    ...TextVariants.h4,
    color: DarkText.secondary,
    marginBottom: Spacing[3],
  },
  pointsValue: {
    ...TextVariants.display,
    fontSize: FontSizes['4xl'],
    color: Accent[500],
    fontWeight: FontWeights.bold,
  },
  levelLabel: {
    ...TextVariants.labelMd,
    color: DarkText.muted,
    marginTop: Spacing[1],
  },
});
