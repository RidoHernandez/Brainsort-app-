/**
 * AuthContext.tsx
 * BrainSort — Contexto global de autenticación
 *
 * task_breakdown.md T-FE-031
 *
 * Expone:
 *   - usuario actual (id, nombre, correo, rol)
 *   - tokens (accessToken + refreshToken)
 *   - tipo de sesión: 'usuario' | 'administrador' | null
 *   - estado de carga
 *   - helpers: setTokens, clearAuth
 *
 * No contiene lógica de login/register — eso vive en useAuth.ts (T-FE-043).
 * Este contexto es el "store" global; el hook es el ViewModel.
 *
 * Referencia: 02-frontend-app.md §1 context/AuthContext.tsx
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

// ─── Tipos de Dominio ─────────────────────────────────────────────────────────

/**
 * Rol del usuario — alineado con Enum `Rol` del backend (T-BE-011).
 */
export type RolUsuario =
  | 'Estudiante'
  | 'Profesor'
  | 'Autodidacta'
  | 'Administrador';

/**
 * Tipo de sesión — alineado con campo `tipo` del JWT payload (T-BE-092).
 */
export type TipoSesion = 'usuario' | 'administrador';

/**
 * Perfil mínimo del usuario autenticado almacenado en contexto.
 * Se popula desde la respuesta del login o desde GET /api/users/me.
 */
export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

/**
 * Par de tokens JWT manejados en el contexto.
 * Referencia: 02-frontend-app.md §5 "Tokens JWT"
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── Estado del Contexto ──────────────────────────────────────────────────────

export interface AuthState {
  /** Perfil del usuario autenticado; null si no hay sesión */
  usuario: UsuarioAutenticado | null;
  /** Tokens JWT activos; null si no hay sesión */
  tokens: AuthTokens | null;
  /** Tipo de sesión: 'usuario' | 'administrador' | null */
  tipo: TipoSesion | null;
  /** true mientras se restaura la sesión desde almacenamiento local */
  isLoading: boolean;
  /** true cuando hay una sesión activa */
  isAuthenticated: boolean;
}

// ─── Acciones del Contexto ────────────────────────────────────────────────────

export interface AuthActions {
  /**
   * Establece tokens y perfil de usuario tras un login o refreshToken exitoso.
   * Llamado exclusivamente desde useAuth (T-FE-043).
   */
  setAuth: (
    usuario: UsuarioAutenticado,
    tokens: AuthTokens,
    tipo: TipoSesion,
  ) => void;
  /**
   * Actualiza solo los tokens (sin cambiar el perfil del usuario).
   * Usado en el flujo de renovación de accessToken.
   */
  setTokens: (tokens: AuthTokens) => void;
  /**
   * Limpia toda la sesión (logout).
   * El almacenamiento físico de tokens (secureStore / cookie)
   * es responsabilidad de useAuth (T-FE-043).
   */
  clearAuth: () => void;
  /**
   * Marca que la carga inicial de sesión ha terminado.
   * Llamado por useAuth después de intentar restaurar la sesión.
   */
  setLoading: (value: boolean) => void;
}

// ─── Valor del Contexto ───────────────────────────────────────────────────────

export type AuthContextValue = AuthState & AuthActions;

// ─── Creación del Contexto ────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
AuthContext.displayName = 'AuthContext';

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [tokens, setTokensState] = useState<AuthTokens | null>(null);
  const [tipo, setTipo] = useState<TipoSesion | null>(null);
  const [isLoading, setIsLoadingState] = useState<boolean>(true);

  // ─── Acciones ──────────────────────────────────────────────────────────────

  const setAuth = useCallback(
    (
      nuevoUsuario: UsuarioAutenticado,
      nuevosTokens: AuthTokens,
      nuevoTipo: TipoSesion,
    ) => {
      setUsuario(nuevoUsuario);
      setTokensState(nuevosTokens);
      setTipo(nuevoTipo);
    },
    [],
  );

  const setTokens = useCallback((nuevosTokens: AuthTokens) => {
    setTokensState(nuevosTokens);
  }, []);

  const clearAuth = useCallback(() => {
    setUsuario(null);
    setTokensState(null);
    setTipo(null);
  }, []);

  const setLoading = useCallback((value: boolean) => {
    setIsLoadingState(value);
  }, []);

  // ─── Valor memoizado ───────────────────────────────────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      tokens,
      tipo,
      isLoading,
      isAuthenticated: usuario !== null && tokens !== null,
      setAuth,
      setTokens,
      clearAuth,
      setLoading,
    }),
    [usuario, tokens, tipo, isLoading, setAuth, setTokens, clearAuth, setLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────

/**
 * Hook para consumir el AuthContext.
 * Lanza un error si se usa fuera de <AuthProvider>.
 *
 * @example
 * const { usuario, isAuthenticated, clearAuth } = useAuthContext();
 */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuthContext debe usarse dentro de <AuthProvider>.');
  }
  return ctx;
}
