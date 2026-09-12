import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../common/Button';
import { DarkSurfaces, DarkText, Accent, Semantic } from '../../styles/colors';
import { FontFamilies, FontSizes, TextVariants } from '../../styles/typography';
import { BorderRadius, Spacing } from '../../styles/spacing';
import type {
  BarsExerciseContent,
  PseudocodeExerciseContent,
  TipoEjercicio,
} from '../../services/exercise.service';

export interface PredictionExerciseProps {
  tipo: TipoEjercicio;
  pregunta: string;
  opciones?: string[];
  contenido?: PseudocodeExerciseContent | BarsExerciseContent | null;
  progressCurrent: number;
  progressTotal: number;
  isSubmittingAnswer: boolean;
  lastResult: {
    correcto: boolean;
    feedback?: string;
    feedbackPositivo?: string;
    feedbackNegativo?: string;
    puntosGanados: number;
    rachaDias: number;
  } | null;
  onSubmit: (respuesta: string) => Promise<void>;
  onNext: () => void;
  isLastExercise?: boolean;
}

export const PredictionExercise: React.FC<PredictionExerciseProps> = ({
  tipo,
  pregunta,
  opciones,
  contenido,
  progressCurrent,
  progressTotal,
  isSubmittingAnswer,
  lastResult,
  onSubmit,
  onNext,
  isLastExercise,
}) => {
  const [respuesta, setRespuesta] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [bars, setBars] = useState<number[]>([]);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const barsContent = tipo === 'OrdenarBarras' ? (contenido as BarsExerciseContent | null) : null;
  const pseudoContent =
    tipo === 'CompletarPseudocodigo' ? (contenido as PseudocodeExerciseContent | null) : null;

  useEffect(() => {
    setRespuesta('');
    setSelectedOption(null);
    setSelectedBarIndex(null);
    setShowResult(false);
    setBars(barsContent?.inicial ?? []);
  }, [barsContent?.inicial, pregunta]);

  const isModoSeleccion = tipo === 'OrdenarBarras' && (contenido as any)?.modoSeleccion;

  const progressPercent = progressTotal > 0 ? progressCurrent / progressTotal : 0;
  const maxBarValue = useMemo(() => Math.max(...bars, 1), [bars]);
  const canSubmit =
    tipo === 'CompletarPseudocodigo'
      ? !!selectedOption
      : tipo === 'OrdenarBarras'
        ? isModoSeleccion
          ? selectedBarIndex !== null
          : bars.length > 0
        : !!respuesta.trim();

  const handleBarPress = (index: number) => {
    if (isModoSeleccion) {
      if (selectedBarIndex === index) {
        setSelectedBarIndex(null);
      } else {
        setSelectedBarIndex(index);
      }
      return;
    }

    if (selectedBarIndex === null) {
      setSelectedBarIndex(index);
      return;
    }

    if (selectedBarIndex === index) {
      setSelectedBarIndex(null);
      return;
    }

    setBars((current) => {
      const next = [...current];
      const temp = next[selectedBarIndex];
      next[selectedBarIndex] = next[index];
      next[index] = temp;
      return next;
    });
    setSelectedBarIndex(null);
  };

  const handleSubmit = async () => {
    const payload =
      tipo === 'CompletarPseudocodigo'
        ? selectedOption ?? ''
        : tipo === 'OrdenarBarras'
          ? isModoSeleccion
            ? String(selectedBarIndex)
            : JSON.stringify(bars)
          : respuesta;

    await onSubmit(payload);
    setShowResult(true);
  };

  const handleNext = () => {
    setRespuesta('');
    setSelectedOption(null);
    setSelectedBarIndex(null);
    setShowResult(false);
    onNext();
  };

  return (
    <View style={styles.card}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressText}>{progressCurrent}/{progressTotal}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progressPercent * 100)}%` }]} />
        </View>
      </View>

      <Text style={styles.typeLabel}>{getTypeLabel(tipo, isModoSeleccion)}</Text>
      <Text style={styles.question}>{pregunta}</Text>

      {!showResult ? (
        <>
          {tipo === 'CompletarPseudocodigo' && (
            <View style={styles.pseudocodeBox}>
              <Text style={styles.codeLine}>
                {pseudoContent?.antes}
                <Text style={styles.blank}> __________ </Text>
                {pseudoContent?.despues}
              </Text>
              <View style={styles.optionGrid}>
                {(opciones ?? []).map((option) => {
                  const active = selectedOption === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionChip, active && styles.optionChipActive]}
                      onPress={() => setSelectedOption(option)}
                      activeOpacity={0.82}
                    >
                      <Text style={[styles.optionText, active && styles.optionTextActive]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {tipo === 'OrdenarBarras' && (
            <View style={styles.barsExercise}>
              {barsContent?.pasoObjetivo && (
                <Text style={styles.stepHint}>{barsContent.pasoObjetivo}</Text>
              )}
              <View style={styles.barsRow}>
                {bars.map((value, index) => {
                  const selected = selectedBarIndex === index;
                  return (
                    <TouchableOpacity
                      key={`${value}-${index}`}
                      style={styles.barSlot}
                      onPress={() => handleBarPress(index)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.bar,
                          { height: 42 + (value / maxBarValue) * 96 },
                          selected && styles.barSelected,
                        ]}
                      />
                      <Text style={styles.barValue}>{value}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.barsHint}>
                {isModoSeleccion
                  ? 'Toca la barra que corresponde a la respuesta.'
                  : 'Toca dos barras para intercambiarlas.'}
              </Text>
            </View>
          )}

          {tipo === 'PrediccionTexto' && (
            <TextInput
              style={styles.input}
              placeholder="Tu respuesta..."
              placeholderTextColor={DarkText.muted}
              value={respuesta}
              onChangeText={setRespuesta}
              multiline
              numberOfLines={3}
            />
          )}

          <Button
            title="Comprobar"
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmittingAnswer}
            loading={isSubmittingAnswer}
            size="large"
          />
        </>
      ) : (
        <View style={styles.resultContainer}>
          {lastResult?.correcto ? (
            <>
              <Text style={styles.resultTitle}>Correcto</Text>
              <Text style={[styles.resultText, styles.success]}>
                {lastResult.feedbackPositivo ?? lastResult.feedback}
              </Text>
              <View style={styles.statsRow}>
                <Text style={styles.stat}>+{lastResult.puntosGanados} XP</Text>
                <Text style={styles.stat}>Racha: {lastResult.rachaDias} días</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.resultTitle}>Intenta ajustar tu idea</Text>
              <Text style={[styles.resultText, styles.error]}>
                {lastResult?.feedbackNegativo ?? lastResult?.feedback}
              </Text>
            </>
          )}

          {!lastResult?.correcto && (
            <View style={{ marginBottom: Spacing[3], width: '100%' }}>
              <Button
                title="Volver a intentar"
                onPress={() => setShowResult(false)}
                variant="primary"
                size="large"
              />
            </View>
          )}

          <Button
            title={isLastExercise ? 'Terminar sesión' : 'Siguiente'}
            onPress={handleNext}
            variant="secondary"
            size="large"
          />
        </View>
      )}
    </View>
  );
};

function getTypeLabel(tipo: TipoEjercicio, isModoSeleccion?: boolean): string {
  switch (tipo) {
    case 'CompletarPseudocodigo':
      return 'Completa el pseudocódigo';
    case 'OrdenarBarras':
      return isModoSeleccion ? 'Selecciona la barra correcta' : 'Predice el estado visual';
    default:
      return 'Predicción';
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
  },
  progressHeader: {
    width: 150,
    marginBottom: Spacing[5],
    gap: Spacing[1],
  },
  progressText: {
    ...TextVariants.labelSm,
    color: DarkText.muted,
  },
  progressTrack: {
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: DarkSurfaces.surfaceElevated,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: Accent[500],
  },
  typeLabel: {
    ...TextVariants.labelMd,
    color: Accent[300],
    marginBottom: Spacing[2],
  },
  question: {
    ...TextVariants.bodyLg,
    color: DarkText.primary,
    marginBottom: Spacing[5],
  },
  input: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    borderRadius: BorderRadius.md,
    padding: Spacing[4],
    color: DarkText.primary,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    marginBottom: Spacing[4],
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pseudocodeBox: {
    gap: Spacing[4],
    marginBottom: Spacing[4],
  },
  codeLine: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.28)',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    padding: Spacing[4],
    color: DarkText.primary,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },
  blank: {
    color: Accent[300],
    fontFamily: FontFamilies.bold,
  },
  optionGrid: {
    gap: Spacing[3],
  },
  optionChip: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    backgroundColor: DarkSurfaces.surfaceElevated,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  optionChipActive: {
    borderColor: Accent[500],
    backgroundColor: 'rgba(0, 212, 255, 0.16)',
  },
  optionText: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
  },
  optionTextActive: {
    color: DarkText.primary,
  },
  barsExercise: {
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  stepHint: {
    ...TextVariants.labelMd,
    color: DarkText.secondary,
  },
  barsRow: {
    minHeight: 180,
    borderRadius: BorderRadius.md,
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  barSlot: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing[2],
  },
  bar: {
    width: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Accent[500],
  },
  barSelected: {
    backgroundColor: Semantic.warning,
  },
  barValue: {
    ...TextVariants.labelSm,
    color: DarkText.secondary,
  },
  barsHint: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultTitle: {
    ...TextVariants.h3,
    color: DarkText.primary,
    marginBottom: Spacing[4],
  },
  resultText: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  success: {
    color: Semantic.success,
  },
  error: {
    color: Semantic.error,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Spacing[6],
  },
  stat: {
    ...TextVariants.labelMd,
    color: Accent[500],
  },
});
