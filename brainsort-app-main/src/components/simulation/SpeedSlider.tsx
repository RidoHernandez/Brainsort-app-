import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../styles/colors';

interface SpeedSliderProps {
  speed: number;
  onSpeedChange: (value: number) => void;
}

/**
 * T-FE-068: Control de velocidad: rango [0.25, 2.0] con incrementos de 0.25 (Glosario)
 */
export const SpeedSlider: React.FC<SpeedSliderProps> = ({ speed, onSpeedChange }) => {
  const speeds = [0.25, 0.5, 1.0, 1.5, 2.0];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Velocidad</Text>
      <View style={styles.speedRow}>
        {speeds.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.speedButton, speed === s && styles.activeButton]}
            onPress={() => {
              onSpeedChange(s);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.speedText, speed === s && styles.activeText]}>
              {s}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  label: {
    color: Colors.neutral[900],
    fontSize: 14,
    marginBottom: 10,
  },
  speedRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  speedButton: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  speedText: {
    color: Colors.neutral[500],
    fontSize: 12,
  },
  activeButton: {
    backgroundColor: Colors.primary[500],
  },
  activeText: {
    color: Colors.neutral[0],
  },
});
