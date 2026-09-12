import { calculateBarCoordinates } from '../coordinates';
import { createScales } from '../scales';
import {
  getNumberInterpolator,
  interpolateBarState,
  interpolateValue,
} from '../transitions';

describe('math utilities', () => {
  describe('createScales y calculateBarCoordinates', () => {
    it('debe calcular coordenadas SVG para múltiples barras', () => {
      const scales = createScales({
        domainX: [0, 2],
        domainY: [0, 10],
        rangeWidth: [10, 110],
        rangeHeight: [100, 0],
      });

      const coordinates = calculateBarCoordinates([2, 5, 10], scales);

      expect(coordinates).toHaveLength(3);
      expect(coordinates[0]).toEqual(
        expect.objectContaining({
          id: 'bar_idx_0_val_2',
          index: 0,
          value: 2,
          x: -10,
          y: 80,
          width: 40,
          height: 20,
        }),
      );
      expect(coordinates[2]).toEqual(
        expect.objectContaining({
          x: 90,
          y: 0,
          height: 100,
        }),
      );
    });

    it('debe asignar ancho estable para una sola barra', () => {
      const scales = createScales({
        domainX: [0, 1],
        domainY: [0, 10],
        rangeWidth: [0, 100],
        rangeHeight: [100, 0],
      });

      const [bar] = calculateBarCoordinates([4], scales);

      expect(bar.width).toBe(50);
      expect(bar.x).toBe(-25);
      expect(bar.height).toBe(40);
    });
  });

  describe('transitions', () => {
    it('debe interpolar valores numéricos', () => {
      const interpolate = getNumberInterpolator(10, 20);

      expect(interpolate(0)).toBe(10);
      expect(interpolate(0.5)).toBe(15);
      expect(interpolateValue(10, 20, 1)).toBe(20);
    });

    it('debe interpolar estados de barra completos', () => {
      const result = interpolateBarState(
        { x: 0, y: 100, width: 10, height: 20 },
        { x: 20, y: 50, width: 30, height: 40 },
        0.5,
      );

      expect(result).toEqual({ x: 10, y: 75, width: 20, height: 30 });
    });
  });
});
