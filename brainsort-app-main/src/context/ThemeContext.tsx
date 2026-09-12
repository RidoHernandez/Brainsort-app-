/**
 * ThemeContext.tsx
 * BrainSort — Contexto global de tema visual (dark/light)
 *
 * task_breakdown.md T-FE-033
 *
 * Expone:
 *   - Tema actual (Theme object con colores, tipografía, espaciado, etc.)
 *   - Modo actual (dark | light)
 *   - Helpers para cambiar tema (toggleTheme, setThemeMode)
 *
 * No contiene lógica de persistencia en storage — eso vive en useTheme hook.
 * Este contexto es el "store" global; el hook es el ViewModel.
 *
 * Referencia: 02-frontend-app.md §1 context/ThemeContext.tsx
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { Theme, ThemeMode } from '../styles/theme';
import { getTheme } from '../styles/theme';

// ─── Estado del Contexto ──────────────────────────────────────────────────────

export interface ThemeState {
  /** Modo de tema actual: 'dark' | 'light' */
  mode: ThemeMode;
  /** Objeto de tema completo con colores, tipografía, espaciado, etc. */
  theme: Theme;
}

// ─── Acciones del Contexto ────────────────────────────────────────────────────

export interface ThemeActions {
  /**
   * Cambia el modo de tema a 'dark' o 'light'.
   * Actualiza automáticamente el objeto `theme`.
   */
  setThemeMode: (mode: ThemeMode) => void;

  /**
   * Alterna entre 'dark' y 'light'.
   * Conveniencia: toggleTheme() es equivalente a
   * setThemeMode(mode === 'dark' ? 'light' : 'dark')
   */
  toggleTheme: () => void;
}

// ─── Valor del Contexto ───────────────────────────────────────────────────────

export type ThemeContextValue = ThemeState & ThemeActions;

// ─── Creación del Contexto ────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
ThemeContext.displayName = 'ThemeContext';

// ─── Estado Inicial ───────────────────────────────────────────────────────────

const INITIAL_MODE: ThemeMode = 'dark';
const INITIAL_THEME = getTheme(INITIAL_MODE);

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({
  children,
}: ThemeProviderProps): React.JSX.Element {
  const [mode, setModeState] = useState<ThemeMode>(INITIAL_MODE);
  const [theme, setThemeState] = useState<Theme>(INITIAL_THEME);

  // ─── Acciones ──────────────────────────────────────────────────────────────

  const setThemeMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    const newTheme = getTheme(newMode);
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setThemeMode]);

  // ─── Valor memoizado ───────────────────────────────────────────────────────

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      theme,
      setThemeMode,
      toggleTheme,
    }),
    [mode, theme, setThemeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────

/**
 * Hook para consumir el ThemeContext.
 * Lanza un error si se usa fuera de <ThemeProvider>.
 *
 * @example
 * const { theme, mode, toggleTheme } = useThemeContext();
 * <View style={{ backgroundColor: theme.colors.background }} />
 */
export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    throw new Error(
      'useThemeContext debe usarse dentro de <ThemeProvider>.',
    );
  }
  return ctx;
}
