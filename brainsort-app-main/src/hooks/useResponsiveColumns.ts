/**
 * useResponsiveColumns.ts
 * BrainSort — Hook para calcular número de columnas según tamaño de pantalla
 *
 * task_breakdown.md T-FE-054
 *
 * Responsabilidades:
 *   • Detectar ancho disponible de la pantalla
 *   • Calcular número óptimo de columnas para grid
 *   • Memoizar para evitar cálculos innecesarios
 *
 * Breakpoints (según spec):
 *   ≥1024px: 4 columnas (Desktop)
 *   ≥768px:  3 columnas (Tablet)
 *   ≥480px:  2 columnas (Phablet)
 *   <480px:  1 columna  (Phone)
 *
 * Referencia: 02-frontend-app.md §9 Responsive Design
 *            02-frontend-app.md §1 hooks/useResponsiveColumns.ts
 */

import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Retorno del hook.
 */
export interface UseResponsiveColumnsReturn {
  // Número de columnas
  numColumns: number;
  // Ancho de la pantalla (en píxeles)
  screenWidth: number;
  // Altura de la pantalla
  screenHeight: number;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Breakpoints para responsive design */
const BREAKPOINTS = {
  DESKTOP: 1280,
  TABLET: 900,
  PHABLET: 600,
} as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook que calcula el número óptimo de columnas para un grid
 * basado en el tamaño de la pantalla.
 *
 * @returns Número de columnas, ancho y alto de pantalla
 *
 * @example
 * function LibraryScreen() {
 *   const { numColumns } = useResponsiveColumns();
 *
 *   return (
 *     <FlatList
 *       data={algoritmos}
 *       numColumns={numColumns}
 *       renderItem={...}
 *       key={`columns-${numColumns}`} // Re-renderizar cuando cambia numColumns
 *     />
 *   );
 * }
 */
export function useResponsiveColumns(): UseResponsiveColumnsReturn {
  const { width, height } = useWindowDimensions();

  // ─── Calcular columnas con memoización ────────────────────────────────────

  const numColumns = useMemo(() => {
    if (width >= BREAKPOINTS.DESKTOP) {
      return 3; // Desktop grande: 3 columnas
    }
    if (width >= BREAKPOINTS.TABLET) {
      return 2; // Tablet / Desktop pequeño: 2 columnas
    }
    if (width >= BREAKPOINTS.PHABLET) {
      return 2; // Phablet: 2 columnas
    }
    return 1; // Phone: 1 columna
  }, [width]);

  // ─── Retorno ──────────────────────────────────────────────────────────────

  return {
    numColumns,
    screenWidth: width,
    screenHeight: height,
  };
}
