/**
 * useSimulationEngine.ts
 * BrainSort — Hook para ejecutar algoritmos desde packages/core
 *
 * task_breakdown.md T-FE-047
 *
 * Responsabilidades:
 *   • Ejecutar el engine de un algoritmo específico con datos
 *   • Generar pasos de simulación (SimulationStep[])
 *   • Validar datos de entrada
 *   • Manejar timeout (10s máximo) para evitar bucles infinitos (HU-06)
 *   • Capturar errores de ejecución
 *   • Actualizar SimulationContext con los pasos generados
 *
 * Consume: packages/core engines
 * Produce: SimulationStep[] en el contexto
 *
 * No contiene lógica de reproducción (eso es useAnimationController).
 * No contiene lógica de UI.
 *
 * Referencia: 02-frontend-app.md §1 hooks/useSimulationEngine.ts
 *            02-frontend-app.md §4 Motor de Visualización
 */

import { useCallback, useRef } from 'react';
import { useSimulationContext } from '../context/SimulationContext';
import { simulationService } from '../services/simulation.service';

// ─── Constantes ───────────────────────────────────────────────────────────────

/**
 * Timeout máximo para ejecución de engines (segundos).
 * Si un engine tarda más, se aborta por seguridad (HU-06).
 */
const ENGINE_TIMEOUT_MS = 10000; // 10 segundos

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Errores de ejecución del engine.
 */
export interface EngineError {
  code: 'INVALID_DATA' | 'TIMEOUT' | 'ENGINE_NOT_FOUND' | 'EXECUTION_ERROR';
  message: string;
}

/**
 * Retorno del hook.
 */
export interface UseSimulationEngineReturn {
  // Acciones
  executeAlgorithm: (
    algoritmoId: string,
    data: number[],
  ) => Promise<void>;

  // Estado
  isExecuting: boolean;
  error: EngineError | null;
}

// ─── Helper: Validar Datos ────────────────────────────────────────────────────

/**
 * Valida que los datos sean válidos para simulación.
 *
 * @throws {EngineError} Si los datos no son válidos
 */
function validateData(data: number[]): void {
  if (!Array.isArray(data)) {
    throw new Error('INVALID_DATA: Datos no son un arreglo');
  }

  if (data.length === 0) {
    throw new Error('INVALID_DATA: Arreglo vacío no válido para simulación');
  }

  if (data.length > 1000) {
    throw new Error(
      'INVALID_DATA: Arreglo muy grande (máx 1000 elementos)',
    );
  }

  for (const valor of data) {
    if (!Number.isFinite(valor)) {
      throw new Error('INVALID_DATA: Arreglo contiene valores no numéricos');
    }
  }
}

// ─── Helper: Ejecutar con Timeout ─────────────────────────────────────────────

/**
 * Ejecuta una función con timeout (máximo ENGINE_TIMEOUT_MS).
 * Si tarda más, lanza error de timeout.
 *
 * @throws {EngineError} Si se excede el timeout
 */
async function executeWithTimeout<T>(
  fn: () => T,
  timeoutMs: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let completed = false;

    const timeoutId = setTimeout(() => {
      if (!completed) {
        completed = true;
        reject(
          new Error(
            `TIMEOUT: Ejecución del algoritmo excedió ${timeoutMs}ms`,
          ),
        );
      }
    }, timeoutMs);

    try {
      const result = fn();
      completed = true;
      clearTimeout(timeoutId);
      resolve(result);
    } catch (err) {
      completed = true;
      clearTimeout(timeoutId);
      reject(err);
    }
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para ejecutar algoritmos del core y generar pasos de simulación.
 *
 * @example
 * function AlgorithmDetailScreen() {
 *   const { executeAlgorithm, isExecuting, error } = useSimulationEngine();
 *   const { data, algoritmoId } = useAlgorithm(id);
 *
 *   const handleStartSimulation = async () => {
 *     const dataset = [5, 2, 8, 1, 9];
 *     try {
 *       await executeAlgorithm(algoritmoId, dataset);
 *       // SimulationContext ahora tiene steps y datos
 *       // Usuario puede ver visualización
 *     } catch (err) {
 *       console.error(error);
 *     }
 *   };
 *
 *   return (
 *     <>
 *       {isExecuting && <Spinner />}
 *       {error && <ErrorBanner>{error.message}</ErrorBanner>}
 *       <Button onPress={handleStartSimulation}>Simular</Button>
 *     </>
 *   );
 * }
 */
export function useSimulationEngine(): UseSimulationEngineReturn {
  const { setSimulationData } = useSimulationContext();
  const isExecutingRef = useRef<boolean>(false);
  const errorRef = useRef<EngineError | null>(null);

  /**
   * Ejecuta un algoritmo y actualiza el contexto de simulación.
   *
   * @param algoritmoId ID del algoritmo (debe estar registrado en ENGINE_REGISTRY)
   * @param data Arreglo de números a ordenar
   *
   * @throws {EngineError} Si ocurre algún error
   */
  const executeAlgorithm = useCallback(
    async (algoritmoId: string, data: number[]) => {
      isExecutingRef.current = true;
      errorRef.current = null;

      try {
        // ─── Validar datos ────────────────────────────────────────────────

        validateData(data);

        // ─── Ejecutar backend con timeout ────────────────────────────────

        const result = await executeWithTimeout(
          () =>
            simulationService.runSimulation({
              algoritmoId,
              conjuntoDeDatos: {
                valores: data,
                tipoOrigen: 'Personalizado',
                tamano: data.length,
              },
            }),
          ENGINE_TIMEOUT_MS,
        );

        // ─── Actualizar contexto ──────────────────────────────────────────

        setSimulationData({
          steps: result.pasos,
          data: [...data], // Copiar para inmutabilidad
          algoritmoId,
          pseudocode: result.pseudocode,
        });
      } catch (err) {
        // Parsear error en EngineError tipado
        const errorMessage = err instanceof Error ? err.message : String(err);

        let engineError: EngineError;

        if (errorMessage.includes('INVALID_DATA')) {
          engineError = {
            code: 'INVALID_DATA',
            message: errorMessage.replace('INVALID_DATA: ', ''),
          };
        } else if (errorMessage.includes('TIMEOUT')) {
          engineError = {
            code: 'TIMEOUT',
            message:
              'El algoritmo tardó demasiado. Intenta con un arreglo más pequeño.',
          };
        } else if (errorMessage.includes('ENGINE_NOT_FOUND')) {
          engineError = {
            code: 'ENGINE_NOT_FOUND',
            message: `Algoritmo '${algoritmoId}' no disponible.`,
          };
        } else {
          engineError = {
            code: 'EXECUTION_ERROR',
            message: `Error ejecutando algoritmo: ${errorMessage}`,
          };
        }

        errorRef.current = engineError;
        throw engineError;
      } finally {
        isExecutingRef.current = false;
      }
    },
    [setSimulationData],
  );

  return {
    executeAlgorithm,
    isExecuting: isExecutingRef.current,
    error: errorRef.current,
  };
}
