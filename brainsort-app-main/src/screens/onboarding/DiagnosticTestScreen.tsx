import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { diagnosticsService, PreguntaDiagnostico } from '../../services/diagnostics.service';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { DarkSurfaces, DarkText, Accent, Primary } from '../../styles/colors';
import { TextVariants } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

export default function DiagnosticTestScreen({
  navigation,
}: {
  navigation: { goBack: () => void; navigate: (name: string, params?: object) => void };
}) {
  const [preguntas, setPreguntas] = useState<PreguntaDiagnostico[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [stage, setStage] = useState<'welcome' | 'test' | 'results'>('welcome');
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    diagnosticsService
      .getPreguntas()
      .then(setPreguntas)
      .catch(console.error);
  }, []);

  const handleStart = () => {
    setStage('test');
    setCurrentIdx(0);
    setRespuestas([]);
    setSelectedOption(null);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const nuevasRespuestas = [...respuestas, selectedOption];
    setRespuestas(nuevasRespuestas);
    setSelectedOption(null);

    if (currentIdx < preguntas.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Finalizar test
      setLoading(true);
      diagnosticsService
        .evaluar(nuevasRespuestas)
        .then((res) => {
          setScore(res.puntaje);
          setStage('results');
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  const handleFinish = () => {
    navigation.navigate('MainTabs', { screen: 'Ruta' });
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <Header title="Evaluación" showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={Accent[500]} size="large" />
          <Text style={styles.loadingText}>Procesando tus respuestas y generando tu ruta...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Header
        title={stage === 'welcome' ? 'Test Diagnóstico' : stage === 'test' ? 'Evaluación Inicial' : 'Resultados'}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.mainContainer}>
        {stage === 'welcome' && (
          <View style={styles.contentCard}>
            <Text style={styles.welcomeTitle}>Evaluación Diagnóstica</Text>
            <Text style={styles.welcomeSubtitle}>
              Mide tus conocimientos teóricos sobre estructuras de datos y algoritmos para que podamos diseñar una ruta de aprendizaje adaptada a ti.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoEmoji}>💡</Text>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
                <Text style={styles.infoDesc}>
                  El test consta de {preguntas.length || 8} preguntas de opción múltiple. No te preocupes si no sabes una respuesta, esto es para ajustar tu nivel de estudio.
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleStart} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Comenzar Test</Text>
            </TouchableOpacity>
          </View>
        )}

        {stage === 'test' && preguntas.length > 0 && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressLabel}>Pregunta {currentIdx + 1} de {preguntas.length}</Text>
                <Text style={styles.progressPercent}>{Math.round(((currentIdx) / preguntas.length) * 100)}% completado</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${((currentIdx + 1) / preguntas.length) * 100}%` }]} />
              </View>
            </View>

            {/* Question Card */}
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{preguntas[currentIdx].pregunta}</Text>
            </View>

            {/* Options list */}
            <View style={styles.optionsContainer}>
              {preguntas[currentIdx].opciones.map((opcion, idx) => {
                const isSelected = selectedOption === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => setSelectedOption(idx)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.optionCheck, isSelected && styles.optionCheckSelected]}>
                      {isSelected && <View style={styles.optionCheckInner} />}
                    </View>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opcion}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action button */}
            <TouchableOpacity
              style={[styles.nextButton, selectedOption === null && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={selectedOption === null}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>
                {currentIdx === preguntas.length - 1 ? 'Finalizar Evaluación' : 'Confirmar y Continuar'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {stage === 'results' && score !== null && (
          <View style={styles.contentCard}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>🏆</Text>
            </View>
            <Text style={styles.welcomeTitle}>¡Test Completado!</Text>
            <Text style={styles.scoreNumber}>{score}%</Text>
            <Text style={styles.scoreLabel}>Tu puntaje teórico</Text>

            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackText}>
                {score >= 75
                  ? '¡Felicidades! Tienes excelentes bases teóricas de algoritmos. Hemos generado una ruta avanzada con estructuras de datos complejas (Pilas, Colas, Colas con Prioridad, Árboles) y algoritmos divide y vencerás como Merge Sort y Quick Sort.'
                  : score >= 40
                  ? '¡Buen trabajo! Tienes conocimientos de nivel intermedio. Tu ruta iniciará consolidando conceptos sobre búsqueda binaria y listas enlazadas, seguido de algoritmos de ordenamiento eficientes.'
                  : '¡Excelente comienzo! Hemos preparado una ruta completa para ti. Iniciaremos desde los fundamentos esenciales (búsquedas lineales, pilas y colas) y avanzaremos paulatinamente hacia temas de mayor complejidad.'}
              </Text>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleFinish} activeOpacity={0.85}>
              <Text style={styles.primaryButtonText}>Ver mi Ruta Personalizada</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    padding: Spacing[4],
  },
  center: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[6],
  },
  loadingText: {
    color: DarkText.muted,
    fontSize: 14,
    marginTop: Spacing[4],
    textAlign: 'center',
  },
  contentCard: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    alignItems: 'center',
  },
  welcomeTitle: {
    ...TextVariants.h2,
    color: DarkText.primary,
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  welcomeSubtitle: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    textAlign: 'center',
    marginBottom: Spacing[6],
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing[4],
    marginBottom: Spacing[6],
    width: '100%',
    alignItems: 'flex-start',
  },
  infoEmoji: {
    fontSize: 22,
    marginRight: Spacing[3],
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    ...TextVariants.labelMd,
    fontWeight: 'bold',
    color: DarkText.primary,
    marginBottom: Spacing[1],
  },
  infoDesc: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: Accent[500],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    ...TextVariants.labelMd,
    color: '#000',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: Spacing[8],
  },
  progressContainer: {
    marginBottom: Spacing[6],
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[2],
  },
  progressLabel: {
    ...TextVariants.labelMd,
    color: DarkText.primary,
  },
  progressPercent: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
  },
  progressTrack: {
    height: 6,
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Accent[500],
    borderRadius: BorderRadius.full,
  },
  questionCard: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[5],
    marginBottom: Spacing[5],
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
  },
  questionText: {
    ...TextVariants.h4,
    color: DarkText.primary,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: Spacing[6],
    gap: Spacing[3],
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
  },
  optionCardSelected: {
    borderColor: Accent[500],
    backgroundColor: DarkSurfaces.surfaceElevated,
  },
  optionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: DarkText.muted,
    marginRight: Spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCheckSelected: {
    borderColor: Accent[500],
  },
  optionCheckInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Accent[500],
  },
  optionText: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    flex: 1,
  },
  optionTextSelected: {
    color: DarkText.primary,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing[3.5],
    alignItems: 'center',
    width: '100%',
  },
  nextButtonDisabled: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    opacity: 0.5,
  },
  nextButtonText: {
    ...TextVariants.labelMd,
    color: '#000',
    fontWeight: 'bold',
  },
  successIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: DarkSurfaces.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  successIcon: {
    fontSize: 36,
  },
  scoreNumber: {
    ...TextVariants.h1,
    color: Accent[500],
    fontSize: 48,
    lineHeight: 56,
  },
  scoreLabel: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    marginBottom: Spacing[5],
  },
  feedbackCard: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing[5],
    width: '100%',
    marginBottom: Spacing[6],
  },
  feedbackText: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    lineHeight: 22,
    textAlign: 'center',
  },
});
