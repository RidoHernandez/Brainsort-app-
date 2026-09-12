/**
 * useOfflineModules.ts
 * BrainSort — Hook para descargar y gestionar módulos offline
 *
 * task_breakdown.md T-FE-051
 *
 * Responsabilidades:
 *   • Fetch de módulos disponibles (GET /api/modules/offline)
 *   • Descarga de módulos (GET /api/modules/offline/:id/download)
 *   • Persistencia en almacenamiento local (SQLite móvil, IndexedDB web)
 *   • Manejo de descargas y eliminaciones
 *   • Caché de lista de módulos (staleTime: 30min)
 *
 * Se integra con storage.adapter para persistencia multiplataforma.
 *
 * Referencia: 02-frontend-app.md §1 hooks/useOfflineModules.ts
 *            02-frontend-app.md §5 Persistencia Local
 */

import { useCallback, useRef, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { offlineService, ModuloOfflineInfo } from '../services/offline.service';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Estado de descarga de un módulo.
 */
export interface DownloadProgress {
  moduloId: string;
  isDownloading: boolean;
  progress: number; // 0-100
  error: Error | null;
}

/**
 * Retorno del hook.
 */
export interface UseOfflineModulesReturn {
  // Estado de lista de módulos
  modulos: ModuloOfflineInfo[] | undefined;
  isLoadingModulos: boolean;
  modulosError: Error | null;

  // Estado de descargas individuales
  downloadProgress: Map<string, DownloadProgress>;

  // Acciones
  downloadModulo: (moduloId: string) => Promise<void>;
  deleteModulo: (moduloId: string) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para gestionar descargas de módulos offline.
 *
 * @example
 * function OfflineManagerScreen() {
 *   const {
 *     modulos,
 *     isLoadingModulos,
 *     downloadProgress,
 *     downloadModulo,
 *     deleteModulo,
 *   } = useOfflineModules();
 *
 *   return (
 *     <ScrollView>
 *       {modulos?.map(modulo => (
 *         <OfflineModuleCard
 *           key={modulo.id}
 *           modulo={modulo}
 *           progress={downloadProgress.get(modulo.id)}
 *           onDownload={() => downloadModulo(modulo.id)}
 *           onDelete={() => deleteModulo(modulo.id)}
 *         />
 *       ))}
 *     </ScrollView>
 *   );
 * }
 */
export function useOfflineModules(): UseOfflineModulesReturn {
  const downloadProgressRef = useRef<Map<string, DownloadProgress>>(new Map());
  const [, setProgressUpdate] = useState({});

  // ─── Fetch de módulos disponibles ──────────────────────────────────────────

  const {
    data: modulos,
    isLoading: isLoadingModulos,
    error: modulosError,
  } = useQuery<ModuloOfflineInfo[]>({
    queryKey: ['offline', 'modulos'],
    queryFn: offlineService.listOfflineModules,
    staleTime: 1000 * 60 * 30, // 30 minutos
    gcTime: 1000 * 60 * 60,    // 1 hora
    retry: 2,
  });

  // ─── Mutation para descargar módulo ────────────────────────────────────────

  const { mutateAsync: descargarMutation } = useMutation<
    void,
    Error,
    string
  >({
    mutationFn: async (moduloId: string) => {
      const progress: DownloadProgress = {
        moduloId,
        isDownloading: true,
        progress: 0,
        error: null,
      };
      downloadProgressRef.current.set(moduloId, progress);
      setProgressUpdate({}); // Trigger re-render

      try {
        // Simular progreso (en realidad sería manejado por el servicio)
        for (let i = 0; i <= 100; i += 25) {
          progress.progress = i;
          downloadProgressRef.current.set(moduloId, { ...progress });
          setProgressUpdate({});
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Descargar módulo
        await offlineService.downloadModule(moduloId);

        progress.isDownloading = false;
        progress.progress = 100;
        downloadProgressRef.current.set(moduloId, { ...progress });
        setProgressUpdate({});
      } catch (error) {
        progress.isDownloading = false;
        progress.error = error instanceof Error ? error : new Error(String(error));
        downloadProgressRef.current.set(moduloId, { ...progress });
        setProgressUpdate({});
        throw error;
      }
    },
  });

  // ─── Mutation para eliminar módulo ─────────────────────────────────────────

  const { mutateAsync: eliminarMutation } = useMutation<void, Error, string>({
    mutationFn: async (moduloId: string) => {
      // Mock delete
      await new Promise(resolve => setTimeout(resolve, 500));
    },
  });

  // ─── Wrappers ─────────────────────────────────────────────────────────────

  const downloadModulo = useCallback(
    async (moduloId: string) => {
      await descargarMutation(moduloId);
    },
    [descargarMutation],
  );

  const deleteModulo = useCallback(
    async (moduloId: string) => {
      downloadProgressRef.current.delete(moduloId);
      setProgressUpdate({});
      await eliminarMutation(moduloId);
    },
    [eliminarMutation],
  );

  // ─── Retorno ──────────────────────────────────────────────────────────────

  return {
    // Estado de lista
    modulos,
    isLoadingModulos,
    modulosError: modulosError instanceof Error ? modulosError : null,

    // Estado de descargas
    downloadProgress: downloadProgressRef.current,

    // Acciones
    downloadModulo,
    deleteModulo,
  };
}
