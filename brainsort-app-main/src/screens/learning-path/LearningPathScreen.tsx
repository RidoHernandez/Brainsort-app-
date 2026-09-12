import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { learningPathService, RutaAprendizajeResponse } from '../../services/learning-path.service';
import { progressService, UsuarioProgreso } from '../../services/progress.service';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Accent, DarkSurfaces, DarkText } from '../../styles/colors';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { TextVariants } from '../../styles/typography';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

type LearningPathNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Ruta'>,
  NativeStackNavigationProp<Record<string, object | undefined>>
>;

type Props = {
  navigation: LearningPathNav;
};

export default function LearningPathScreen({ navigation }: Props) {
  const [ruta, setRuta] = useState<RutaAprendizajeResponse | null>(null);
  const [progreso, setProgreso] = useState<UsuarioProgreso | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError(false);
      Promise.all([
        learningPathService.getMiRuta(),
        progressService.getUserProgress(),
      ])
        .then(([rutaRes, progresoRes]) => {
          setRuta(rutaRes);
          setProgreso(progresoRes);
          setLoading(false);
        })
        .catch((err) => {
          console.log('Error fetching learning path data:', err);
          setError(true);
          setLoading(false);
        });
    }, []),
  );

  const getDificultadColor = (dificultad: string) => {
    switch (dificultad.toLowerCase()) {
      case 'facil':
      case 'fácil':
        return '#10B981'; // Green
      case 'medio':
        return '#F59E0B'; // Amber
      case 'dificil':
      case 'difícil':
        return '#EF4444'; // Red
      default:
        return '#9AA9B6';
    }
  };

  if (loading) {
    return (
      <SafeAreaWrapper>
        <Header title="Mi Ruta" />
        <View style={styles.centerContainer}>
          <ActivityIndicator color={Accent[500]} size="large" />
          <Text style={styles.loadingText}>Cargando tu ruta personalizada...</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (error || !ruta) {
    return (
      <SafeAreaWrapper>
        <Header title="Mi Ruta" />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🧭</Text>
          <Text style={styles.title}>Ruta no asignada</Text>
          <Text style={[styles.subtitle, styles.subtitleCentered]}>
            Aún no tienes una ruta de aprendizaje. Realiza el test diagnóstico para que
            podamos recomendarte algoritmos adaptados a tu nivel.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.getParent()?.navigate('DiagnosticTest')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>Hacer Test Diagnóstico</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Header title="Mi Ruta" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Diagnostic Banner if evaluated */}
        {ruta.diagnostico && (
          <View style={styles.bannerCard}>
            <View style={styles.bannerHeader}>
              <Text style={styles.bannerTitle}>Evaluación Diagnóstica</Text>
              <View style={styles.bannerBadge}>
                <Text style={styles.bannerBadgeText}>{ruta.diagnostico.puntaje}% Score</Text>
              </View>
            </View>
            <Text style={styles.bannerText}>
              Tu nivel fue evaluado el {new Date(ruta.diagnostico.fechaEvaluacion).toLocaleDateString()}. En base a esto secuenciamos pedagógicamente tu ruta.
            </Text>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => navigation.getParent()?.navigate('DiagnosticTest')}
              activeOpacity={0.85}
            >
              <Text style={styles.retakeButtonText}>🔄 Volver a realizar Evaluación</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.title}>Tu Camino a Seguir</Text>
        <Text style={styles.subtitle}>
          Esta es la secuencia recomendada según tu nivel de conocimientos. Toca cualquier elemento para ver sus detalles.
        </Text>

        <View style={styles.timeline}>
          {ruta.algoritmos.map((algo, idx) => {
            const algoProgreso = progreso?.algoritmosProgreso?.find(
              (ap) => ap.algoritmoId === algo.id
            );
            const corrects = algoProgreso?.ejerciciosCorrectos ?? 0;
            const totals = algoProgreso?.ejerciciosTotales ?? 0;
            const pct = totals > 0 ? (corrects / totals) * 100 : 0;
            const isCompleted = totals > 0 && corrects === totals;
            const isInProgress = totals > 0 && corrects > 0 && corrects < totals;

            // Circle state color
            let circleBg: string = DarkSurfaces.surfaceElevated;
            let stepColor: string = DarkText.muted;
            if (isCompleted) {
              circleBg = '#10B981'; // Green
              stepColor = '#000000';
            } else if (isInProgress) {
              circleBg = Accent[500]; // Cyan
              stepColor = '#000000';
            }

            return (
              <TouchableOpacity
                key={algo.id}
                style={styles.node}
                onPress={() =>
                  navigation.navigate('Biblioteca', {
                    screen: 'AlgorithmDetail',
                    params: { algoritmoId: algo.id },
                  })
                }
                activeOpacity={0.85}
              >
                {/* Visual Circle on Timeline */}
                <View style={[styles.circle, { backgroundColor: circleBg }]}>
                  <Text style={[styles.stepNum, { color: stepColor }]}>
                    {isCompleted ? '✓' : idx + 1}
                  </Text>
                </View>

                {/* Node Card Info */}
                <View style={styles.info}>
                  <View style={styles.nodeHeader}>
                    <Text style={styles.algoName}>{algo.nombre}</Text>
                    <View
                      style={[
                        styles.diffBadge,
                        { borderColor: getDificultadColor(algo.dificultad || '') },
                      ]}
                    >
                      <Text
                        style={[
                          styles.diffText,
                          { color: getDificultadColor(algo.dificultad || '') },
                        ]}
                      >
                        {algo.dificultad}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.algoCat}>{algo.categoria}</Text>
                  {algo.descripcion && (
                    <Text style={styles.algoDesc} numberOfLines={2}>
                      {algo.descripcion}
                    </Text>
                  )}

                  {/* Progress Indicator */}
                  <View style={styles.nodeProgressContainer}>
                    <View style={styles.nodeProgressTextRow}>
                      <Text style={styles.nodeProgressText}>
                        Progreso: {corrects}/{totals} ejercicios
                      </Text>
                      <Text style={styles.nodeProgressPercent}>
                        {Math.round(pct)}%
                      </Text>
                    </View>
                    <View style={styles.nodeProgressTrack}>
                      <View
                        style={[
                          styles.nodeProgressFill,
                          {
                            width: `${pct}%`,
                            backgroundColor: isCompleted ? '#10B981' : Accent[500],
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[6],
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    padding: Spacing[4],
    paddingBottom: Spacing[8],
  },
  loadingText: {
    color: DarkText.muted,
    marginTop: Spacing[4],
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing[4],
  },
  title: {
    ...TextVariants.h2,
    color: DarkText.primary,
    marginBottom: Spacing[2],
  },
  subtitle: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    marginBottom: Spacing[6],
    lineHeight: 20,
  },
  subtitleCentered: {
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  bannerCard: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[5],
    marginBottom: Spacing[6],
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  bannerTitle: {
    ...TextVariants.labelMd,
    fontWeight: 'bold',
    color: DarkText.primary,
  },
  bannerBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
    borderWidth: 1,
    borderColor: Accent[500],
  },
  bannerBadgeText: {
    ...TextVariants.bodySm,
    color: Accent[500],
    fontWeight: 'bold',
  },
  bannerText: {
    ...TextVariants.bodySm,
    color: DarkText.secondary,
    lineHeight: 18,
    marginBottom: Spacing[4],
  },
  retakeButton: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing[2],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
  },
  retakeButtonText: {
    ...TextVariants.labelMd,
    color: DarkText.primary,
  },
  timeline: {
    paddingLeft: Spacing[2],
    borderLeftWidth: 2,
    borderLeftColor: DarkSurfaces.surfaceElevated,
    marginLeft: Spacing[3.5],
  },
  node: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing[6],
    position: 'relative',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: DarkSurfaces.border,
    position: 'absolute',
    left: -27,
    top: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepNum: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  info: {
    marginLeft: Spacing[6],
    backgroundColor: DarkSurfaces.surface,
    padding: Spacing[4],
    borderRadius: BorderRadius.md,
    flex: 1,
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[1],
  },
  algoName: {
    ...TextVariants.labelMd,
    fontWeight: 'bold',
    color: DarkText.primary,
    flex: 1,
    marginRight: Spacing[2],
  },
  diffBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[0.5],
    borderWidth: 1,
  },
  diffText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  algoCat: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    marginBottom: Spacing[2.5],
  },
  algoDesc: {
    ...TextVariants.bodySm,
    color: DarkText.secondary,
    lineHeight: 18,
    marginBottom: Spacing[4],
  },
  nodeProgressContainer: {
    marginTop: Spacing[2],
  },
  nodeProgressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[1.5],
  },
  nodeProgressText: {
    fontSize: 11,
    color: DarkText.muted,
  },
  nodeProgressPercent: {
    fontSize: 11,
    color: DarkText.primary,
    fontWeight: 'bold',
  },
  nodeProgressTrack: {
    height: 4,
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  nodeProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  actionButton: {
    backgroundColor: Accent[500],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[2.5],
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
