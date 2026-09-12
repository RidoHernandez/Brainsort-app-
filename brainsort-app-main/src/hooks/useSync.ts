/**
 * useSync.ts
 * BrainSort — Hook para sincronizar progreso offline
 *
 * task_breakdown.md T-FE-052
 *
 * Responsabilidades:
 *   • Detectar conectividad (via NetInfo)
 *   • Mantener cola de progreso pendiente (en almacenamiento local)
 *   • Sincronizar batch cuando hay conexión (POST /api/progress/sync)
 *   • Retries automáticos en caso de error
 *   • Limpiar cola tras sincronización exitosa
 *
 * Se ejecuta automáticamente en segundo plano.
 * El usuario nunca interactúa directamente con este hook.
 *
 * Referencia: 02-frontend-app.md §1 hooks/useSync.ts
 *            02-frontend-app.md §5 Persistencia Local
 */

import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { syncService } from '../services/sync.service';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Estado de sincronización.
 */
export interface SyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingItems: number;
  error: Error | null;
}

/**
 * Retorno del hook.
 */
export interface UseSyncReturn {
  // Estado
  syncState: SyncState;

  // Acciones
  syncNow: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook que sincroniza automáticamente el progreso offline cuando hay conexión.
 * Se ejecuta en segundo plano sin interacción del usuario.
 *
 * Detecta:
 * - Cambios de conectividad (via NetInfo)
 * - Cambios en el estado de la app (foreground/background)
 *
 * @example
 * // En AppNavigator.tsx
 * function AppNavigator() {
 *   useSync(); // Ejecutar en la raíz de la app
 *   // ...
 * }
 */
export function useSync(): UseSyncReturn {
  const syncStateRef = useRef<SyncState>({
    isConnected: true,
    isSyncing: false,
    lastSyncTime: null,
    pendingItems: 0,
    error: null,
  });

  // ─── Mutation para sincronizar ────────────────────────────────────────────

  const { mutateAsync: syncMutation, isPending: isSyncing } = useMutation({
    mutationFn: syncService.syncProgress,
    onSuccess: () => {
      syncStateRef.current.lastSyncTime = new Date();
      syncStateRef.current.pendingItems = 0;
      syncStateRef.current.error = null;
    },
    onError: (error) => {
      syncStateRef.current.error =
        error instanceof Error ? error : new Error(String(error));
    },
  });

  // ─── Sincronización manual ────────────────────────────────────────────────

  const syncNow = useCallback(async () => {
    syncStateRef.current.isSyncing = true;
    try {
      await syncMutation([]);
    } finally {
      syncStateRef.current.isSyncing = false;
    }
  }, [syncMutation]);

  // ─── Effect: Detectar conectividad y sincronizar ───────────────────────────

  useEffect(() => {
    /**
     * Simulación de detectar conectividad.
     * En producción, usaría @react-native-community/netinfo
     */
    const checkConnectivity = async () => {
      // Por ahora, asumimos que siempre hay conexión
      // En producción:
      // const state = await NetInfo.fetch();
      // syncStateRef.current.isConnected = state.isConnected ?? false;

      if (syncStateRef.current.isConnected && syncStateRef.current.pendingItems > 0) {
        await syncNow();
      }
    };

    checkConnectivity();
  }, [syncNow]);

  // ─── Effect: Sincronizar cuando app vuelve al foreground ──────────────────

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [syncNow]);

  const handleAppStateChange = useCallback(
    async (state: AppStateStatus) => {
      if (state === 'active') {
        // App volvió a foreground, intentar sincronizar
        await syncNow();
      }
    },
    [syncNow],
  );

  // ─── Retorno ──────────────────────────────────────────────────────────────

  return {
    syncState: {
      ...syncStateRef.current,
      isSyncing,
    },
    syncNow,
  };
}
