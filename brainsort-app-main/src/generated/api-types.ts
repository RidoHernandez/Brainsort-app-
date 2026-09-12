/**
 * api-types.ts
 * BrainSort — Tipos TypeScript auto-generados desde el contrato Swagger del backend
 *
 * ⚠️  ARCHIVO AUTO-GENERADO — NO EDITAR MANUALMENTE
 *
 * task_breakdown.md T-FE-030
 *
 * Generado con:
 *   npm run generate:api-types
 *
 * Que ejecuta internamente:
 *   openapi-typescript https://brainsort-api.railway.app/api/docs-json \
 *     --output src/generated/api-types.ts
 *
 * Referencia: 02-frontend-app.md §7 "Generación de Tipos desde Swagger"
 *
 * En desarrollo local (backend levantado en puerto 3000):
 *   npm run generate:api-types:local
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Este archivo es un PLACEHOLDER vacío.
 * Se sobreescribirá automáticamente cuando el backend esté disponible
 * y se ejecute el script de generación.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Raíz de los paths de la API — generado por openapi-typescript.
 * Este tipo será sobreescrito por el script de generación.
 *
 * Ejemplo de uso tras la generación:
 *   import type { paths, components } from '../generated/api-types';
 *
 *   type LoginBody =
 *     paths['/api/auth/login']['post']['requestBody']['content']['application/json'];
 *
 *   type AlgoritmoResponse =
 *     components['schemas']['AlgorithmResponseDto'];
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface paths {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface components {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface operations {}
