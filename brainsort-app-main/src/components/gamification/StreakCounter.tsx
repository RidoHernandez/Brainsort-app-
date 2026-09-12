import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkSurfaces, DarkText, Accent } from '../../styles/colors';
import { TextVariants } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

export interface StreakCounterProps {
  racha: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ racha }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Racha de Días</Text>
      <View style={styles.streakRow}>
        <Text style={styles.streakIcon}>🔥</Text>
        <Text style={styles.streakValue}>{racha}</Text>
      </View>
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
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIcon: {
    fontSize: 32,
    marginRight: Spacing[2],
  },
  streakValue: {
    ...TextVariants.h2,
    color: Accent[500],
  },
});
