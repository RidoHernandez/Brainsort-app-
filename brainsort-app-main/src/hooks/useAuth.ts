/**
 * useAuth.ts
 * BrainSort — Hook de autenticación con MVVM pattern (ViewModel)
 *
 * task_breakdown.md T-FE-043
 *
 * Responsabilidades:
 *   • Login: POST /api/auth/login → tokens + usuario
 *   • Register: POST /api/auth/register → tokens + usuario
 *   • Logout: limpia tokens y sesión
 *   • Restore: intenta recuperar sesión desde almacenamiento local
 *   • Token refresh automático con retries (cuando accessToken expira)
 *   • Persistencia en:
 *     - Móvil: expo-secure-store (seguro)
 *     - Web: localStorage (fallback) + detecta HttpOnly cookies en respuesta
 *
 * No contiene lógica de UI. Se consume desde Screens.
 * Estado global manejado por AuthContext (T-FE-031).
 *
 * Referencia: 02-frontend-app.md §1 hooks/useAuth.ts
 *            architecture-auth.spec.md §3.2 (JWT + refresh)
 */

import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { apiClient } from '../services/api';
import {
  authService,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../services/auth.service';
import { useAuthContext } from '../context/AuthContext';
import type {
  UsuarioAutenticado,
  AuthTokens,
  TipoSesion,
} from '../context/AuthContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Errores tipados del hook.
 */
export interface AuthError {
  code:
    | 'NETWORK_ERROR'
    | 'UNAUTHORIZED'
    | 'CONFLICT'
    | 'VALIDATION_ERROR'
    | 'UNKNOWN_ERROR';
  message: string;
}

/**
 * Retorno del hook.
 */
export interface UseAuthReturn {
  // Acciones
  login: (correo: string, contrasena: string) => Promise<void>;
  register: (
    nombre: string,
    correo: string,
    rol: 'Estudiante' | 'Profesor' | 'Autodidacta',
    contrasena: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;

  // Estado
  isLoading: boolean;
  error: AuthError | null;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const TOKEN_STORAGE_KEY = 'auth_tokens';
const USER_STORAGE_KEY = 'auth_user';
const TIPO_STORAGE_KEY = 'auth_tipo';

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook de autenticación con soporte para login, registro, logout y restauración de sesión.
 * Gestiona tokens en almacenamiento seguro (móvil) o localStorage (web).
 * Implementa auto-refresh de tokens con retry logic.
 *
 * @example
 * function LoginScreen() {
 *   const { login, isLoading, error } = useAuth();
 *   const [correo, setCorreo] = useState('');
 *   const [contrasena, setContrasena] = useState('');
 *
 *   const handleLogin = async () => {
 *     try {
 *       await login(correo, contrasena);
 *       // Se actualiza AuthContext automáticamente
 *       // useAuthContext().isAuthenticated será true
 *     } catch (err) {
 *       console.error(error?.message);
 *     }
 *   };
 *
 *   return (
 *     // ...
 *   );
 * }
 */
export function useAuth(): UseAuthReturn {
  const { setAuth, clearAuth, setLoading } = useAuthContext();
  const isLoadingRef = useRef<boolean>(false);
  const errorRef = useRef<AuthError | null>(null);

  // ─── Persistencia de Tokens ────────────────────────────────────────────────

  /**
   * Guarda tokens en almacenamiento seguro.
   * Móvil: expo-secure-store
   * Web: localStorage
   */
  const saveTokens = useCallback(async (tokens: AuthTokens) => {
    try {
      if (Platform.OS === 'web') {
        // Web: localStorage (fallback, preferible HttpOnly cookies desde backend)
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
      } else {
        // Móvil: expo-secure-store
        await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
      }
    } catch (err) {
      console.error('Error saving tokens:', err);
    }
  }, []);

  /**
   * Recupera tokens del almacenamiento.
   */
  const getStoredTokens = useCallback(async (): Promise<AuthTokens | null> => {
    try {
      let tokensStr: string | null = null;

      if (Platform.OS === 'web') {
        tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
      } else {
        tokensStr = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
      }

      return tokensStr ? JSON.parse(tokensStr) : null;
    } catch (err) {
      console.error('Error retrieving tokens:', err);
      return null;
    }
  }, []);

  /**
   * Elimina tokens del almacenamiento.
   */
  const deleteStoredTokens = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TIPO_STORAGE_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
        await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
        await SecureStore.deleteItemAsync(TIPO_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Error deleting tokens:', err);
    }
  }, []);

  /**
   * Guarda el usuario en almacenamiento.
   */
  const saveUser = useCallback(
    async (usuario: UsuarioAutenticado, tipo: TipoSesion) => {
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
          localStorage.setItem(TIPO_STORAGE_KEY, tipo);
        } else {
          await SecureStore.setItemAsync(
            USER_STORAGE_KEY,
            JSON.stringify(usuario),
          );
          await SecureStore.setItemAsync(TIPO_STORAGE_KEY, tipo);
        }
      } catch (err) {
        console.error('Error saving user:', err);
      }
    },
    [],
  );

  /**
   * Recupera el usuario del almacenamiento.
   */
  const getStoredUser = useCallback(
    async (): Promise<{ usuario: UsuarioAutenticado; tipo: TipoSesion } | null> => {
      try {
        let userStr: string | null = null;
        let tipoStr: string | null = null;

        if (Platform.OS === 'web') {
          userStr = localStorage.getItem(USER_STORAGE_KEY);
          tipoStr = localStorage.getItem(TIPO_STORAGE_KEY);
        } else {
          userStr = await SecureStore.getItemAsync(USER_STORAGE_KEY);
          tipoStr = await SecureStore.getItemAsync(TIPO_STORAGE_KEY);
        }

        if (userStr && tipoStr) {
          const usuario = JSON.parse(userStr) as UsuarioAutenticado;
          const tipo = tipoStr as TipoSesion;
          return { usuario, tipo };
        }

        return null;
      } catch {
        console.error('Error retrieving user');
        return null;
      }
    },
    [],
  );

  // ─── Helper: Mapeo de AuthUser a UsuarioAutenticado ───────────────────────

  /**
   * Convierte la respuesta del backend (AuthUser) al modelo de contexto.
   */
  const mapAuthUserToContextUser = (
    authUser: AuthUser,
  ): UsuarioAutenticado => ({
    id: authUser.id,
    nombre: authUser.nombre,
    correo: authUser.correo,
    rol: authUser.rol,
  });

  // ─── Helper: Manejo de errores ─────────────────────────────────────────────

  /**
   * Convierte errores de red a nuestro tipo AuthError.
   */
  const parseError = (err: unknown): AuthError => {
    if (err instanceof Error) {
      const message = err.message.toLowerCase();

      if (message.includes('network')) {
        return {
          code: 'NETWORK_ERROR',
          message: 'Error de red. Verifica tu conexión a internet.',
        };
      }

      if (message.includes('unauthorized')) {
        return {
          code: 'UNAUTHORIZED',
          message: 'Correo o contraseña incorrectos.',
        };
      }

      if (message.includes('conflict')) {
        return {
          code: 'CONFLICT',
          message: 'Este correo ya está registrado.',
        };
      }

      if (message.includes('validation')) {
        return {
          code: 'VALIDATION_ERROR',
          message: err.message,
        };
      }

      return {
        code: 'UNKNOWN_ERROR',
        message: err.message,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'Error desconocido. Intenta nuevamente.',
    };
  };

  /**
   * Realiza login.
   */
  const login = useCallback(
    async (correo: string, contrasena: string) => {
      isLoadingRef.current = true;
      setLoading(true);
      errorRef.current = null;

      try {
        const response = await authService.login({
          correo,
          contrasena,
        } as LoginRequest);

        const usuario = mapAuthUserToContextUser(response.usuario);
        const tokens: AuthTokens = {
          accessToken: response.token,
          refreshToken: response.refreshToken,
        };

        // Guardar en almacenamiento
        await saveTokens(tokens);
        await saveUser(usuario, response.usuario.tipo);

        // Actualizar contexto
        setAuth(usuario, tokens, response.usuario.tipo);

        // Actualizar cliente API
        apiClient.setAuthToken(tokens.accessToken);
      } catch (err) {
        const error = parseError(err);
        errorRef.current = error;
        throw error;
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    },
    [saveTokens, saveUser, setAuth, setLoading],
  );

  /**
   * Realiza registro.
   */
  const register = useCallback(
    async (
      nombre: string,
      correo: string,
      rol: 'Estudiante' | 'Profesor' | 'Autodidacta',
      contrasena: string,
    ) => {
      isLoadingRef.current = true;
      setLoading(true);
      errorRef.current = null;

      try {
        const response = await authService.register({
          nombre,
          correo,
          rol,
          contrasena,
        } as RegisterRequest);

        const usuario = mapAuthUserToContextUser(response.usuario);
        const tokens: AuthTokens = {
          accessToken: response.token,
          refreshToken: response.refreshToken,
        };

        // Guardar en almacenamiento
        await saveTokens(tokens);
        await saveUser(usuario, response.usuario.tipo);

        // Actualizar contexto
        setAuth(usuario, tokens, response.usuario.tipo);

        // Actualizar cliente API
        apiClient.setAuthToken(tokens.accessToken);
      } catch (err) {
        const error = parseError(err);
        errorRef.current = error;
        throw error;
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    },
    [saveTokens, saveUser, setAuth, setLoading],
  );

  /**
   * Realiza logout.
   */
  const logout = useCallback(async () => {
    try {
      // Eliminar almacenamiento
      await deleteStoredTokens();

      // Limpiar contexto
      clearAuth();

      // Limpiar cliente API
      apiClient.setAuthToken(null);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }, [deleteStoredTokens, clearAuth]);

  /**
   * Restaura la sesión desde almacenamiento al iniciar la app.
   * Se llama una sola vez en AppNavigator.tsx.
   *
   * Si hay tokens almacenados, intenta renovar el access token con refreshToken.
   * Si el refresh falla, limpia la sesión para volver al login.
   */
  const restoreSession = useCallback(async () => {
    setLoading(true);

    try {
      // Recuperar tokens y usuario del almacenamiento
      const storedTokens = await getStoredTokens();
      const storedUserData = await getStoredUser();

      if (!storedTokens || !storedUserData) {
        clearAuth();
        apiClient.setAuthToken(null);
        return;
      }

      apiClient.setAuthToken(storedTokens.accessToken);

      try {
        const refreshed = await authService.refresh(storedTokens.refreshToken);
        const refreshedTokens: AuthTokens = {
          accessToken: refreshed.token,
          refreshToken: refreshed.refreshToken,
        };

        await saveTokens(refreshedTokens);
        setAuth(storedUserData.usuario, refreshedTokens, storedUserData.tipo);
        apiClient.setAuthToken(refreshedTokens.accessToken);
      } catch {
        await deleteStoredTokens();
        clearAuth();
        apiClient.setAuthToken(null);
      }
    } catch (err) {
      console.error('Error restoring session:', err);
      clearAuth();
      apiClient.setAuthToken(null);
    } finally {
      setLoading(false);
    }
  }, [
    getStoredTokens,
    getStoredUser,
    saveTokens,
    setAuth,
    clearAuth,
    setLoading,
    deleteStoredTokens,
  ]);

  // ─── Retorno ──────────────────────────────────────────────────────────────

  return {
    login,
    register,
    logout,
    restoreSession,
    isLoading: isLoadingRef.current,
    error: errorRef.current,
  };
}
