import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkSurfaces, DarkText } from '../../styles/colors';
import { FontWeights, TextVariants } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

export interface BadgeCardProps {
  nombre: string;
  imagen: string;
  fechaObtencion: string | Date;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  nombre,
  imagen,
  fechaObtencion,
}) => {
  return (
    <View style={styles.badgeItem}>
      <Text style={styles.badgeIcon}>{imagen}</Text>
      <View style={styles.badgeInfo}>
        <Text style={styles.badgeName}>{nombre}</Text>
        <Text style={styles.badgeDate}>
          {new Date(fechaObtencion).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: DarkSurfaces.border,
  },
  badgeIcon: {
    fontSize: 32,
    marginRight: Spacing[3],
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    ...TextVariants.bodyMd,
    color: DarkText.primary,
    fontWeight: FontWeights.medium,
  },
  badgeDate: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
  },
});
