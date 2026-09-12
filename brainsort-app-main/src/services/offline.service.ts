/**
 * offline.service.ts
 * BrainSort — Servicio de módulos offline
 *
 * task_breakdown.md T-FE-041
 *
 * Expone:
 *   - listOfflineModules(): Lista módulos disponibles para descargar
 *   - downloadModule(algoritmoId): Descarga contenido de un módulo
 *
 * Consumido por: useOfflineModules.ts hook (T-FE-051)
 *
 * Referencia: 02-frontend-app.md §1 services/offline.service.ts
 *            04-contratos-api.md §8 Offline Module
 *            CDR-004: Sin bucket externo - backend genera JSON directamente
 */

import { apiClient } from './api';
import type { PseudocodeLine } from './library.service';
import type { DificultadEjercicio } from './exercise.service';

// ─── DTOs (Response) ──────────────────────────────────────────────────────────

/** Módulo disponible para descargar (GET /api/modules/offline) */
export interface ModuloOfflineInfo {
  algoritmoId: string;
  nombre: string;
  tamanoKB: number;
  version: string;
  descargado: boolean; // Bandera local o del servidor
}

/** Ejercicio en módulo descargado */
export interface EjercicioEnModulo {
  id: string;
  pregunta: string;
  respuestaCorrecta: string;
  dificultad: DificultadEjercicio;
  feedbackPositivo: string;
  feedbackNegativo: string;
}

/** Módulo completo descargable (GET /api/modules/offline/:id/download) */
export interface ModuloOfflineCompleto {
  algoritmoId: string;
  version: string;
  meta: {
    id: string;
    nombre: string;
    descripcion: string;
    complejidadTiempo: string;
    complejidadEspacio: string;
    categoria: string;
  };
  pseudocode: PseudocodeLine[];
  ejercicios: EjercicioEnModulo[];
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Servicio de módulos offline.
 * CDR-004: El backend genera el JSON del módulo directamente desde el engine registrado.
 * No usa bucket externo.
 */
export const offlineService = {
  /**
   * Lista todos los módulos disponibles para descargar.
   * Cada módulo contiene metadatos básicos (tamaño, versión).
   *
   * @returns Lista de módulos con info de descargas
   */
  async listOfflineModules(): Promise<ModuloOfflineInfo[]> {
    return apiClient.get<ModuloOfflineInfo[]>('/modules/offline', {
      public: false, // Autenticado
    });
  },

  /**
   * Descarga el contenido completo de un módulo offline.
   * Retorna meta, pseudocódigo y ejercicios para uso sin conexión.
   *
   * Nota: El engine (`execute()`) NO se descarga — vive en `packages/core`
   * y ya está incluido en la app. Solo se descargan los datos (meta, pseudocódigo, ejercicios).
   *
   * @param algoritmoId ID del algoritmo
   * @returns Contenido completo del módulo para guardar localmente
   */
  async downloadModule(algoritmoId: string): Promise<ModuloOfflineCompleto> {
    return apiClient.get<ModuloOfflineCompleto>(
      `/modules/offline/${algoritmoId}/download`,
      { public: false }, // Autenticado
    );
  },
};
