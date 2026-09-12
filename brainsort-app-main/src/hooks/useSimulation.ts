/**
 * useSimulation.ts
 * BrainSort — Hook para controlar la simulación de algoritmos
 *
 * task_breakdown.md T-FE-046
 *
 * Responsabilidades:
 *   • Acceso al estado de la simulación (pasos, paso actual, datos)
 *   • Control de reproducción (play, pause, togglePlayPause)
 *   • Control de velocidad [0.25, 2.0]
 *   • Navegación de pasos (nextStep, previousStep, goToStep)
 *   • Estado de completitud (isCompleted)
 *   • Reset y limpieza (resetSimulation, clearSimulation)
 *
 * Wrapper alrededor de SimulationContext que proporciona una API más simple.
 * Se consume desde SimulationScreen.
 *
 * Referencia: 02-frontend-app.md §1 hooks/useSimulation.ts
 */

import { useSimulationContext } from '../context/SimulationContext';
import type { PseudocodeLine } from '../services/library.service';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Información del paso actual con estado accesible.
 */
export interface CurrentStepInfo {
  /** Índice del paso actual (0-based) */
  index: number;
  /** Paso actual (null si no hay simulación) */
  step: any; // SimulationStep del packages/core
  /** Número de paso para mostrar al usuario (1-based) */
  displayNumber: number;
  /** Total de pasos */
  totalSteps: number;
  /** Porcentaje de progreso (0-100) */
  progress: number;
  /** true si es el último paso */
  isLastStep: boolean;
}

/**
 * Retorno del hook.
 */
export interface UseSimulationReturn {
  // Estado
  steps: any[]; // SimulationStep[]
  currentStep: CurrentStepInfo;
  data: number[];
  algoritmoId: string;
  isPlaying: boolean;
  speed: number;
  isCompleted: boolean;
  pseudocode: PseudocodeLine[];

  // Acciones de reproducción
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;

  // Acciones de navegación
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;

  // Acciones de configuración
  setSpeed: (speed: number) => void;

  // Acciones de control
  resetSimulation: () => void;
  clearSimulation: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook para controlar la simulación de algoritmos.
 * Proporciona una interfaz simplificada sobre SimulationContext.
 *
 * @example
 * function SimulationScreen() {
 *   const {
 *     currentStep,
 *     isPlaying,
 *     speed,
 *     steps,
 *     play,
 *     pause,
 *     nextStep,
 *     previousStep,
 *     setSpeed,
 *     resetSimulation,
 *     isCompleted,
 *   } = useSimulation();
 *
 *   return (
 *     <View>
 *       <SimulationCanvas
 *         steps={steps}
 *         currentStep={currentStep}
 *         onNextStep={nextStep}
 *       />
 *       <ControlBar
 *         isPlaying={isPlaying}
 *         onPlay={play}
 *         onPause={pause}
 *         onReset={resetSimulation}
 *         isCompleted={isCompleted}
 *       />
 *       <SpeedSlider value={speed} onChange={setSpeed} />
 *     </View>
 *   );
 * }
 */
export function useSimulation(): UseSimulationReturn {
  const ctx = useSimulationContext();

  // ─── Derivar información del paso actual ───────────────────────────────────

  const currentStepInfo: CurrentStepInfo = {
    index: ctx.currentStep,
    step: ctx.steps[ctx.currentStep] || null,
    displayNumber: ctx.currentStep + 1, // Mostrar 1-based
    totalSteps: ctx.steps.length,
    progress:
      ctx.steps.length > 0
        ? Math.round(((ctx.currentStep + 1) / ctx.steps.length) * 100)
        : 0,
    isLastStep: ctx.currentStep === ctx.steps.length - 1,
  };

  // ─── Retorno ──────────────────────────────────────────────────────────────

  return {
    // Estado
    steps: ctx.steps,
    currentStep: currentStepInfo,
    data: ctx.data,
    algoritmoId: ctx.algoritmoId,
    isPlaying: ctx.playback.isPlaying,
    speed: ctx.playback.speed,
    isCompleted: ctx.isCompleted,
    pseudocode: ctx.pseudocode,

    // Acciones de reproducción
    play: ctx.play,
    pause: ctx.pause,
    togglePlayPause: ctx.togglePlayPause,

    // Acciones de navegación
    nextStep: ctx.nextStep,
    previousStep: ctx.previousStep,
    goToStep: ctx.goToStep,

    // Acciones de configuración
    setSpeed: ctx.setSpeed,

    // Acciones de control
    resetSimulation: ctx.resetSimulation,
    clearSimulation: ctx.clearSimulation,
  };
}
