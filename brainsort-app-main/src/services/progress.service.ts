/**
 * progress.service.ts
 * BrainSort — Servicio de progreso e insignias del usuario
 *
 * task_breakdown.md T-FE-039
 *
 * Expone:
 *   - getUserProgress(): Obtiene progreso del usuario actual
 *   - getLeaderboard(limit, offset): Obtiene ranking global
 *
 * Consumido por: useProgress.ts hook (T-FE-050)
 *
 * Referencia: 02-frontend-app.md §1 services/progress.service.ts
 *            04-contratos-api.md §6 Progress Module
 */

import { apiClient } from './api';

// ─── DTOs (Response) ──────────────────────────────────────────────────────────

/** Insignia desbloqueada por el usuario */
export interface InsigniaDesbloqueada {
  nombre: string;
  imagen: string;
  fechaObtencion: string; // ISO 8601 timestamp
}

export interface AlgoritmoProgreso {
  algoritmoId: string;
  ejerciciosCorrectos: number;
  ejerciciosTotales: number;
}

/** Progreso del usuario actual (GET /api/progreso/me) */
export interface UsuarioProgreso {
  puntosTotales: number;
  nivelActual: number;
  rachaDias: number;
  posicionRanking: number;
  ultimaActividad: string; // ISO 8601 timestamp
  insignias: InsigniaDesbloqueada[];
  simulacionesCompletadas: number;
  ejerciciosCorrectos: number;
  ejerciciosTotales: number;
  algoritmosProgreso?: AlgoritmoProgreso[];
}

/** Entrada en el leaderboard */
export interface UsuarioRanking {
  posicion: number;
  nombre: string;
  puntosTotales: number;
  nivelActual: number;
}

/** Response de GET /api/ranking */
export interface LeaderboardResponse {
  ranking: UsuarioRanking[];
  total: number;
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Servicio de progreso e insignias.
 */
export const progressService = {
  /**
   * Obtiene el progreso completo del usuario actual.
   * Incluye puntos, nivel, racha, ranking, insignias, estadísticas.
   *
   * @returns Progreso detallado del usuario autenticado
   */
  async getUserProgress(): Promise<UsuarioProgreso> {
    return apiClient.get<UsuarioProgreso>('/progreso/me', {
      public: false, // Autenticado
    });
  },

  /**
   * Obtiene el leaderboard (ranking global de usuarios).
   * Resultados paginados y ordenados por puntos descendentes.
   *
   * @param limit Máximo de entradas a retornar (defecto: 20)
   * @param offset Número de entradas a saltar para paginación (defecto: 0)
   * @returns Lista de usuarios en el ranking + total de usuarios
   *
   * @example
   * // Obtener top 20
   * const board = await progressService.getLeaderboard(20, 0);
   * // Obtener siguientes 20 (página 2)
   * const board2 = await progressService.getLeaderboard(20, 20);
   */
  async getLeaderboard(limit: number = 20, offset: number = 0): Promise<LeaderboardResponse> {
    return apiClient.get<LeaderboardResponse>(
      `/progreso/ranking?limit=${limit}&offset=${offset}`,
      { public: false }, // Autenticado
    );
  },
};
