/**
 * useProgress.ts
 * BrainSort — Hook para obtener progreso del usuario e insignias
 *
 * task_breakdown.md T-FE-050
 *
 * Responsabilidades:
 *   • Fetch del progreso del usuario (GET /api/progreso/me)
 *   • Fetch del leaderboard con paginación
 *   • Caché de progreso (staleTime: 3min, se refresca frecuentemente)
 *   • Manejo de estados (cargando, error, datos)
 *   • Soporte para refetch manual
 *
 * No contiene lógica de UI.
 *
 * Referencia: 02-frontend-app.md §1 hooks/useProgress.ts
 *            04-contratos-api.md §6 Progress Module
 */

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  progressService,
  UsuarioProgreso,
  LeaderboardResponse,
} from '../services/progress.service';
import { useAuthContext } from '../context/AuthContext';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Retorno del hook.
 */
export interface UseProgressReturn {
  // Estado de progreso personal
  progreso: UsuarioProgreso | undefined;
  isLoadingProgreso: boolean;
  progresoError: Error | null;

  // Estado del leaderboard
  leaderboard: LeaderboardResponse | undefined;
  isLoadingLeaderboard: boolean;
  leaderboardError: Error | null;

  // Acciones
  refetchProgreso: () => Promise<void>;
  refetchLeaderboard: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para obtener el progreso del usuario actual y el leaderboard global.
 * Actualiza frecuentemente (staleTime: 3 min) para mostrar progreso en tiempo real.
 *
 * @example
 * function ProgressScreen() {
 *   const {
 *     progreso,
 *     isLoadingProgreso,
 *     leaderboard,
 *     refetchProgreso,
 *   } = useProgress();
 *
 *   if (isLoadingProgreso) return <Spinner />;
 *   if (!progreso) return <ErrorBanner />;
 *
 *   return (
 *     <ScrollView>
 *       <PointsBanner
 *         puntos={progreso.puntosTotales}
 *         nivel={progreso.nivelActual}
 *       />
 *       <StreakCounter dias={progreso.rachaDias} />
 *       <BadgesSection insignias={progreso.insignias} />
 *       <LeaderboardSection usuarios={leaderboard?.ranking} />
 *       <Button
 *         title="Refrescar"
 *         onPress={refetchProgreso}
 *       />
 *     </ScrollView>
 *   );
 * }
 */
export function useProgress(): UseProgressReturn {
  const { tokens } = useAuthContext();
  const hasBackendToken =
    Boolean(tokens?.accessToken) && tokens?.accessToken !== 'dev-token';

  // ─── Fetch de progreso personal ────────────────────────────────────────────

  const {
    data: progreso,
    isLoading: isLoadingProgreso,
    error: progresoError,
    refetch: refetchProgresoQuery,
  } = useQuery<UsuarioProgreso>({
    queryKey: ['progreso', 'me'],
    queryFn: progressService.getUserProgress,
    staleTime: 1000 * 60 * 3, // 3 minutos
    gcTime: 1000 * 60 * 10,   // 10 minutos
    retry: 2,
    enabled: hasBackendToken,
  });

  // ─── Fetch del leaderboard ────────────────────────────────────────────────

  const {
    data: leaderboard,
    isLoading: isLoadingLeaderboard,
    error: leaderboardError,
    refetch: refetchLeaderboardQuery,
  } = useQuery<LeaderboardResponse>({
    queryKey: ['ranking', 20, 0], // limit=20, offset=0 (top 20)
    queryFn: () => progressService.getLeaderboard(20, 0),
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 15,   // 15 minutos
    retry: 2,
    enabled: hasBackendToken,
  });

  // ─── Helpers para refetch ──────────────────────────────────────────────────

  const refetchProgreso = useCallback(async () => {
    await refetchProgresoQuery();
  }, [refetchProgresoQuery]);

  const refetchLeaderboard = useCallback(async () => {
    await refetchLeaderboardQuery();
  }, [refetchLeaderboardQuery]);

  // ─── Retorno ──────────────────────────────────────────────────────────────

  return {
    // Estado de progreso personal
    progreso,
    isLoadingProgreso,
    progresoError: progresoError instanceof Error ? progresoError : null,

    // Estado del leaderboard
    leaderboard,
    isLoadingLeaderboard,
    leaderboardError: leaderboardError instanceof Error ? leaderboardError : null,

    // Acciones
    refetchProgreso,
    refetchLeaderboard,
  };
}
