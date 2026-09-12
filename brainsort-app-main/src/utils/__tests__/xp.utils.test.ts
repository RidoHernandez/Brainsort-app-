import {
  NIVEL_MAXIMO,
  calcularNivel,
  calcularProgresoNivel,
  formatearXP,
  obtenerTier,
  xpParaNivel,
} from '../xp.utils';

describe('xp.utils', () => {
  it('calcula XP acumulado por nivel con formula cuadratica', () => {
    expect(xpParaNivel(1)).toBe(100);
    expect(xpParaNivel(5)).toBe(1500);
    expect(xpParaNivel(32)).toBe(52800);
  });

  it('calcula nivel desde puntos totales y aplica limites', () => {
    expect(calcularNivel(0)).toBe(1);
    expect(calcularNivel(100)).toBe(1);
    expect(calcularNivel(300)).toBe(2);
    expect(calcularNivel(999999)).toBe(NIVEL_MAXIMO);
  });

  it('calcula progreso dentro del nivel actual', () => {
    const progreso = calcularProgresoNivel(350, 2);

    expect(progreso.xpActual).toBe(350);
    expect(progreso.xpInicio).toBe(300);
    expect(progreso.xpSiguiente).toBe(600);
    expect(progreso.xpGanado).toBe(50);
    expect(progreso.xpFaltante).toBe(250);
    expect(progreso.porcentaje).toBeCloseTo(16.666, 2);
    expect(progreso.esNivelMaximo).toBe(false);
  });

  it('marca progreso completo en nivel maximo', () => {
    const progreso = calcularProgresoNivel(52800, 32);

    expect(progreso.esNivelMaximo).toBe(true);
    expect(progreso.porcentaje).toBe(100);
  });

  it('obtiene tier por rango de nivel', () => {
    expect(obtenerTier(1).nombre).toBe('Novato');
    expect(obtenerTier(15).nombre).toBe('Intermedio');
    expect(obtenerTier(32).nombre).toBe('Leyenda');
    expect(obtenerTier(99).nombre).toBe('Leyenda');
  });

  it('formatea XP con separadores de miles', () => {
    expect(formatearXP(52800)).toBe('52,800');
  });
});
