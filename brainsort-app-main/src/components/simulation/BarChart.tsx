/**
 * BarChart.tsx
 * BrainSort — Componente de visualización de barras para simulación
 *
 * Renderiza el arreglo actual como barras de altura proporcional.
 * Aplica el color coding del spec (Constitution §3):
 *   Azul   (#4A90D9) → idle
 *   Amarillo (#F5A623) → comparando
 *   Rojo   (#D0021B) → intercambiando
 *   Verde  (#7ED321) → posición final / completado
 *
 * Usa react-native-svg para renderizado vectorial. (HU-04)
 * Animaciones con Animated.Value para transiciones suaves. (≥24 FPS)
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SimulationColors } from '../../styles/colors';
import type { SimulationStep } from '@brainsort/core';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface BarChartProps {
  /** Nombre del algoritmo para derivar etiquetas de variables como i, j, pivot, mid */
  algorithmName?: string;
  /** Paso actual de simulación (contiene array + highlight info) */
  step: SimulationStep | null;
  /** true cuando la simulación ha terminado — todas las barras en verde */
  isCompleted: boolean;
  /** Altura disponible para el canvas de barras */
  height?: number;
}

type BarMarkerView = Record<number, { label: string; color: string }>;

function getMarkerView(step: SimulationStep | null): BarMarkerView {
  const markers = step?.marcadores ?? [];
  return markers.reduce<BarMarkerView>((acc, marker) => {
    if (!marker.label) {
      acc[marker.index] = acc[marker.index] ?? {
        label: '',
        color: marker.color,
      };
      return acc;
    }
    const existing = acc[marker.index];
    acc[marker.index] = {
      label: existing?.label ? `${existing.label}/${marker.label}` : marker.label,
      color: marker.color,
    };
    return acc;
  }, {});
}

// ─── Helper: color por estado ─────────────────────────────────────────────────

function getBarColor(
  index: number,
  step: SimulationStep | null,
  isCompleted: boolean,
): string {
  if (isCompleted) return SimulationColors.final; // Verde total al terminar

  if (!step) return SimulationColors.idle;
  const marker = step.marcadores?.find((item) => item.index === index);
  if (marker) {
    if (marker.role === 'descartado') {
      return SimulationColors.idle; // Keep original idle color (blue)
    }
    return marker.color;
  }

  const rawStep = step as any;
  const highlightIndices = rawStep.highlightIndices;
  const legacyActiveIndices = rawStep.indicesActivos;
  const includes = (arr?: number[]) => Array.isArray(arr) && arr.includes(index);

  if (highlightIndices) {
    if (includes(highlightIndices.swap)) return SimulationColors.intercambio;
    if (includes(highlightIndices.compare)) return SimulationColors.comparacion;
    if (includes(highlightIndices.sorted)) return SimulationColors.final;
  }

  // Compatibilidad con esquema legacy de pasos.
  if (Array.isArray(legacyActiveIndices) && legacyActiveIndices.includes(index)) {
    const operation = String(rawStep.operationType ?? rawStep.tipoOperacion ?? '').toLowerCase();
    if (operation.includes('swap') || operation.includes('intercambio')) {
      return SimulationColors.intercambio;
    }
    if (operation.includes('compare') || operation.includes('compar')) {
      return SimulationColors.comparacion;
    }
    if (operation.includes('sorted') || operation.includes('final')) {
      return SimulationColors.final;
    }
    return SimulationColors.comparacion;
  }

  return SimulationColors.idle;
}

// ─── Componente de barra individual ──────────────────────────────────────────

interface SingleBarProps {
  value: number;
  maxValue: number;
  color: string;
  label?: string;
  availableHeight: number;
  width: number;
  opacity?: number;
}

const SingleBar: React.FC<SingleBarProps> = ({
  value,
  maxValue,
  color,
  label,
  availableHeight,
  width,
  opacity = 1,
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;

  const barHeight = Math.max(4, (value / maxValue) * availableHeight * 0.9);

  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: barHeight,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barHeight]);

  return (
    <View
      style={[barStyles.barContainer, { width }]}
      accessibilityLabel={label ? `${label}, valor ${value}` : `Valor ${value}`}
    >
      <View style={barStyles.labelSlot}>
        {label ? (
          <Text
            style={[
              barStyles.variableLabel,
              { maxWidth: Math.max(width + 18, 42) },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : null}
      </View>
      <Animated.View
        style={[
          barStyles.bar,
          {
            height: heightAnim,
            backgroundColor: color,
            width: width - 2,
            shadowColor: color,
            opacity: opacity,
          },
        ]}
      />
    </View>
  );
};

const barStyles = StyleSheet.create({
  barContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
  },
  labelSlot: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  variableLabel: {
    backgroundColor: 'rgba(8, 11, 15, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
    textAlign: 'center',
  },
  bar: {
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
});

// ─── Componente principal ─────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;

export const BarChart: React.FC<BarChartProps> = ({
  step,
  isCompleted,
  height = 220,
}) => {
  const rawStep = step as any;
  const currentArray: number[] = rawStep?.array ?? rawStep?.estadoArray ?? [];

  if (currentArray.length === 0) {
    return <View style={[styles.container, { height }]} />;
  }

  const maxValue = Math.max(...currentArray);
  const barWidth = Math.min(40, Math.floor((SCREEN_WIDTH - 48) / currentArray.length));
  const markerView = getMarkerView(step);

  return (
    <View style={[styles.container, { height }]}>
      {currentArray.map((value, index) => {
        const color = getBarColor(index, step, isCompleted);
        const marker = step?.marcadores?.find((item) => item.index === index);
        const isDiscarded = marker?.role === 'descartado';

        return (
          <SingleBar
            key={index}
            value={value}
            maxValue={maxValue}
            color={color}
            label={markerView[index]?.label}
            availableHeight={height - 24}
            width={barWidth}
            opacity={isDiscarded ? 0.25 : 1}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 12,
    gap: 2,
  },
});
