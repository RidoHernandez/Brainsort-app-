/**
 * badges.service.ts
 * BrainSort — Servicio de insignias
 *
 * task_breakdown.md T-FE-040
 *
 * Expone:
 *   - getAllBadges(): Obtiene todas las insignias disponibles
 *   - getUserBadges(): Obtiene insignias desbloqueadas por el usuario actual
 *
 * Consumido por: useProgress.ts hook (T-FE-050) o componente BadgeCard
 *
 * Referencia: 02-frontend-app.md §1 services/badges.service.ts
 *            04-contratos-api.md §7 Badges Module
 */

import { apiClient } from './api';

// ─── DTOs (Response) ──────────────────────────────────────────────────────────

/** Insignia disponible en el sistema (GET /api/insignias) */
export interface Insignia {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  criterioDesbloqueo: string; // Descripción del criterio (ej: "Completar 1 simulación")
}

/** Insignia desbloqueada por el usuario (GET /api/insignias/me) */
export interface InsigniaDesbloqueada {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  fechaObtencion: string; // ISO 8601 timestamp
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Servicio de insignias.
 */
export const badgesService = {
  /**
   * Obtiene todas las insignias disponibles en el sistema.
   * Incluye insignias desbloqueadas y no desbloqueadas.
   *
   * @returns Lista completa de insignias con criterios de desbloqueo
   */
  async getAllBadges(): Promise<Insignia[]> {
    return apiClient.get<Insignia[]>('/insignias', {
      public: false, // Autenticado (aunque podría ser público)
    });
  },

  /**
   * Obtiene las insignias desbloqueadas por el usuario actual.
   * Incluye fecha de obtención.
   *
   * @returns Insignias ya ganadas por el usuario con fechas
   */
  async getUserBadges(): Promise<InsigniaDesbloqueada[]> {
    return apiClient.get<InsigniaDesbloqueada[]>('/insignias/me', {
      public: false, // Autenticado
    });
  },
};
