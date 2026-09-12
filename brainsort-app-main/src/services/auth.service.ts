/**
 * auth.service.ts
 * BrainSort — Servicio de autenticación
 *
 * task_breakdown.md T-FE-035
 *
 * Expone:
 *   - register(nombre, correo, rol, contrasena): Crea nuevo Usuario
 *   - login(correo, contrasena): Autentica y retorna tokens
 *   - refresh(refreshToken): Renueva accessToken
 *
 * Consumido por: useAuth.ts hook (T-FE-043)
 *
 * Referencia: 02-frontend-app.md §1 services/auth.service.ts
 *            04-contratos-api.md §1 Auth Module
 */

import { apiClient } from './api';

// ─── DTOs (Request) ───────────────────────────────────────────────────────────

/** DTO para registro de usuario — POST /api/auth/register */
export interface RegisterRequest {
  nombre: string;
  correo: string;
  rol: 'Estudiante' | 'Profesor' | 'Autodidacta';
  contrasena: string;
}

/** DTO para login — POST /api/auth/login */
export interface LoginRequest {
  correo: string;
  contrasena: string;
}

/** DTO para refresh de token — POST /api/auth/refresh */
export interface RefreshRequest {
  refreshToken: string;
}

// ─── DTOs (Response) ──────────────────────────────────────────────────────────

/** Datos del usuario en respuesta de auth */
export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
  rol: 'Estudiante' | 'Profesor' | 'Autodidacta' | 'Administrador';
  tipo: 'usuario' | 'administrador';
}

/** Response de registro — 201 /api/auth/register */
export interface RegisterResponse {
  token: string;
  refreshToken: string;
  usuario: AuthUser;
}

/** Response de login — 200 /api/auth/login */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  usuario: AuthUser;
}

/** Response de refresh — 200 /api/auth/refresh */
export interface RefreshResponse {
  token: string;
  refreshToken: string;
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

/**
 * Servicio de autenticación que se comunica con el backend.
 * No contiene lógica de persistencia de tokens (eso vive en useAuth hook).
 */
export const authService = {
  /**
   * Registra un nuevo usuario.
   *
   * @param data Datos de registro
   * @returns Usuario autenticado + tokens
   *
   * @throws Error si el correo ya existe (409) o validación falla (400)
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('/auth/register', data, {
      public: true,
    });
  },

  /**
   * Autentica un usuario existente.
   *
   * @param data Credenciales (correo + contraseña)
   * @returns Usuario autenticado + tokens
   *
   * @throws Error si credenciales son incorrectas (401)
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', data, {
      public: true,
    });
  },

  /**
   * Renueva el access token usando el refresh token.
   * Se llama cuando el access token ha expirado (15 minutos).
   *
   * @param refreshToken Token de renovación
   * @returns Nuevos tokens (accessToken + refreshToken)
   *
   * @throws Error si el refreshToken es inválido o ha expirado (7 días)
   */
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return apiClient.post<RefreshResponse>(
      '/auth/refresh',
      { refreshToken },
      { public: true },
    );
  },
};
