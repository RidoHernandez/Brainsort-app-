/**
 * AnimationEngine.ts
 * BrainSort — Motor de selección de renderizador de animación
 *
 * Determina si un algoritmo debe usar:
 *   - BarChart (algoritmos de ordenamiento: Bubble Sort, Insertion Sort, etc.)
 *   - LinearStructureCanvas (estructuras lineales: Stack, Queue, Linked List)
 */

import { SimulationColors, Accent } from '../styles/colors';

export const AnimationEngine = {
  /**
   * Devuelve el tipo de visualizador según la categoría del algoritmo.
   * @param categoria CategoriaAlgoritmo del backend
   */
  getRendererType(categoria: string | undefined, algorithmName?: string): 'bar' | 'linear' | 'tree' {
    if (categoria === 'EstructurasArboles') return 'tree';
    if (algorithmName === 'Heap Sort' || algorithmName === 'Priority Queue') return 'tree';
    if (categoria === 'EstructurasLineales') return 'linear';
    return 'bar';
  },

  /**
   * Verifica si el algoritmo es una estructura lineal.
   */
  isLinearStructure(categoria: string | undefined): boolean {
    return categoria === 'EstructurasLineales';
  },

  isTreeStructure(categoria: string | undefined, algorithmName?: string): boolean {
    return categoria === 'EstructurasArboles' || algorithmName === 'Heap Sort' || algorithmName === 'Priority Queue';
  },

  /**
   * Devuelve la leyenda de operaciones apropiada para el tipo de algoritmo.
   */
  getLegend(categoria: string | undefined): Array<{ color: string; label: string }> {
    if (categoria === 'Busqueda') {
      return [
        { color: SimulationColors.idle, label: 'Buscando' },
        { color: SimulationColors.comparacion, label: 'Elemento Medio (mid)' },
        { color: '#1A2333', label: 'Descartado' },
        { color: SimulationColors.final, label: 'Encontrado' },
      ];
    }
    if (categoria === 'EstructurasArboles') {
      return [
        { color: '#555', label: 'Pendiente' },
        { color: SimulationColors.comparacion, label: 'Visitando' },
        { color: Accent[500], label: 'Construyendo' },
        { color: SimulationColors.final, label: 'Listo' },
      ];
    }
    if (categoria === 'EstructurasLineales') {
      return [
        { color: Accent[500], label: 'Insertar' },
        { color: SimulationColors.comparacion, label: 'Inspeccionar' },
        { color: SimulationColors.intercambio, label: 'Extraer' },
        { color: SimulationColors.final, label: 'Finalizado' },
      ];
    }
    // Ordenamiento (default)
    return [
      { color: SimulationColors.idle, label: 'Inactivo' },
      { color: SimulationColors.comparacion, label: 'Comparando' },
      { color: SimulationColors.intercambio, label: 'Intercambiando' },
      { color: SimulationColors.final, label: 'Finalizado' },
    ];
  },
};
