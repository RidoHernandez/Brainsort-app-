import { ChartScales } from './scales';

export interface BarCoordinate {
  id: string;
  index: number;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Genera la geometría (x, y, width, height) para cada valor en el array, basado en las escalas d3 en SVG.
 * RECORDATORIO SVG: el origen (0,0) está arriba a la izquierda.
 */
export function calculateBarCoordinates(
  data: number[],
  scales: ChartScales
): BarCoordinate[] {
  const barWidth = data.length > 1 
    ? Math.abs(scales.xScale(1) - scales.xScale(0)) * 0.8 // 80% ancho de barra, 20% gap
    : Math.abs(scales.xScale.range()[1] - scales.xScale.range()[0]) * 0.5;

  // La linea base (suelo de las barras) se localiza en yScale evaluado con el valor 0
  const baseY = scales.yScale(0);

  return data.map((value, index) => {
    const centerX = scales.xScale(index);
    const topY = scales.yScale(value);
    
    // Altura de la barra es la diferencia desde la linea base hasta su punto mas alto
    const height = Math.abs(baseY - topY);

    return {
      id: `bar_idx_${index}_val_${value}`, // Utilidad para rastreo simple
      index,
      value,
      x: centerX - (barWidth / 2), // Centramos la barra si xScale devuelve el centro del espacio
      y: topY,
      width: barWidth,
      height,
    };
  });
}
