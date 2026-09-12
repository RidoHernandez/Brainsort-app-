/**
 * simulation.service.ts
 * BrainSort — Servicio de simulaciones de algoritmos
 *
 * task_breakdown.md T-FE-037
 *
 * Expone:
 *   - runSimulation(algoritmoId, conjuntoDeDatos): Ejecuta el engine en el backend (CO3)
 *
 * Consumido por: useSimulationEngine.ts hook (T-FE-047)
 *
 * Referencia: 02-frontend-app.md §1 services/simulation.service.ts
 *            04-contratos-api.md §4 Simulations Module
 */

import { apiClient } from './api';
import type { SimulationStep } from '@brainsort/core';
export type { SimulationMarker, SimulationTreeNode } from '@brainsort/core';

// ─── DTOs (Request) ───────────────────────────────────────────────────────────

/** Conjunto de datos para simular */
export interface ConjuntoDatos {
  valores: number[]; // Si tipoOrigen === "Predeterminado", se ignora
  tipoOrigen: 'Predeterminado' | 'Personalizado';
  tamano: number; // Debe coincidir con valores.length
}

/** Request para ejecutar simulación — POST /api/simulaciones (CO3) */
export interface RunSimulationRequest {
  algoritmoId: string;
  conjuntoDeDatos: ConjuntoDatos;
}

// ─── DTOs (Response) ──────────────────────────────────────────────────────────

/** Estado de la simulación en inicio */
export interface EstadoSimulacion {
  velocidadReproduccion: number;
  estadoActual: string; // "Pausa", "Reproduciendo", etc.
  pasoActual: number;
}

/** Línea de pseudocódigo */
export interface PseudocodeLine {
  line: number;
  text: string;
  indent: number;
}

/** Response de POST /api/simulaciones (CO3) */
export interface RunSimulationResponse {
  simulacion: EstadoSimulacion;
  pseudocode: PseudocodeLine[];
  totalPasos: number;
  pasos: SimulationStep[];
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Servicio de simulaciones.
 * Implementa el contrato CO3.
 */
export const simulationService = {
  /**
   * Ejecuta el engine del algoritmo en el backend y retorna los pasos.
   * (CO3: getSimulation())
   *
   * @param request Algoritmo a ejecutar + conjunto de datos
   * @returns Estado inicial de simulación + pasos generados + pseudocódigo
   *
   * @throws Error si:
   *   - algoritmoId no existe (404)
   *   - Datos de entrada inválidos (400)
   *   - Engine tardó >10 segundos (408 - Timeout)
   */
  async runSimulation(
    request: RunSimulationRequest,
  ): Promise<RunSimulationResponse> {
    return apiClient.post<RunSimulationResponse>(
      '/simulaciones',
      request,
      { public: false }, // Autenticado — asocia con cuenta del usuario
    );
  },
};
