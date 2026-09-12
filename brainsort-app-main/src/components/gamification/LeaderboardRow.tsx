import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkSurfaces, DarkText, Accent } from '../../styles/colors';
import { FontWeights, TextVariants } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

export interface LeaderboardRowProps {
  posicion: number;
  nombre: string;
  puntos: number;
  nivel: number;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  posicion,
  nombre,
  puntos,
  nivel,
}) => {
  return (
    <View style={styles.leaderboardRow}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankNumber}>{posicion}</Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{nombre}</Text>
        <Text style={styles.rowLevel}>Nivel {nivel}</Text>
      </View>
      <View style={styles.rowPoints}>
        <Text style={styles.pointsValue}>{puntos}</Text>
        <Text style={styles.pointsLabel}>XP</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DarkSurfaces.border,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Accent[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[3],
  },
  rankNumber: {
    ...TextVariants.labelMd,
    color: DarkText.primary,
    fontWeight: FontWeights.bold,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    ...TextVariants.bodyMd,
    color: DarkText.primary,
    fontWeight: FontWeights.medium,
  },
  rowLevel: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
  },
  rowPoints: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    ...TextVariants.labelMd,
    color: Accent[500],
    fontWeight: FontWeights.bold,
  },
  pointsLabel: {
    ...TextVariants.caption,
    color: DarkText.muted,
  },
});
