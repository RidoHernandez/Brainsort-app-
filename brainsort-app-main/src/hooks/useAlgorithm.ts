/**
 * useAlgorithm.ts
 * BrainSort — Hook para obtener detalle de un algoritmo específico
 *
 * task_breakdown.md T-FE-045
 *
 * Responsabilidades:
 *   • Fetch del detalle de un algoritmo (GET /api/algoritmos/:id)
 *   • Obtiene pseudocódigo completo
 *   • Caché con TanStack Query (staleTime: 10min)
 *   • Manejo de estados (cargando, error, datos)
 *   • Se activa solo cuando se tiene un ID válido (enabled condition)
 *
 * No contiene lógica de UI. Se consume desde AlgorithmDetailScreen.
 *
 * Referencia: 02-frontend-app.md §1 hooks/useAlgorithm.ts
 *            04-contratos-api.md §3 Algorithms Module (CO2)
 */

import { useQuery } from '@tanstack/react-query';
import { libraryService, AlgoritmoDetalle } from '../services/library.service';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Retorno del hook.
 */
export interface UseAlgorithmReturn {
  // Datos
  algoritmo: AlgoritmoDetalle | undefined;

  // Estado
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para obtener el detalle completo de un algoritmo.
 * Se activa solo si se proporciona un ID válido.
 *
 * @param algoritmoId UUID del algoritmo a obtener. Si es null/undefined, la query no se ejecuta.
 *
 * @example
 * function AlgorithmDetailScreen({ navigation, route }) {
 *   const { params: { algoritmoId } } = route;
 *   const { algoritmo, isLoading, error } = useAlgorithm(algoritmoId);
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorBanner message={error.message} />;
 *   if (!algoritmo) return <Text>Algoritmo no encontrado</Text>;
 *
 *   return (
 *     <View>
 *       <Text>{algoritmo.nombre}</Text>
 *       <Text>{algoritmo.descripcion}</Text>
 *       <Text>O({algoritmo.complejidadTiempo})</Text>
 *       <PseudocodePanel lines={algoritmo.pseudocode} />
 *       <Button title="Iniciar Simulación" />
 *     </View>
 *   );
 * }
 */
export function useAlgorithm(
  algoritmoId: string | null | undefined,
): UseAlgorithmReturn {
  const { data, isLoading, isError, error } = useQuery<AlgoritmoDetalle>({
    queryKey: ['algoritmo', algoritmoId],
    queryFn: () => libraryService.getAlgorithm(algoritmoId!),
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30,    // 30 minutos
    retry: 2,
    // Solo ejecutar si tenemos un ID válido
    enabled: !!algoritmoId,
  });

  return {
    algoritmo: data,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
  };
}
