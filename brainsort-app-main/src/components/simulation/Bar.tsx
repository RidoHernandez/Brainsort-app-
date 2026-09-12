import React from 'react';
import { Rect } from 'react-native-svg';
import { SimulationColors } from '../../styles/colors';
import { OperationType } from '../../types/simulation';

interface BarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: OperationType | 'sorted';
}

/**
 * T-FE-065: Barra individual usando react-native-svg Rect
 */
export const Bar: React.FC<BarProps> = ({ x, y, width, height, type }) => {
  const getColor = (t: OperationType | 'sorted'): string => {
    switch (t) {
      case 'sorted':
      case 'final':
        return SimulationColors.final;
      case 'comparacion':
      case 'comparison':
        return SimulationColors.comparacion;
      case 'intercambio':
      case 'insercion':
      case 'swap':
        return SimulationColors.intercambio;
      case 'idle':
      default:
        return SimulationColors.idle;
    }
  };

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={getColor(type)}
      rx={2}
      ry={2}
    />
  );
};
