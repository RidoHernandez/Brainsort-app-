import { scaleLinear, ScaleLinear } from 'd3-scale';

export interface ScalesConfig {
  domainX: [number, number];     // ej. [0, numeroDeBarras - 1]
  domainY: [number, number];     // ej. [0, valorMaximoDelArray]
  rangeWidth: [number, number];  // ej. [paddingLeft, canvasWidth - paddingRight]
  rangeHeight: [number, number]; // ej. [canvasHeight - paddingBottom, paddingTop] - SVG invertido
}

export interface ChartScales {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export function createScales(config: ScalesConfig): ChartScales {
  const xScale = scaleLinear()
    .domain(config.domainX)
    .range(config.rangeWidth);

  const yScale = scaleLinear()
    .domain(config.domainY)
    .range(config.rangeHeight);

  return { xScale, yScale };
}
