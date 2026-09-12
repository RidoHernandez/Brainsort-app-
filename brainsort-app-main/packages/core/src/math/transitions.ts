import { interpolateNumber } from 'd3-interpolate';

/**
 * Retorna una función interpoladora para animar la transición de una coordenada numérica.
 * `t` es el valor de tiempo normalizado que va de 0 a 1.
 */
export function getNumberInterpolator(start: number, end: number): (t: number) => number {
  return interpolateNumber(start, end);
}

/**
 * Calcula un valor numérico interpolado en un momento de tiempo normalizado `t` (0 a 1).
 */
export function interpolateValue(start: number, end: number, t: number): number {
  const interpolator = interpolateNumber(start, end);
  return interpolator(t);
}

/**
 * Interpola un conjunto de coordenadas o propiedades (x, y, height, width, etc),
 * ideal para mover un Bar (rectángulo) animadamente de una etapa a otra.
 */
export interface BarTransitionState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function interpolateBarState(
  startState: BarTransitionState,
  endState: BarTransitionState,
  t: number
): BarTransitionState {
  return {
    x: interpolateNumber(startState.x, endState.x)(t),
    y: interpolateNumber(startState.y, endState.y)(t),
    width: interpolateNumber(startState.width, endState.width)(t),
    height: interpolateNumber(startState.height, endState.height)(t),
  };
}
