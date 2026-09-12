/**
 * useAnimationController.ts
 * BrainSort — Hook para controlar animaciones de simulación con requestAnimationFrame
 *
 * task_breakdown.md T-FE-048
 *
 * Responsabilidades:
 *   • Loop de animación con requestAnimationFrame (RAF)
 *   • Avanzar pasos según velocidad de reproducción [0.25, 2.0]
 *   • Mantener ≥24 FPS en dispositivos de gama media/baja (HU-04)
 *   • Sincronizar con estado de reproducción (play/pause)
 *   • Detener animación al completar
 *   • Cleanup al desmontar el componente
 *
 * No contiene lógica de UI.
 * Se monta en SimulationScreen junto con useSimulation().
 *
 * Referencia: 02-frontend-app.md §1 hooks/useAnimationController.ts
 *            02-frontend-app.md §4 Motor de Visualización
 *            constitution.md §3 Design Principles (24 FPS)
 */

import { useEffect, useRef } from 'react';
import { useSimulationContext } from '../context/SimulationContext';

// ─── Constantes ───────────────────────────────────────────────────────────────

/**
 * FPS mínimo objetivo: 24 FPS según HU-04.
 * Intervalo entre frames en ms: 1000 / 24 ≈ 41.67ms
 */
const MIN_FPS_TARGET = 24;
const FRAME_INTERVAL_MS = 1000 / MIN_FPS_TARGET;

/**
 * Duración base pedagógica por paso.
 * velocidad=1.0 → ~1.1s por paso
 * velocidad=2.0 → ~0.55s por paso
 * velocidad=0.25 → ~4.4s por paso
 */
const BASE_STEP_DURATION_MS = 1100;

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Retorno del hook (vacío — el hook maneja todo internamente).
 */
export interface UseAnimationControllerReturn {
  // Sin retorno; el hook maneja la animación internamente
  // Se actualiza el estado mediante nextStep() del contexto
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook que configura un loop de animación con requestAnimationFrame.
 * Avanza automáticamente los pasos de simulación según la velocidad.
 *
 * Debe colocarse en el componente SimulationScreen que renderiza la visualización.
 *
 * @example
 * function SimulationScreen() {
 *   const { steps, currentStep, isPlaying, speed } = useSimulation();
 *   const { barChart } = useBarChart(steps[currentStep]);
 *   useAnimationController(); // Hook que maneja el avance automático
 * }
 */
export function useAnimationController(): UseAnimationControllerReturn {
  const { steps, currentStep, playback, isCompleted, nextStep } =
    useSimulationContext();

  // ─── Refs para sincronizar estado vivo sin disparar re-render de Effect ───────────
  const isPlayingRef = useRef(playback.isPlaying);
  const isCompletedRef = useRef(isCompleted);
  const currentStepRef = useRef(currentStep);
  const speedRef = useRef(playback.speed);
  const stepsCountRef = useRef(steps.length);

  useEffect(() => {
    isPlayingRef.current = playback.isPlaying;
    isCompletedRef.current = isCompleted;
    currentStepRef.current = currentStep;
    speedRef.current = playback.speed;
    stepsCountRef.current = steps.length;
  }, [playback.isPlaying, isCompleted, currentStep, playback.speed, steps.length]);

  // ─── Refs para RAF ────────────────────────────────────────────────────────

  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const stepAccumulatorRef = useRef<number>(0);

  // ─── Cleanup helper ───────────────────────────────────────────────────────

  const stopAnimation = (): void => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    stepAccumulatorRef.current = 0;
  };

  // ─── RAF Loop ─────────────────────────────────────────────────────────────

  /**
   * Función llamada por requestAnimationFrame.
   * Calcula el tiempo transcurrido y avanza pasos según la velocidad.
   */
  const rafLoop = (currentTime: number): void => {
    if (!isPlayingRef.current || isCompletedRef.current) {
      stopAnimation();
      return;
    }

    const rawDeltaTime = lastFrameTimeRef.current
      ? currentTime - lastFrameTimeRef.current
      : FRAME_INTERVAL_MS;
    const deltaTime = Math.min(rawDeltaTime, BASE_STEP_DURATION_MS);

    lastFrameTimeRef.current = currentTime;

    // Acumular "pasos" basado en velocidad y tiempo transcurrido
    const stepsToAdvance =
      (deltaTime * speedRef.current) / BASE_STEP_DURATION_MS;

    stepAccumulatorRef.current += stepsToAdvance;

    // Avanzar pasos completos acumulados
    while (stepAccumulatorRef.current >= 1.0) {
      if (!isCompletedRef.current && currentStepRef.current < stepsCountRef.current - 1) {
        nextStep();
        stepAccumulatorRef.current -= 1.0;
      } else if (!isCompletedRef.current && currentStepRef.current === stepsCountRef.current - 1) {
        nextStep();
        stopAnimation();
        return;
      } else {
        // Simulación completada o sin pasos restantes
        stopAnimation();
        return;
      }
    }

    // Continuar animación if play is still active
    if (isPlayingRef.current && !isCompletedRef.current) {
      rafIdRef.current = requestAnimationFrame(rafLoop);
    }
  };

  // ─── Effect: Gestionar RAF Loop ───────────────────────────────────────────

  useEffect(() => {
    // Solo iniciamos el loop si se pasa a isPlaying y no estaba iniciado
    if (playback.isPlaying && !isCompleted && steps.length > 0) {
      if (rafIdRef.current === null) {
        lastFrameTimeRef.current = 0;
        stepAccumulatorRef.current = 0;
        rafIdRef.current = requestAnimationFrame(rafLoop);
      }
    } else {
      stopAnimation();
    }

    // Cleanup al desmontar
    return () => {
      stopAnimation();
    };
    // Eliminamos currentStep de las dependencias para evitar que el efecto 
    // se reinicie 60 veces por segundo al avanzar pasos.
    // El loop consume el estado vivo mediante refs.
  }, [playback.isPlaying, isCompleted, steps.length, nextStep]);

  // No retorna nada; el hook maneja todo internamente
  return {};
}
