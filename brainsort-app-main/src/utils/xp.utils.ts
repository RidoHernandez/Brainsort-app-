/**
 * xp.utils.ts
 * BrainSort — Utilidades de cálculo de XP, nivel y tier
 *
 * Referencia: gamification-xp-progression.spec.md §3 y §4
 *
 * Fórmulas:
 *   XP acumulado para nivel n = 50n(n+1)
 *   XP marginal de nivel n-1→n = 100n
 *   Nivel dado XP = floor((-1 + sqrt(1 + 4*XP/50)) / 2), clamped [1, 32]
 *
 * NOTA: Este módulo es puro (sin imports de React ni efectos secundarios).
 */

// ─── Constantes ───────────────────────────────────────────────────────────────

export const NIVEL_MAXIMO = 32;

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TierInfo {
  nombre: string;
  icono: string;
  rango: [number, number]; // [nivelMin, nivelMax] inclusive
}

export interface ProgresoNivel {
  /** XP actual del usuario */
  xpActual: number;
  /** XP acumulado al inicio del nivel actual */
  xpInicio: number;
  /** XP acumulado necesario para alcanzar el siguiente nivel */
  xpSiguiente: number;
  /** XP ganado dentro del nivel actual (xpActual - xpInicio) */
  xpGanado: number;
  /** XP faltante para el siguiente nivel */
  xpFaltante: number;
  /** Porcentaje de progreso dentro del nivel actual [0, 100] */
  porcentaje: number;
  /** ¿Está en el nivel máximo? */
  esNivelMaximo: boolean;
}

// ─── Tabla de Tiers ───────────────────────────────────────────────────────────

export const TIERS: TierInfo[] = [
  { nombre: 'Novato',     icono: '🌱', rango: [1, 5] },
  { nombre: 'Aprendiz',   icono: '🌿', rango: [6, 10] },
  { nombre: 'Intermedio', icono: '🔥', rango: [11, 15] },
  { nombre: 'Avanzado',   icono: '⚡', rango: [16, 20] },
  { nombre: 'Experto',    icono: '💎', rango: [21, 25] },
  { nombre: 'Maestro',    icono: '🏆', rango: [26, 30] },
  { nombre: 'Leyenda',    icono: '👑', rango: [31, 32] },
];

// ─── Funciones ────────────────────────────────────────────────────────────────

/**
 * Calcula el XP acumulado total necesario para alcanzar el nivel `n`.
 * Fórmula: 50n(n+1)
 *
 * @param n — Nivel objetivo (1-32)
 * @returns XP total acumulado necesario
 *
 * @example
 * xpParaNivel(1)  // 100
 * xpParaNivel(5)  // 1500
 * xpParaNivel(32) // 52800
 */
export function xpParaNivel(n: number): number {
  return 50 * n * (n + 1);
}

/**
 * Calcula el nivel actual dado un total de XP acumulado.
 * Fórmula inversa: floor((-1 + sqrt(1 + 4*XP/50)) / 2), clamped [1, 32]
 *
 * @param puntosTotales — XP total acumulado del usuario
 * @returns Nivel actual del usuario (1-32)
 *
 * @example
 * calcularNivel(0)     // 1
 * calcularNivel(100)   // 1
 * calcularNivel(300)   // 2
 * calcularNivel(52800) // 32
 */
export function calcularNivel(puntosTotales: number): number {
  if (puntosTotales <= 0) return 1;
  const nivel = Math.floor((-1 + Math.sqrt(1 + (4 * puntosTotales) / 50)) / 2);
  if (nivel < 1) return 1;
  if (nivel > NIVEL_MAXIMO) return NIVEL_MAXIMO;
  return nivel;
}

/**
 * Calcula el progreso detallado dentro del nivel actual.
 *
 * @param puntosTotales — XP total acumulado del usuario
 * @param nivelActual — Nivel actual del usuario (del backend o calculado)
 * @returns Objeto con desglose del progreso de nivel
 *
 * @example
 * calcularProgresoNivel(350, 5)
 * // { xpActual: 350, xpInicio: 1500, xpSiguiente: 2100, porcentaje: ..., ... }
 */
export function calcularProgresoNivel(
  puntosTotales: number,
  nivelActual: number,
): ProgresoNivel {
  const nivel = Math.min(Math.max(nivelActual, 1), NIVEL_MAXIMO);
  const esNivelMaximo = nivel >= NIVEL_MAXIMO;

  const xpInicio = xpParaNivel(nivel);          // XP al inicio del nivel actual
  const xpSiguiente = xpParaNivel(nivel + 1);   // XP para el siguiente nivel

  const xpGanado = Math.max(puntosTotales - xpInicio, 0);
  const xpFaltante = Math.max(xpSiguiente - puntosTotales, 0);
  const xpRango = xpSiguiente - xpInicio;       // XP marginal del nivel

  const porcentaje = esNivelMaximo
    ? 100
    : Math.min(Math.max((xpGanado / xpRango) * 100, 0), 100);

  return {
    xpActual: puntosTotales,
    xpInicio,
    xpSiguiente,
    xpGanado,
    xpFaltante,
    porcentaje,
    esNivelMaximo,
  };
}

/**
 * Obtiene la información del tier correspondiente a un nivel.
 *
 * @param nivel — Nivel del usuario (1-32)
 * @returns TierInfo con nombre e icono del tier
 *
 * @example
 * obtenerTier(1)  // { nombre: 'Novato', icono: '🌱', rango: [1, 5] }
 * obtenerTier(15) // { nombre: 'Intermedio', icono: '🔥', rango: [11, 15] }
 * obtenerTier(32) // { nombre: 'Leyenda', icono: '👑', rango: [31, 32] }
 */
export function obtenerTier(nivel: number): TierInfo {
  const tier = TIERS.find(
    (t) => nivel >= t.rango[0] && nivel <= t.rango[1],
  );
  // Fallback al último tier si nivel > 32 (no debería ocurrir)
  return tier ?? TIERS[TIERS.length - 1];
}

/**
 * Formatea un número de XP para mostrar en la UI.
 * Ej: 1500 → "1,500", 52800 → "52,800"
 *
 * @param xp — Valor de XP a formatear
 */
export function formatearXP(xp: number): string {
  return xp.toLocaleString('es-MX');
}
