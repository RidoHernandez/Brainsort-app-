/**
 * useLibrary.ts
 * BrainSort — Hook para gestionar la biblioteca de algoritmos
 *
 * task_breakdown.md T-FE-044
 *
 * Responsabilidades:
 *   • Fetch de la biblioteca completa (GET /api/biblioteca)
 *   • Filtrado por categoría (en memoria)
 *   • Caché con TanStack Query (staleTime: 5min)
 *   • Manejo de estados (cargando, error, datos)
 *   • Memo para evitar re-renders innecesarios
 *
 * No contiene lógica de UI. Se consume desde Screens.
 *
 * Referencia: 02-frontend-app.md §1 hooks/useLibrary.ts
 *            04-contratos-api.md §3 Algorithms Module (CO1)
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { libraryService, AlgoritmoEnBiblioteca, LibraryResponse } from '../services/library.service';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Retorno del hook.
 */
export interface UseLibraryReturn {
  // Estado
  algoritmos: AlgoritmoEnBiblioteca[] | undefined;
  categorias: string[] | undefined;
  totalAlgoritmos: number | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Filtrado
  filteredAlgoritmos: (categoria?: string) => AlgoritmoEnBiblioteca[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para obtener y filtrar la biblioteca de algoritmos.
 * Implementa caché automático con TanStack Query.
 *
 * @example
 * function LibraryScreen() {
 *   const { algoritmos, categorias, isLoading, filteredAlgoritmos } = useLibrary();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   const categoriasUnicas = categorias || [];
 *   const algoritmosOrdenamiento = filteredAlgoritmos('Ordenamiento');
 *
 *   return (
 *     <View>
 *       {categoriasUnicas.map(cat => (
 *         <Section key={cat} title={cat}>
 *           {filteredAlgoritmos(cat).map(algo => (
 *             <AlgorithmCard key={algo.id} algoritmo={algo} />
 *           ))}
 *         </Section>
 *       ))}
 *     </View>
 *   );
 * }
 */
export function useLibrary(): UseLibraryReturn {
  // ─── Fetch con TanStack Query ─────────────────────────────────────────────

  const { data, isLoading, isError, error } = useQuery<LibraryResponse>({
    queryKey: ['biblioteca'],
    queryFn: libraryService.getLibrary,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 30,   // 30 minutos (garbage collection time)
    retry: 2, // Reintentar 2 veces en caso de error
    enabled: true, // Ejecutar query al montar el hook
  });

  // ─── Extracto de datos con memoización ─────────────────────────────────────

  const { algoritmos, categorias, totalAlgoritmos } = useMemo(() => {
    return {
      algoritmos: data?.algoritmos,
      categorias: data?.categorias,
      totalAlgoritmos: data?.totalAlgoritmos,
    };
  }, [data?.algoritmos, data?.categorias, data?.totalAlgoritmos]);

  // ─── Función de filtrado con memoización ──────────────────────────────────

  /**
   * Filtra algoritmos por categoría.
   * Si no se especifica categoría, retorna todos.
   *
   * @param categoria Categoría a filtrar (opcional). Ej: "Ordenamiento"
   * @returns Array de algoritmos filtrados
   */
  const filteredAlgoritmos = useMemo(
    () => (categoria?: string): AlgoritmoEnBiblioteca[] => {
      if (!algoritmos) return [];
      if (!categoria) return algoritmos;
      return algoritmos.filter((algo) => algo.categoria === categoria);
    },
    [algoritmos],
  );

  // ─── Retorno ──────────────────────────────────────────────────────────────

  return {
    algoritmos,
    categorias,
    totalAlgoritmos,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
    filteredAlgoritmos,
  };
}
