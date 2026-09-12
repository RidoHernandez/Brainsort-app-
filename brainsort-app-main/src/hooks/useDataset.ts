/**
 * useDataset.ts
 * BrainSort — Hook para generar y validar conjuntos de datos
 *
 * task_breakdown.md T-FE-053
 *
 * Responsabilidades:
 *   • Generar datos predeterminados (arreglo aleatorio 8-15 elementos)
 *   • Validar datos personalizados del usuario
 *   • Garantizar que datos no estén pre-ordenados
 *   • Manejo de errores en validación
 *
 * No contiene lógica de UI.
 *
 * Referencia: 02-frontend-app.md §1 hooks/useDataset.ts
 */

import { useCallback, useState } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Error de validación de dataset.
 */
export interface DatasetError {
  code:
    | 'EMPTY_ARRAY'
    | 'TOO_LARGE'
    | 'CONTAINS_NON_NUMERIC'
    | 'ALREADY_SORTED'
    | 'DUPLICATE_VALUES';
  message: string;
}

/**
 * Retorno del hook.
 */
export interface UseDatasetReturn {
  // Generadores
  generateDefault: () => number[];
  generateRandomInt: (min: number, max: number, count: number) => number[];

  // Validación
  validateDataset: (data: number[]) => DatasetError | null;

  // Estado
  lastError: DatasetError | null;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const MIN_SIZE = 3;
const MAX_SIZE = 1000;
const DEFAULT_MIN = 1;
const DEFAULT_MAX = 100;
const DEFAULT_SIZE_MIN = 8;
const DEFAULT_SIZE_MAX = 15;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para generar y validar conjuntos de datos para simulaciones.
 *
 * @example
 * function SimulationScreen() {
 *   const { generateDefault, validateDataset, lastError } = useDataset();
 *
 *   // Generar datos al montar
 *   const initialData = generateDefault();
 *
 *   // Validar datos personalizados
 *   const handleGenerateNew = (input: string) => {
 *     const valores = input.split(',').map(Number);
 *     const error = validateDataset(valores);
 *     if (error) {
 *       Toast.show(error.message);
 *       return;
 *     }
 *     // Usar valores validados
 *     executeSimulation(valores);
 *   };
 *
 *   return (
 *     <View>
 *       <BarChart data={...} />
 *       <Button title="Generar nuevos datos" onPress={...} />
 *       {lastError && <ErrorText>{lastError.message}</ErrorText>}
 *     </View>
 *   );
 * }
 */
export function useDataset(): UseDatasetReturn {
  const [lastError, setLastError] = useState<DatasetError | null>(null);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /**
   * Genera número aleatorio en rango [min, max) inclusive.
   */
  const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  /**
   * Verifica si un arreglo está ordenado (de forma estricta o casi).
   */
  const isArraySorted = (arr: number[]): boolean => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] <= arr[i + 1]) continue; // Ascendente
      // Si encuentra un par no ordenado, NO está ordenada
      break;
    }
    // Verificar si está en orden ascendente
    return arr.every((val, i, a) => i === 0 || a[i - 1] <= val);
  };

  // ─── Generadores ──────────────────────────────────────────────────────────

  /**
   * Genera un dataset predeterminado aleatorio (8-15 elementos).
   * Garantiza que NO esté pre-ordenado.
   */
  const generateDefault = useCallback((): number[] => {
    let data: number[];
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const size = randomInt(DEFAULT_SIZE_MIN, DEFAULT_SIZE_MAX);
      data = [];
      for (let i = 0; i < size; i++) {
        data.push(randomInt(DEFAULT_MIN, DEFAULT_MAX));
      }
      attempts++;
    } while (isArraySorted(data) && attempts < maxAttempts);

    setLastError(null);
    return data;
  }, []);

  /**
   * Genera array aleatorio con parámetros personalizados.
   */
  const generateRandomInt = useCallback(
    (min: number, max: number, count: number): number[] => {
      const data: number[] = [];
      for (let i = 0; i < count; i++) {
        data.push(randomInt(min, max));
      }
      setLastError(null);
      return data;
    },
    [],
  );

  // ─── Validación ────────────────────────────────────────────────────────────

  /**
   * Valida un dataset para asegurar que sea apropiado para simulación.
   */
  const validateDataset = useCallback((data: number[]): DatasetError | null => {
    // Validar que sea un arreglo
    if (!Array.isArray(data)) {
      const error: DatasetError = {
        code: 'EMPTY_ARRAY',
        message: 'Debes proporcionar un arreglo de números.',
      };
      setLastError(error);
      return error;
    }

    // Validar no vacío
    if (data.length === 0) {
      const error: DatasetError = {
        code: 'EMPTY_ARRAY',
        message: 'El arreglo no puede estar vacío.',
      };
      setLastError(error);
      return error;
    }

    // Validar tamaño mínimo
    if (data.length < MIN_SIZE) {
      const error: DatasetError = {
        code: 'EMPTY_ARRAY',
        message: `El arreglo debe tener al menos ${MIN_SIZE} elementos.`,
      };
      setLastError(error);
      return error;
    }

    // Validar tamaño máximo
    if (data.length > MAX_SIZE) {
      const error: DatasetError = {
        code: 'TOO_LARGE',
        message: `El arreglo no puede tener más de ${MAX_SIZE} elementos.`,
      };
      setLastError(error);
      return error;
    }

    // Validar que todos sean números
    for (let i = 0; i < data.length; i++) {
      if (!Number.isFinite(data[i])) {
        const error: DatasetError = {
          code: 'CONTAINS_NON_NUMERIC',
          message: `Elemento en posición ${i} no es un número válido.`,
        };
        setLastError(error);
        return error;
      }
    }

    // Validar que no esté pre-ordenado (opcional, puede ser estricto)
    if (isArraySorted(data)) {
      const error: DatasetError = {
        code: 'ALREADY_SORTED',
        message:
          'El arreglo ya está ordenado. La simulación sería trivial.',
      };
      setLastError(error);
      return error;
    }

    setLastError(null);
    return null;
  }, []);

  // ─── Retorno ──────────────────────────────────────────────────────────────

  return {
    generateDefault,
    generateRandomInt,
    validateDataset,
    lastError,
  };
}
