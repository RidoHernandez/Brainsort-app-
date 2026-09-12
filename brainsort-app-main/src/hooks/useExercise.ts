/**
 * useExercise.ts
 * BrainSort — Hook para gestionar ejercicios de predicción
 *
 * task_breakdown.md T-FE-049
 *
 * Responsabilidades:
 *   • Fetch de ejercicios de un algoritmo
 *   • Responder ejercicios y obtener feedback
 *   • Caché de ejercicios (staleTime: 10min)
 *   • Manejo de estados (cargando, error, enviando respuesta)
 *   • Capturar resultado: puntos, progreso, racha
 *
 * No contiene lógica de UI.
 *
 * Referencia: 02-frontend-app.md §1 hooks/useExercise.ts
 *            04-contratos-api.md §5 Exercises Module
 */

import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  exerciseService,
  Ejercicio,
  ExerciseResult,
} from '../services/exercise.service';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Retorno del hook.
 */
export interface UseExerciseReturn {
  // Estado de fetch
  ejercicios: Ejercicio[] | undefined;
  isLoadingExercises: boolean;
  exercisesError: Error | null;

  // Acciones
  responderEjercicio: (
    ejercicioId: string,
    respuesta: string,
  ) => Promise<ExerciseResult>;

  // Estado de respuesta
  isSubmittingAnswer: boolean;
  submitError: Error | null;
  lastResult: ExerciseResult | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para obtener y responder ejercicios de predicción de un algoritmo.
 *
 * @param algoritmoId ID del algoritmo para obtener sus ejercicios
 *
 * @example
 * function ExerciseScreen({ algoritmoId }) {
 *   const {
 *     ejercicios,
 *     isLoadingExercises,
 *     responderEjercicio,
 *     isSubmittingAnswer,
 *     lastResult,
 *   } = useExercise(algoritmoId);
 *
 *   if (isLoadingExercises) return <Spinner />;
 *   if (!ejercicios || ejercicios.length === 0) {
 *     return <Text>No hay ejercicios disponibles</Text>;
 *   }
 *
 *   const ejercicio = ejercicios[0];
 *
 *   const handleSubmit = async (respuesta: string) => {
 *     try {
 *       const resultado = await responderEjercicio(ejercicio.id, respuesta);
 *       if (resultado.correcto) {
 *         Toast.show(`¡Correcto! +${resultado.puntosGanados} XP`);
 *       } else {
 *         Toast.show(resultado.feedbackNegativo);
 *       }
 *     } catch (err) {
 *       Toast.show('Error enviando respuesta');
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       <Text>{ejercicio.pregunta}</Text>
 *       <PredictionExercise
 *         ejercicio={ejercicio}
 *         onSubmit={handleSubmit}
 *         isLoading={isSubmittingAnswer}
 *       />
 *     </View>
 *   );
 * }
 */
export function useExercise(algoritmoId: string | null | undefined): UseExerciseReturn {
  const [lastResult, setLastResult] = useState<ExerciseResult | null>(null);
  const queryClient = useQueryClient();

  // ─── Fetch de ejercicios ──────────────────────────────────────────────────

  const {
    data: ejercicios,
    isLoading: isLoadingExercises,
    error: exercisesError,
  } = useQuery<Ejercicio[]>({
    queryKey: ['ejercicios', algoritmoId],
    queryFn: () => exerciseService.getExercises(algoritmoId!),
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30,    // 30 minutos
    retry: 2,
    enabled: !!algoritmoId,
  });

  // ─── Responder ejercicio (mutation) ────────────────────────────────────────

  const {
    mutateAsync: responderEjercicio,
    isPending: isSubmittingAnswer,
    error: submitError,
  } = useMutation<ExerciseResult, Error, { id: string; respuesta: string }>({
    mutationFn: async ({ id, respuesta }) => {
      const resultado = await exerciseService.answerExercise(id, respuesta);
      setLastResult(resultado);
      return resultado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progreso', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['ranking'] });
    },
    onError: (error) => {
      console.error('Error responder ejercicio:', error);
    },
  });

  // ─── Wrapper que mapea parámetros correctamente ────────────────────────────

  const handleResponderEjercicio = useCallback(
    async (ejercicioId: string, respuesta: string): Promise<ExerciseResult> => {
      return responderEjercicio({ id: ejercicioId, respuesta });
    },
    [responderEjercicio],
  );

  // ─── Retorno ──────────────────────────────────────────────────────────────

  return {
    // Estado de fetch
    ejercicios,
    isLoadingExercises,
    exercisesError: exercisesError instanceof Error ? exercisesError : null,

    // Acciones
    responderEjercicio: handleResponderEjercicio,

    // Estado de respuesta
    isSubmittingAnswer,
    submitError: submitError instanceof Error ? submitError : null,
    lastResult,
  };
}
