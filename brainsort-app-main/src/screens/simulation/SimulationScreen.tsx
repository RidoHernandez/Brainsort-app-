/**
 * SimulationScreen.tsx
 * BrainSort — Pantalla de simulación interactiva de algoritmos
 *
 * task_breakdown.md T-FE-097
 *
 * Implementa HU-03, HU-04, HU-06, HU-07:
 *
 * HU-03 — Datos predeterminados:
 *   - Genera arreglo aleatorio 8-15 elementos al cargar (useDataset)
 *   - Botón "Generar nuevos datos"
 *   - Input para datos personalizados (separados por coma)
 *
 * HU-04 — Control de animación:
 *   - Play / Pause con ControlBar
 *   - Velocidad [0.25x, 2.0x] en pasos de 0.25
 *   - BarChart con color-coding del spec
 *   - PseudocodePanel sincronizado con el paso actual
 *   - ≥24 FPS mediante RAF loop (useAnimationController)
 *
 * HU-06 — Seguimiento hasta finalización:
 *   - Todos los elementos verdes al terminar
 *   - Play deshabilitado, Reiniciar habilitado
 *   - Timeout de seguridad (10s) en useSimulationEngine
 *
 * HU-07 — Mensaje de finalización:
 *   - Toast "¡Algoritmo completado!" con opciones
 *   - Auto-desaparece a los 5 segundos
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import { useSimulation } from '../../hooks/useSimulation';
import { useSimulationEngine } from '../../hooks/useSimulationEngine';
import { useDataset } from '../../hooks/useDataset';
import { useAnimationController } from '../../hooks/useAnimationController';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { BarChart } from '../../components/simulation/BarChart';
import { ControlBar } from '../../components/simulation/ControlBar';
import { LinearStructureCanvas } from '../../components/simulation/LinearStructureCanvas';
import { TreeStructureCanvas } from '../../components/simulation/TreeStructureCanvas';
import { PseudocodePanel } from '../../components/simulation/PseudocodePanel';
import { Spinner } from '../../components/common/Spinner';
import { AnimationEngine } from '../../visualization/AnimationEngine';
import {
  DarkSurfaces,
  DarkText,
  Primary,
  Accent,
  Semantic,
} from '../../styles/colors';
import {
  BorderRadius,
  Spacing,
  SpacingAlias,
} from '../../styles/spacing';
import {
  FontFamilies,
  FontSizes,
  FontWeights,
  TextVariants,
} from '../../styles/typography';

type SimulationContentProps = {
  algoritmoId: string;
  onRequestBack?: () => void;
  showAlgorithmHeader?: boolean;
};



function formatDataset(data: number[]): string {
  return data.join(', ');
}

function getComfortableDefaultSpeed(nombre?: string, categoria?: string): number {
  if (!nombre) return 1.0;

  const recursiveOrTree = new Set([
    'Merge Sort',
    'Quick Sort',
    'Segment Tree',
  ]);
  const denseStructures = new Set(['Heap Sort', 'Priority Queue']);
  const quickRead = new Set(['Linear Search', 'Binary Search', 'Stack', 'Queue', 'Deque']);

  if (recursiveOrTree.has(nombre) || categoria === 'EstructurasArboles') {
    return 0.5;
  }

  if (denseStructures.has(nombre)) {
    return 0.75;
  }

  if (quickRead.has(nombre)) {
    return 1.0;
  }

  return 0.75;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
  },

  // Scroll principal
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SpacingAlias.screenPaddingX,
    paddingTop: Spacing[6],
    paddingBottom: Spacing[8],
    gap: Spacing[5],
  },

  // Header del algoritmo
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  algoName: {
    ...TextVariants.h4,
    color: DarkText.primary,
    flex: 1,
  },
  stepCounter: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.muted,
  },

  // Progreso
  progressBar: {
    height: 3,
    backgroundColor: DarkSurfaces.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Accent[500],
    borderRadius: BorderRadius.full,
  },

  // Canvas de barras
  canvasContainer: {
    backgroundColor: '#0F1318',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: DarkSurfaces.borderSubtle,
    padding: Spacing[5],
    overflow: 'hidden',
  },

  // Leyenda de colores
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: DarkText.muted,
  },

  // Input de datos personalizados
  dataInputSection: {
    gap: Spacing[3],
  },
  dataInputLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
  },
  dataInputRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  dataInputShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1318',
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  dataInput: {
    flex: 1,
    paddingLeft: Spacing[4],
    paddingRight: Spacing[2],
    paddingVertical: Spacing[3],
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
    color: DarkText.primary,
  },
  dataInputError: { borderColor: Semantic.error },
  diceButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    alignSelf: 'stretch',
    borderLeftWidth: 1,
    borderLeftColor: DarkSurfaces.border,
  },
  diceButtonText: {
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[5],
    justifyContent: 'center',
  },
  applyButtonText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: '#FFFFFF',
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.4)',
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  practiceButtonText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: Accent[500],
  },
  inputErrorText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: Semantic.error,
  },

  // Estado inicial / sin datos
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[10],
    gap: Spacing[3],
  },
  emptyIcon: { fontSize: 36 },
  emptyText: { ...TextVariants.bodyMd, color: DarkText.muted, textAlign: 'center' },



  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

export function SimulationContent({
  algoritmoId,
  onRequestBack,
  showAlgorithmHeader = true,
}: SimulationContentProps) {

  // ─── Hooks ────────────────────────────────────────────────────────────────
  const navigation = useNavigation<NavigationProp<LibraryStackParamList>>();
  const { algoritmo, isLoading: algoLoading } = useAlgorithm(algoritmoId);
  const {
    steps,
    currentStep,
    isPlaying,
    speed,
    isCompleted,
    play,
    pause,
    nextStep,
    previousStep,
    setSpeed,
    resetSimulation,
    pseudocode,
  } = useSimulation();
  const { executeAlgorithm, isExecuting } = useSimulationEngine();
  const { generateDefault, validateDataset } = useDataset();
  useAnimationController(); // RAF loop — maneja avance automático de frames

  // ─── Estado local ─────────────────────────────────────────────────────────
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showInlineValues, setShowInlineValues] = useState(true);

  // ─── Cargar datos al montar ───────────────────────────────────────────────
  useEffect(() => {
    if (algoritmo && !hasStarted) {
      const initialData = generateDefault();
      setCustomInput(formatDataset(initialData));
      executeAlgorithm(algoritmoId, initialData)
        .then(() => setHasStarted(true))
        .catch(() => {});
    }
  }, [algoritmo, algoritmoId, hasStarted, generateDefault, executeAlgorithm]);

  // Si cambia el algoritmo seleccionado, reinicia el arranque de simulación.
  useEffect(() => {
    setHasStarted(false);
    setCustomInput('');
    setInputError(null);
    resetSimulation();
  }, [algoritmoId, resetSimulation]);

  // Velocidad pedagógica por algoritmo: 1x ahora es legible, y los recursivos
  // arrancan más lento para que el usuario pueda seguir la pila de llamadas.
  useEffect(() => {
    setSpeed(getComfortableDefaultSpeed(algoritmo?.nombre, algoritmo?.categoria));
  }, [algoritmo?.nombre, algoritmo?.categoria, setSpeed]);



  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleGenerateNew = useCallback(() => {
    if (!algoritmo) return;
    const data = generateDefault();
    setCustomInput(formatDataset(data));
    executeAlgorithm(algoritmoId, data).catch(() => {});
    setInputError(null);
  }, [algoritmo, algoritmoId, generateDefault, executeAlgorithm]);

  const handleApplyCustom = useCallback(() => {
    if (!algoritmo || !customInput.trim()) return;
    const parts = customInput.split(',').map((s) => Number(s.trim()));
    const error = validateDataset(parts);
    if (error) {
      setInputError(error.message);
      return;
    }
    setInputError(null);
    setCustomInput(formatDataset(parts));
    executeAlgorithm(algoritmoId, parts).catch(() => {});
  }, [algoritmo, algoritmoId, customInput, validateDataset, executeAlgorithm]);

  const handleReset = useCallback(() => {
    resetSimulation();
  }, [resetSimulation]);



  // ─── Render ───────────────────────────────────────────────────────────────

  if (algoLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Spinner size="large" />
      </View>
    );
  }

  const currentStepData = currentStep.step;
  const pseudoLines = pseudocode;
  const hasSteps = steps.length > 0;
  const progressPercent = currentStep.progress;
  const isTree = AnimationEngine.isTreeStructure((algoritmo as any)?.categoria, algoritmo?.nombre);
  const isLinear = !isTree && AnimationEngine.isLinearStructure((algoritmo as any)?.categoria);
  const legend = AnimationEngine.getLegend((algoritmo as any)?.categoria);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header: nombre + contador de paso */}
        {showAlgorithmHeader && (
          <View style={[styles.headerRow, { marginBottom: Spacing[2] }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
              <TouchableOpacity onPress={onRequestBack} accessibilityLabel="Volver">
                <Text style={{ color: DarkText.primary, fontSize: 20 }}>←</Text>
              </TouchableOpacity>
              <Text style={[styles.algoName, { fontSize: 20 }]} numberOfLines={1}>
                {algoritmo?.nombre ?? 'Simulación'}
              </Text>
            </View>
            {hasSteps && (
              <Text style={styles.stepCounter}>
                {currentStep.displayNumber} / {currentStep.totalSteps}
              </Text>
            )}
          </View>
        )}

        {/* Barra de progreso */}
        {hasSteps && (
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
        )}

        {/* Canvas de barras */}
        <View style={styles.canvasContainer}>
          {isExecuting ? (
            <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
              <Spinner size="large" />
            </View>
          ) : hasSteps ? (
            isTree ? (
              <TreeStructureCanvas
                step={currentStepData}
                isCompleted={isCompleted}
                algorithmName={algoritmo?.nombre ?? ''}
                height={220}
              />
            ) : isLinear ? (
              <LinearStructureCanvas
                step={currentStepData as any}
                isCompleted={isCompleted}
                algorithmName={algoritmo?.nombre ?? ''}
                height={220}
              />
            ) : (
              <BarChart
                algorithmName={algoritmo?.nombre}
                step={currentStepData}
                isCompleted={isCompleted}
                height={220}
              />
            )
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>
                Genera datos para iniciar la simulación
              </Text>
            </View>
          )}
        </View>

        {/* Leyenda de colores */}
        <View style={styles.legend}>
          {legend.map(({ color, label }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Pseudocódigo */}
        {pseudoLines.length > 0 && (
          <PseudocodePanel
            lines={pseudoLines}
            currentStep={currentStepData}
            showInlineValues={showInlineValues}
          />
        )}

        {/* Input de datos personalizados */}
        <View style={styles.dataInputSection}>
          <Text style={styles.dataInputLabel}>Datos personalizados</Text>
          <View style={styles.dataInputRow}>
            <View
              style={[
                styles.dataInputShell,
                inputError ? styles.dataInputError : null,
              ]}
            >
              <TextInput
                style={styles.dataInput}
                value={customInput}
                onChangeText={(text) => {
                  setCustomInput(text);
                  setInputError(null);
                }}
                placeholder="5, 3, 8, 1, 9, 2"
                placeholderTextColor={DarkText.muted}
                keyboardType="default"
                returnKeyType="done"
                onSubmitEditing={handleApplyCustom}
                accessibilityLabel="Datos personalizados en formato CSV"
                testID="input-custom-data"
              />
              <TouchableOpacity
                style={styles.diceButton}
                onPress={handleGenerateNew}
                disabled={isExecuting}
                accessibilityRole="button"
                accessibilityLabel="Generar nuevos datos aleatorios"
                testID="btn-generate-new"
              >
                <Text style={styles.diceButtonText}>🎲</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyCustom}
              disabled={!customInput.trim()}
              accessibilityRole="button"
              accessibilityLabel="Aplicar datos personalizados"
              testID="btn-apply-data"
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
          {inputError && (
            <Text style={styles.inputErrorText}>{inputError}</Text>
          )}

          {/* Botón Practicar */}
          <TouchableOpacity
            style={styles.practiceButton}
            onPress={() => navigation.navigate('Exercise', { algoritmoId })}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Ir a ejercicios de práctica"
            testID="btn-practice"
          >
            <Text style={{ fontSize: 16 }}>📝</Text>
            <Text style={styles.practiceButtonText}>Practicar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de control — pegada al fondo */}
      <ControlBar
        isPlaying={!!isPlaying}
        isCompleted={isCompleted}
        speed={speed}
        hasSteps={hasSteps}
        onPlay={play}
        onPause={pause}
        onReset={handleReset}
        onPreviousStep={previousStep}
        onNextStep={nextStep}
        onSpeedChange={setSpeed}
        showInlineValues={showInlineValues}
        onToggleInlineValues={() => setShowInlineValues((prev) => !prev)}
      />
    </KeyboardAvoidingView>
  );
}

type LegacyScreenProps = {
  route: { params: { algoritmoId: string } };
  navigation: { goBack: () => void };
};

export default function SimulationScreen({ navigation, route }: LegacyScreenProps) {
  return (
    <SimulationContent
      algoritmoId={route.params.algoritmoId}
      onRequestBack={navigation.goBack}
      showAlgorithmHeader
    />
  );
}
