import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg from 'react-native-svg';
import { BarChart } from './BarChart';
import type { SimulationStep } from '@brainsort/core';

interface SimulationCanvasProps {
  algorithmName?: string;
  step: SimulationStep | null;
  isCompleted?: boolean;
}

/**
 * T-FE-064: Contenedor SVG principal para la visualización
 */
export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  algorithmName,
  step,
  isCompleted = false,
}) => {
  // Hard-coded dimensions for Web reliability to prevent 0x0 situations
  const width = 800; // Standard baseline width
  const height = 300;

  return (
    <View style={styles.container}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <BarChart
          algorithmName={algorithmName}
          step={step}
          isCompleted={isCompleted}
          height={height}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
