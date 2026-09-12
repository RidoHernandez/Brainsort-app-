/**
 * api.ts
 * BrainSort — Instancia base de fetch con interceptores para JWT y manejo de errores
 *
 * task_breakdown.md T-FE-034
 *
 * Expone:
 *   - apiClient: instancia configurada de fetch con:
 *     • Base URL desde env variable EXPO_PUBLIC_API_URL
 *     • Interceptor de request: adjunta Authorization: Bearer <token>
 *     • Interceptor de response: manejo de errores estándar
 *   - Métodos de conveniencia: apiClient.get(), .post(), .patch(), .delete()
 *
 * Consumido por: auth.service.ts, library.service.ts, simulation.service.ts, etc.
 *
 * Referencia: 02-frontend-app.md §1 services/api.ts
 */

import { useAuthContext } from '../context/AuthContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Formato estándar de respuesta exitosa del backend.
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

/**
 * Formato estándar de respuesta de error del backend.
 */
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

/**
 * Opciones de configuración para peticiones.
 */
export interface RequestOptions extends RequestInit {
  /** Si true, no incluye el token en el Authorization header */
  public?: boolean;
}

// ─── Configuración ────────────────────────────────────────────────────────────

/** URL base de la API desde variable de entorno */
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// ─── Clase ApiClient ──────────────────────────────────────────────────────────

/**
 * Cliente HTTP con soporte para interceptores de request/response y manejo de errores.
 * Gestiona automáticamente tokens JWT desde el contexto de autenticación.
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Realiza una petición fetch con manejo automático de errores y tokens JWT.
   * Nota: El token se obtiene dinámicamente desde el contexto auth en el momento de la petición.
   *
   * @param endpoint Ruta relativa (ej: '/biblioteca', '/usuarios/me')
   * @param options Opciones de RequestInit + { public?: boolean }
   * @returns Response parseada como JSON o error tipado
   */
  private async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { public: isPublic = false, ...fetchOptions } = options;

    const url = `${this.baseUrl}${endpoint}`;

    // ─── Headers base ──────────────────────────────────────────────────────

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merging de headers adicionales si existen
    if (fetchOptions.headers && typeof fetchOptions.headers === 'object') {
      const additionalHeaders = fetchOptions.headers as Record<string, string>;
      Object.assign(headers, additionalHeaders);
    }

    // ─── Inyectar token JWT (solo si la petición NO es pública) ────────────
    // Nota: Esto es un patrón simplificado. En producción, se puede mejorar
    // usando un hook que actualice el cliente de forma global.
    // Por ahora, cada petición intenta obtener el token del contexto.

    // Problema: `useAuthContext()` solo funciona dentro de componentes React.
    // Solución: Pasar el token como parámetro desde el hook del componente,
    // o usar un store externo (zustand, redux, etc.).
    //
    // Para esta implementación, asumimos que el token se pasa explícitamente
    // desde el servicio que lo consume, O usamos un patrón callback.

    // Por ahora, creamos una versión que permite inyectar el token desde afuera:
    // (Ver método `setAuthToken()` más abajo)

    if (!isPublic && this.currentToken) {
      headers['Authorization'] = `Bearer ${this.currentToken}`;
    }

    // ─── Realizar petición ─────────────────────────────────────────────────

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } catch (error) {
      // Error de red (no hay conexión, timeout, etc.)
      throw new Error(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }

    // ─── Procesar respuesta ────────────────────────────────────────────────

    const isJson =
      response.headers.get('content-type')?.includes('application/json') ??
      false;
    const body = isJson ? await response.json() : null;

    // ✅ Respuesta exitosa (2xx)
    if (response.ok) {
      return (body?.data ?? body) as T;
    }

    // ❌ Error HTTP
    const apiError: ApiError = body ?? {
      statusCode: response.status,
      message: response.statusText,
      error: 'Unknown error',
    };

    // Casos especiales de error
    if (response.status === 401) {
      // Token expirado o inválido
      // En un flujo más sofisticado, aquí se podría intentar renovar el token
      // Ejemplo:
      // if (refreshToken) {
      //   const newTokens = await this.refreshAuth(refreshToken);
      //   headers['Authorization'] = `Bearer ${newTokens.token}`;
      //   return this.request<T>(endpoint, { ...options, headers });
      // }
      throw new Error('Unauthorized. Please login again.');
    }

    if (response.status === 429) {
      // Rate limit
      throw new Error(
        'Too many requests. Please wait before trying again.',
      );
    }

    if (response.status === 408) {
      // Timeout (usado por engine cuando tarda >10s)
      throw new Error(
        'Request timeout. The algorithm took too long to execute.',
      );
    }

    // Error genérico
    throw new Error(apiError.message || 'Request failed');
  }

  /**
   * Token actual a usar en los headers.
   * Se actualiza mediante `setAuthToken()`.
   */
  private currentToken: string | null = null;

  /**
   * Establece el token JWT a usar en peticiones futuras.
   * Llamado desde el hook useAuth cuando se hace login/refresh.
   */
  setAuthToken(token: string | null): void {
    this.currentToken = token;
  }

  // ─── Métodos de conveniencia ──────────────────────────────────────────────

  /**
   * GET /endpoint
   */
  async get<T = unknown>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST /endpoint
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH /endpoint
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE /endpoint
   */
  async delete<T = unknown>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Establece la base URL de la API (útil para testing).
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// ─── Instancia global ─────────────────────────────────────────────────────────

export const apiClient = new ApiClient(API_BASE_URL);

// ─── Hook para sincronizar token con contexto AuthContext ─────────────────────

/**
 * Hook que sincroniza el token del contexto de autenticación con el cliente API.
 * Debe llamarse una sola vez en la raíz de la app (AppNavigator.tsx o App.tsx).
 *
 * @example
 * // En AppNavigator.tsx
 * export function AppNavigator() {
 *   useApiTokenSync();
 *   return <MainTabNavigator />;
 * }
 */
export function useApiTokenSync(): void {
  const { tokens } = useAuthContext();

  // Actualizar el token en el cliente API cada vez que cambie
  apiClient.setAuthToken(tokens?.accessToken ?? null);
}
