/**
 * platform.ts
 * BrainSort — Detección de plataforma (web / ios / android)
 *
 * task_breakdown.md T-FE-027
 *
 * Centraliza la lógica de detección de plataforma para que ningún componente
 * o hook importe `Platform` de react-native directamente cuando necesite
 * tomar decisiones de plataforma.
 *
 * Uso:
 *   import { isWeb, isMobile, platformSelect } from '../utils/platform';
 *   if (isWeb) { ... }
 *   const tokenKey = platformSelect({ web: 'cookie', native: 'secureStore' });
 */

import { Platform, PlatformOSType } from 'react-native';

// ─── Plataforma actual ────────────────────────────────────────────────────────

/** OS string tal como lo expone React Native: 'ios' | 'android' | 'web' | 'windows' | 'macos' */
export const currentOS: PlatformOSType = Platform.OS;

// ─── Flags booleanos ──────────────────────────────────────────────────────────

/** true cuando se ejecuta en un navegador web (Expo Web / PWA) */
export const isWeb: boolean = Platform.OS === 'web';

/** true en cualquier plataforma nativa (iOS o Android) */
export const isMobile: boolean = Platform.OS === 'ios' || Platform.OS === 'android';

/** true exclusivamente en iOS */
export const isIOS: boolean = Platform.OS === 'ios';

/** true exclusivamente en Android */
export const isAndroid: boolean = Platform.OS === 'android';

/** true cuando se ejecuta en dispositivos de escritorio (Expo Desktop — experimental) */
export const isDesktop: boolean = Platform.OS === 'windows' || Platform.OS === 'macos';

// ─── Helpers de selección por plataforma ─────────────────────────────────────

/**
 * Devuelve el valor correspondiente a la plataforma actual.
 * Similar a Platform.select() pero tipado de forma más ergonómica.
 *
 * @example
 * const tokenStorage = platformSelect({
 *   web: 'httpOnly-cookie',
 *   native: 'expo-secure-store',
 * });
 */
export function platformSelect<T>(options: {
  web: T;
  native: T;
  ios?: T;
  android?: T;
}): T {
  if (Platform.OS === 'ios' && options.ios !== undefined) return options.ios;
  if (Platform.OS === 'android' && options.android !== undefined) return options.android;
  if (Platform.OS === 'web') return options.web;
  return options.native;
}

// ─── Estrategia de almacenamiento de tokens JWT ───────────────────────────────

/**
 * Estrategia de almacenamiento de tokens según plataforma.
 * Referencia: 02-frontend-app.md §5 "Persistencia Local"
 *
 * - Móvil: expo-secure-store (cifrado en el keychain/keystore del SO)
 * - Web: HttpOnly cookies (manejadas por el servidor para evitar XSS)
 */
export type TokenStorageStrategy = 'secureStore' | 'httpOnlyCookie';

export const tokenStorageStrategy: TokenStorageStrategy = isWeb
  ? 'httpOnlyCookie'
  : 'secureStore';

// ─── Estrategia de almacenamiento local (offline) ─────────────────────────────

/**
 * Motor de base de datos local según plataforma.
 * Referencia: 02-frontend-app.md §5 "Adaptador por Plataforma"
 *
 * - Móvil: expo-sqlite
 * - Web: IndexedDB
 */
export type LocalDBStrategy = 'sqlite' | 'indexeddb';

export const localDBStrategy: LocalDBStrategy = isWeb ? 'indexeddb' : 'sqlite';

// ─── Feature flags por plataforma ────────────────────────────────────────────

/**
 * Capacidades disponibles según plataforma.
 * Referencia: constitution.md §2 "Sandboxing", 02-frontend-app.md §6
 */
export const platformCapabilities = {
  /** WASM disponible solo en Android (restricciones de Apple en iOS) */
  wasmSupported: isAndroid,
  /** Web Workers disponibles solo en Web */
  webWorkersSupported: isWeb,
  /** WebView sandbox disponible en móvil */
  webViewSandboxSupported: isMobile,
  /** expo-file-system disponible en móvil */
  fileSystemSupported: isMobile,
  /** expo-secure-store disponible en móvil */
  secureStoreSupported: isMobile,
} as const;
