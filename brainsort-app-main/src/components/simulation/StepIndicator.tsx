import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../styles/colors';

interface StepIndicatorProps {
  current: number;
  total: number;
}

/**
 * T-FE-069: Muestra paso actual / total
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ({ current, total }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Paso: {current} / {total}</Text>
      <Text style={styles.version}>VERSION 2.1 - LOOPS FIXED</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 10,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  version: {
    color: '#00FF00', // Lime green - impossible to miss
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
  },
});
