/**
 * library.service.ts
 * BrainSort — Servicio de biblioteca de algoritmos
 *
 * task_breakdown.md T-FE-036
 *
 * Expone:
 *   - getLibrary(): Obtiene todos los algoritmos agrupados por categoría (CO1)
 *   - getAlgorithm(id): Obtiene detalle de un algoritmo con pseudocódigo (CO2)
 *
 * Consumido por: useLibrary.ts hook (T-FE-044), useAlgorithm.ts hook (T-FE-045)
 *
 * Referencia: 02-frontend-app.md §1 services/library.service.ts
 *            04-contratos-api.md §3 Algorithms Module
 */

import { apiClient } from './api';

// ─── DTOs (Response) ──────────────────────────────────────────────────────────

/** Línea de pseudocódigo */
export interface PseudocodeLine {
  line: number;
  text: string;
  indent: number;
}

/** Algoritmo en la lista de biblioteca (CO1) */
export interface AlgoritmoEnBiblioteca {
  id: string;
  nombre: string;
  descripcion: string; // ≤140 chars en UI
  complejidadTiempo: string; // Ej: "O(n²)"
  complejidadEspacio: string; // Ej: "O(1)"
  categoria: string; // "Ordenamiento", "Busqueda", "EstructurasLineales"
  dificultad?: string; // "Facil" | "Medio" | "Dificil"
  tags?: string[];
}

/** Response de GET /api/biblioteca (CO1) */
export interface LibraryResponse {
  categorias: string[];
  totalAlgoritmos: number;
  algoritmos: AlgoritmoEnBiblioteca[];
}

/** Algoritmo con detalle completo (CO2) */
export interface AlgoritmoDetalle extends AlgoritmoEnBiblioteca {
  pseudocode: PseudocodeLine[];
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Servicio de biblioteca de algoritmos.
 * Implementa los contratos CO1 y CO2.
 */
export const libraryService = {
  /**
   * Obtiene la biblioteca completa de algoritmos agrupados por categoría. (CO1)
   * Acceso: Público o Autenticado
   *
   * @returns Categorías, total de algoritmos y lista de algoritmos
   */
  async getLibrary(): Promise<LibraryResponse> {
    return apiClient.get<LibraryResponse>('/biblioteca', {
      public: true, // Endpoint es público según spec
    });
  },

  /**
   * Obtiene el detalle completo de un algoritmo con pseudocódigo. (CO2)
   * Acceso: Autenticado (crea SesionSimulacion)
   *
   * @param algoritmoId ID del algoritmo a obtener
   * @returns Algoritmo con pseudocódigo completo
   *
   * @throws Error si algoritmoId no existe (404)
   */
  async getAlgorithm(algoritmoId: string): Promise<AlgoritmoDetalle> {
    return apiClient.get<AlgoritmoDetalle>(`/algoritmos/${algoritmoId}`, {
      public: false, // Endpoint autenticado
    });
  },
};
