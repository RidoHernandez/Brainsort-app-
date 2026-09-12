/**
 * exercise.service.ts
 * BrainSort — Servicio de ejercicios de predicción
 *
 * task_breakdown.md T-FE-038
 *
 * Expone:
 *   - getExercises(algoritmoId): Obtiene ejercicios de un algoritmo
 *   - answerExercise(ejercicioId, respuesta): Evalúa respuesta
 *
 * Consumido por: useExercise.ts hook (T-FE-049)
 *
 * Referencia: 02-frontend-app.md §1 services/exercise.service.ts
 *            04-contratos-api.md §5 Exercises Module
 */

import { apiClient } from './api';

// ─── DTOs (Response) ──────────────────────────────────────────────────────────

/** Dificultad de un ejercicio */
export type DificultadEjercicio = 'Facil' | 'Medio' | 'Dificil';
export type TipoEjercicio =
  | 'PrediccionTexto'
  | 'CompletarPseudocodigo'
  | 'OrdenarBarras';

export interface PseudocodeExerciseContent {
  antes?: string;
  despues?: string;
}

export interface BarsExerciseContent {
  inicial?: number[];
  objetivo?: number[];
  pasoObjetivo?: string;
}

/** Ejercicio de predicción (GET /api/ejercicios/:algoritmoId) */
export interface Ejercicio {
  id: string;
  tipo: TipoEjercicio;
  pregunta: string;
  dificultad: DificultadEjercicio;
  algoritmoId: string;
  opciones?: string[];
  contenido?: PseudocodeExerciseContent | BarsExerciseContent | null;
}

/** Response de GET /api/ejercicios/:algoritmoId */
export type GetExercisesResponse = Ejercicio[];

// ─── DTOs (Request/Response) ──────────────────────────────────────────────────

/** Request para responder ejercicio — POST /api/ejercicios/:id/responder */
export interface AnswerExerciseRequest {
  respuesta: string;
}

/** Progreso del usuario tras responder ejercicio */
export interface UsuarioProgresoActualizado {
  rachaDias: number;
  posicionRanking: number;
  nivelActual: number;
}

/** Response si respuesta es correcta — 200 /api/ejercicios/:id/responder */
export interface ExerciseResultCorrect {
  correcto: true;
  feedback: string;
  feedbackPositivo: string;
  puntosGanados: number;
  puntosTotales: number;
  rachaDias: number;
  posicionRanking: number;
  nivelActual: number;
}

/** Response si respuesta es incorrecta — 200 /api/ejercicios/:id/responder */
export interface ExerciseResultIncorrect {
  correcto: false;
  feedback: string;
  feedbackNegativo: string;
  puntosGanados: 0;
  puntosTotales: number;
  rachaDias: number;
  posicionRanking: number;
  nivelActual: number;
}

/** Response unificada */
export type ExerciseResult = ExerciseResultCorrect | ExerciseResultIncorrect;

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Servicio de ejercicios de predicción.
 */
export const exerciseService = {
  /**
   * Obtiene todos los ejercicios de predicción de un algoritmo.
   *
   * @param algoritmoId ID del algoritmo
   * @returns Lista de ejercicios disponibles
   */
  async getExercises(algoritmoId: string): Promise<Ejercicio[]> {
    return apiClient.get<Ejercicio[]>(`/ejercicios/${algoritmoId}`, {
      public: false, // Autenticado
    });
  },

  /**
   * Envía respuesta a un ejercicio de predicción.
   * El backend valida la respuesta, otorga puntos y actualiza progreso.
   *
   * @param ejercicioId ID del ejercicio
   * @param respuesta Respuesta del usuario
   * @returns Resultado: correcto/incorrecto + feedback + progreso actualizado
   */
  async answerExercise(
    ejercicioId: string,
    respuesta: string,
  ): Promise<ExerciseResult> {
    return apiClient.post<ExerciseResult>(
      `/ejercicios/${ejercicioId}/responder`,
      { respuesta },
      { public: false }, // Autenticado — otorga puntos al usuario
    );
  },
};
