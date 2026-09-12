/**
 * sync.service.ts
 * BrainSort — Servicio de sincronización de progreso offline
 *
 * task_breakdown.md T-FE-042
 *
 * Expone:
 *   - syncProgress(sesiones): Sincroniza sesiones offline completadas
 *
 * Consumido por: useSync.ts hook (T-FE-052)
 *
 * Referencia: 02-frontend-app.md §1 services/sync.service.ts
 *            04-contratos-api.md §9 Sync Module
 */

import { apiClient } from './api';

// ─── DTOs (Request/Response) ───────────────────────────────────────────────────

/** Sesión de simulación a sincronizar (offline) */
export interface SesionOfflineACompletar {
  algoritmoId: string;
  fechaInicio: string; // ISO 8601 timestamp
  fechaFin: string; // ISO 8601 timestamp
  pasosCompletados: number;
  completada: boolean;
}

/** Request para sincronizar progreso — POST /api/progress/sync */
export interface SyncProgressRequest {
  sesiones: SesionOfflineACompletar[];
}

/** Response de sincronización — 200 /api/progress/sync */
export interface SyncProgressResponse {
  sincronizados: number; // Cantidad de sesiones procesadas
  puntosActualizados: number; // Puntos totales otorgados en esta sincronización
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Servicio de sincronización de progreso offline.
 * Permite que el frontend sincronice sesiones que se completaron sin conexión.
 */
export const syncService = {
  /**
   * Sincroniza un lote de sesiones offline completadas.
   * El backend valida cada sesión, otorga puntos y actualiza el progreso del usuario.
   *
   * Flujo típico:
   * 1. Usuario simula algoritmo sin conexión → se guarda en SQLite/IndexedDB
   * 2. Cuando vuelve conexión, se llama a `syncProgress()`
   * 3. Backend procesa sesiones y otorga puntos
   * 4. Frontend actualiza UI con nuevo progreso
   *
   * @param sesiones Array de sesiones offline completadas
   * @returns Cantidad sincronizada + puntos otorgados
   *
   * @example
   * const result = await syncService.syncProgress([
   *   {
   *     algoritmoId: 'uuid-bubble',
 *     fechaInicio: '2026-04-06T10:00:00Z',
 *     fechaFin: '2026-04-06T10:15:00Z',
 *     pasosCompletados: 45,
 *     completada: true
 *   }
   * ]);
   * console.log(`Sincronizadas ${result.sincronizados} sesiones`);
   */
  async syncProgress(
    sesiones: SesionOfflineACompletar[],
  ): Promise<SyncProgressResponse> {
    return apiClient.post<SyncProgressResponse>(
      '/progress/sync',
      { sesiones },
      { public: false }, // Autenticado — actualiza progreso del usuario
    );
  },
};
