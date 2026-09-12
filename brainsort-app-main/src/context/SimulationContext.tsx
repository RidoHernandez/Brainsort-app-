/**
 * SimulationContext.tsx
 * BrainSort — Contexto global de estado de simulación activa
 *
 * task_breakdown.md T-FE-032
 *
 * Expone:
 *   - Pasos de la simulación actual (steps[], currentStep)
 *   - Estado de reproducción (isPlaying, speed)
 *   - Datos siendo simulados (data[], algoritmoId)
 *   - Sesión de simulación (SesionSimulacion)
 *   - Helpers para controlar reproducción (play, pause, resetSimulation, etc.)
 *
 * No contiene lógica de ejecución del engine — eso vive en useSimulationEngine.ts (T-FE-047).
 * Este contexto es el "store" global; el hook es el ViewModel.
 *
 * Referencia: 02-frontend-app.md §1 context/SimulationContext.tsx
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { SesionSimulacion, SimulationStep } from '@brainsort/core';
import type { PseudocodeLine } from '../services/library.service';

// ─── Tipos del Contexto ───────────────────────────────────────────────────────

/**
 * Estado de reproducción — control de play/pause y velocidad.
 */
export interface PlaybackState {
  /** true cuando la simulación está en reproducción */
  isPlaying: boolean;
  /** Velocidad de reproducción en rango [0.25, 2.0] con incrementos de 0.25 */
  speed: number;
}

/**
 * Estado completo de la simulación activa.
 */
export interface SimulationState {
  /** Todos los pasos generados por el engine para la simulación activa */
  steps: SimulationStep[];
  /** Índice del paso actual (0-based) */
  currentStep: number;
  /** Array siendo simulado */
  data: number[];
  /** ID del algoritmo siendo ejecutado */
  algoritmoId: string;
  /** Sesión de simulación asociada (puede ser null si es una ejecución local) */
  sesionSimulacion: SesionSimulacion | null;
  /** Estado de reproducción */
  playback: PlaybackState;
  /** true cuando la simulación ha llegado al final */
  isCompleted: boolean;
  /** Pseudocódigo del algoritmo actual */
  pseudocode: PseudocodeLine[];
}

// ─── Acciones del Contexto ────────────────────────────────────────────────────

export interface SimulationActions {
  /**
   * Establece los pasos y datos iniciales de una nueva simulación.
   * Llamado desde useSimulationEngine (T-FE-047) tras ejecutar el engine.
   */
  setSimulationData: (params: {
    steps: SimulationStep[];
    data: number[];
    algoritmoId: string;
    pseudocode: PseudocodeLine[];
    sesionSimulacion?: SesionSimulacion;
  }) => void;

  /**
   * Avanza al siguiente paso.
   * Si ya está en el último paso, marca como completada.
   */
  nextStep: () => void;

  /**
   * Retrocede al paso anterior.
   */
  previousStep: () => void;

  /**
   * Salta a un paso específico.
   */
  goToStep: (stepIndex: number) => void;

  /**
   * Inicia la reproducción (isPlaying = true).
   */
  play: () => void;

  /**
   * Pausa la reproducción (isPlaying = false).
   */
  pause: () => void;

  /**
   * Alterna entre play y pause.
   */
  togglePlayPause: () => void;

  /**
   * Establece la velocidad de reproducción.
   * @param speed Valor en rango [0.25, 2.0]
   */
  setSpeed: (speed: number) => void;

  /**
   * Reinicia la simulación: retorna al paso 0, pausa, limpia estado completado.
   */
  resetSimulation: () => void;

  /**
   * Limpia completamente el contexto de simulación.
   * Llamado al abandonar la pantalla de simulación.
   */
  clearSimulation: () => void;
}

// ─── Valor del Contexto ───────────────────────────────────────────────────────

export type SimulationContextValue = SimulationState & SimulationActions;

// ─── Creación del Contexto ────────────────────────────────────────────────────

const SimulationContext = createContext<SimulationContextValue | undefined>(
  undefined,
);
SimulationContext.displayName = 'SimulationContext';

// ─── Estado Inicial ───────────────────────────────────────────────────────────

const INITIAL_STATE: SimulationState = {
  steps: [],
  currentStep: 0,
  data: [],
  algoritmoId: '',
  sesionSimulacion: null,
  playback: {
    isPlaying: false,
    speed: 1.0,
  },
  isCompleted: false,
  pseudocode: [],
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface SimulationProviderProps {
  children: React.ReactNode;
}

export function SimulationProvider({
  children,
}: SimulationProviderProps): React.JSX.Element {
  const [steps, setSteps] = useState<SimulationStep[]>(INITIAL_STATE.steps);
  const [currentStep, setCurrentStepState] = useState<number>(
    INITIAL_STATE.currentStep,
  );
  const [data, setData] = useState<number[]>(INITIAL_STATE.data);
  const [algoritmoId, setAlgoritmoId] = useState<string>(
    INITIAL_STATE.algoritmoId,
  );
  const [sesionSimulacion, setSesionSimulacion] = useState<SesionSimulacion | null>(
    INITIAL_STATE.sesionSimulacion,
  );
  const [isPlaying, setIsPlayingState] = useState<boolean>(false);
  const [speed, setSpeedState] = useState<number>(1.0);
  const [isCompleted, setIsCompletedState] = useState<boolean>(false);
  const [pseudocode, setPseudocodeState] = useState<PseudocodeLine[]>(
    INITIAL_STATE.pseudocode,
  );

  // ─── Acciones ──────────────────────────────────────────────────────────────

  const setSimulationData = useCallback(
    (params: {
      steps: SimulationStep[];
      data: number[];
      algoritmoId: string;
      pseudocode: PseudocodeLine[];
      sesionSimulacion?: SesionSimulacion;
    }) => {
      const { steps: newSteps, data: newData, algoritmoId: newAlgoritmoId, pseudocode: newPseudocode, sesionSimulacion: newSesion } = params;
      setSteps(newSteps);
      setData(newData);
      setAlgoritmoId(newAlgoritmoId);
      setPseudocodeState(newPseudocode);
      if (newSesion) {
        setSesionSimulacion(newSesion);
      }
      setCurrentStepState(0);
      setIsPlayingState(false);
      setIsCompletedState(false);
    },
    [],
  );

  const nextStep = useCallback(() => {
    setCurrentStepState((prev) => {
      const nextIdx = prev + 1;
      const isAtEnd = nextIdx >= steps.length;
      if (isAtEnd) {
        setIsCompletedState(true);
        setIsPlayingState(false);
      } else {
        setIsCompletedState(false);
      }
      return isAtEnd ? prev : nextIdx;
    });
  }, [steps.length]);

  const previousStep = useCallback(() => {
    setCurrentStepState((prev) => {
      const prevIdx = prev > 0 ? prev - 1 : 0;
      const isAtEnd = prevIdx === steps.length - 1 && steps.length > 0;
      setIsCompletedState(isAtEnd);
      return prevIdx;
    });
  }, [steps.length]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepState(stepIndex);
      const isAtEnd = stepIndex === steps.length - 1;
      setIsCompletedState(isAtEnd);
      if (isAtEnd) {
        setIsPlayingState(false);
      }
    }
  }, [steps.length]);

  const play = useCallback(() => {
    // No permitir play si ya está completada (a menos que se haga reset)
    if (!isCompleted) {
      setIsPlayingState(true);
    }
  }, [isCompleted]);

  const pause = useCallback(() => {
    setIsPlayingState(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!isCompleted) {
      setIsPlayingState((prev) => !prev);
    }
  }, [isCompleted]);

  const setSpeed = useCallback((newSpeed: number) => {
    // Asegurar que el speed está en el rango válido [0.25, 2.0]
    const clampedSpeed = Math.max(0.25, Math.min(2.0, newSpeed));
    setSpeedState(clampedSpeed);
  }, []);

  const resetSimulation = useCallback(() => {
    setCurrentStepState(0);
    setIsPlayingState(false);
    setIsCompletedState(false);
  }, []);

  const clearSimulation = useCallback(() => {
    setSteps([]);
    setCurrentStepState(0);
    setData([]);
    setAlgoritmoId('');
    setSesionSimulacion(null);
    setIsPlayingState(false);
    setSpeedState(1.0);
    setIsCompletedState(false);
    setPseudocodeState([]);
  }, []);

  // ─── Valor memoizado ───────────────────────────────────────────────────────

  const value = useMemo<SimulationContextValue>(
    () => ({
      steps,
      currentStep,
      data,
      algoritmoId,
      sesionSimulacion,
      playback: {
        isPlaying,
        speed,
      },
      isCompleted,
      pseudocode,
      setSimulationData,
      nextStep,
      previousStep,
      goToStep,
      play,
      pause,
      togglePlayPause,
      setSpeed,
      resetSimulation,
      clearSimulation,
    }),
    [
      steps,
      currentStep,
      data,
      algoritmoId,
      sesionSimulacion,
      isPlaying,
      speed,
      isCompleted,
      pseudocode,
      setSimulationData,
      nextStep,
      previousStep,
      goToStep,
      play,
      pause,
      togglePlayPause,
      setSpeed,
      resetSimulation,
      clearSimulation,
    ],
  );

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

// ─── Hook de consumo ──────────────────────────────────────────────────────────

/**
 * Hook para consumir el SimulationContext.
 * Lanza un error si se usa fuera de <SimulationProvider>.
 *
 * @example
 * const { currentStep, steps, isPlaying, play, pause, nextStep } = useSimulationContext();
 */
export function useSimulationContext(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (ctx === undefined) {
    throw new Error(
      'useSimulationContext debe usarse dentro de <SimulationProvider>.',
    );
  }
  return ctx;
}
