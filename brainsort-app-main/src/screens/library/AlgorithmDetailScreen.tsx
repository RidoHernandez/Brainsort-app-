/**
 * AlgorithmDetailScreen.tsx
 * BrainSort — Pantalla de detalle de un algoritmo
 *
 * task_breakdown.md T-FE-096
 *
 * Implementa HU-02 (Seleccionar un Algoritmo):
 *   - Muestra título del algoritmo en la barra de navegación
 *   - Spinner temático durante carga
 *   - Descripción completa del algoritmo
 *   - Complejidades de tiempo y espacio (Big O)
 *   - Modal "Próximamente" si el algoritmo no está activo
 *   - Botón "Iniciar Simulación" que navega a SimulationScreen
 *
 * Referencia: library-simulation.spec.md §2 HU-02
 *             04-contratos-api.md §3 CO2 getAlgoritmo()
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { AlgorithmTheory } from '../../components/algorithm/AlgorithmTheory';
import { Spinner } from '../../components/common/Spinner';
import {
  DifficultyBadge,
  normalizeDificultad,
} from '../../components/algorithm/DifficultyBadge';
import {
  DarkSurfaces,
  DarkText,
  Primary,
  Accent,
  Semantic,
  SimulationColors,
} from '../../styles/colors';
import { BorderRadius, BorderWidths, Spacing, SpacingAlias } from '../../styles/spacing';
import {
  FontFamilies,
  FontSizes,
  FontWeights,
  TextVariants,
} from '../../styles/typography';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import { SimulationContent } from '../simulation/SimulationScreen';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<LibraryStackParamList, 'AlgorithmDetail'>;

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SpacingAlias.screenPaddingX,
    paddingTop: Spacing[6],
    paddingBottom: Spacing[16],
  },

  breadcrumbText: {
    ...TextVariants.bodyMd,
    color: DarkText.muted,
    marginBottom: Spacing[2],
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  title: {
    ...TextVariants.h1,
    color: DarkText.primary,
    flex: 1,
  },
  descriptionTopText: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    marginBottom: Spacing[5],
    lineHeight: 24,
  },
  complexityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
    marginBottom: Spacing[6],
  },
  complexityCardIndividual: {
    flex: 1,
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: DarkSurfaces.borderSubtle,
    padding: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  complexityIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  complexityIconText: {
    fontSize: 16,
    color: Accent[500],
  },
  complexityContent: {
    flex: 1,
  },
  complexityLabel: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: DarkText.muted,
    marginBottom: 2,
  },
  complexityValue: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    color: DarkText.primary,
  },

  descriptionText: {
    ...TextVariants.bodyLg,
    color: DarkText.primary,
    lineHeight: 26,
    marginBottom: Spacing[6],
  },

  // Botón principal
  startButton: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    marginTop: Spacing[6],
  },
  startButtonText: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.lg,
    color: '#FFFFFF',
  },
  startButtonIcon: {
    fontSize: FontSizes.lg,
    color: '#FFFFFF',
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  simulationSection: {
    marginTop: Spacing[6],
    gap: Spacing[4],
  },
  simulationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCounter: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.muted,
  },
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
  canvasContainer: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    padding: Spacing[3],
    overflow: 'hidden',
  },
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
  dataInputSection: {
    gap: Spacing[2],
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
  dataInput: {
    flex: 1,
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
    color: DarkText.primary,
    minHeight: 44,
  },
  dataInputError: {
    borderColor: Semantic.error,
  },
  applyButton: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[4],
    justifyContent: 'center',
    minHeight: 44,
  },
  applyButtonText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: '#FFFFFF',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
  },
  generateButtonText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
  },
  inputErrorText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: Semantic.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[10],
    gap: Spacing[3],
  },
  emptyIcon: { fontSize: 36 },
  emptyText: { ...TextVariants.bodyMd, color: DarkText.muted, textAlign: 'center' },
  toastContainer: {
    position: 'absolute',
    top: Spacing[4],
    left: Spacing[4],
    right: Spacing[4],
    backgroundColor: 'rgba(30, 40, 30, 0.96)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: SimulationColors.final,
    padding: Spacing[4],
    gap: Spacing[3],
    zIndex: 100,
  },
  toastTitle: {
    ...TextVariants.h4,
    color: SimulationColors.final,
    textAlign: 'center',
  },
  toastActions: {
    flexDirection: 'row',
    gap: Spacing[2],
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  toastBtn: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    backgroundColor: DarkSurfaces.surface,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
  },
  toastBtnPrimary: {
    backgroundColor: Primary[500],
    borderColor: Primary[500],
  },
  toastBtnText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
  },
  toastBtnTextPrimary: { color: '#FFFFFF' },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SpacingAlias.screenPaddingX,
    gap: Spacing[4],
  },
  errorText: {
    ...TextVariants.h4,
    color: Semantic.error,
    textAlign: 'center',
  },

  // Modal "Próximamente"
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8,11,15,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[6],
  },
  modalCard: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: SpacingAlias.modalPadding,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    gap: Spacing[4],
  },
  modalIcon: {
    fontSize: 48,
  },
  modalTitle: {
    ...TextVariants.h3,
    color: DarkText.primary,
    textAlign: 'center',
  },
  modalDesc: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    textAlign: 'center',
  },
  modalClose: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.md,
    paddingHorizontal: SpacingAlias.buttonPaddingX,
    paddingVertical: SpacingAlias.buttonPaddingY,
    marginTop: Spacing[2],
  },
  modalCloseText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
    color: '#FFFFFF',
  },
  fixedFooter: {
    width: '100%',
    padding: Spacing[4],
    backgroundColor: DarkSurfaces.surface,
    borderTopWidth: 1,
    borderTopColor: DarkSurfaces.border,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  footerInner: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  theoryWrapper: {
    marginTop: Spacing[6],
    paddingTop: Spacing[6],
    borderTopWidth: 1,
    borderTopColor: DarkSurfaces.borderSubtle,
  },
});



// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de detalle de algoritmo (HU-02).
 */
export default function AlgorithmDetailScreen({ navigation, route }: Props) {
  const { algoritmoId } = route.params;
  const { algoritmo, isLoading, isError } = useAlgorithm(algoritmoId);
  const [showProximamente, setShowProximamente] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (algoritmo?.nombre) {
      navigation.setOptions({ title: algoritmo.nombre });
    }
  }, [algoritmo?.nombre, navigation]);

  if (isLoading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Spinner size="large" />
      </View>
    );
  }

  if (isError || !algoritmo) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={{ fontSize: 48 }}>⚠️</Text>
        <Text style={styles.errorText}>
          No se pudo cargar el algoritmo.{'\n'}Intenta de nuevo más tarde.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.modalClose}
          accessibilityRole="button"
          accessibilityLabel="Volver a la biblioteca"
        >
          <Text style={styles.modalCloseText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  try {
    const dificultad = normalizeDificultad(algoritmo.dificultad);
    const esActivo = (algoritmo as any).activo !== false;

    const handleStartSimulation = () => {
      if (!esActivo) {
        setShowProximamente(true);
        return;
      }
      setShowSimulation(true);
    };

    if (showSimulation && esActivo) {
      return (
        <View style={styles.container}>
          <SimulationContent
            algoritmoId={algoritmoId}
            onRequestBack={() => setShowSimulation(false)}
            showAlgorithmHeader={false}
          />
        </View>
      );
    }

    const startButtonElement = (
      <TouchableOpacity
        style={[styles.startButton, !esActivo ? styles.startButtonDisabled : null]}
        onPress={handleStartSimulation}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={
          esActivo ? `Iniciar simulación de ${algoritmo.nombre}` : `${algoritmo.nombre} no disponible aún`
        }
        testID="btn-start-simulation"
      >
        <Text style={styles.startButtonIcon}>▶</Text>
        <Text style={styles.startButtonText}>
          {esActivo
            ? showSimulation
              ? 'Simulación activa'
              : 'Iniciar Simulación'
            : 'Próximamente'}
        </Text>
      </TouchableOpacity>
    );

    return (
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.breadcrumbText}>
              Biblioteca / {algoritmo.categoria} / {algoritmo.nombre}
            </Text>

            <View style={styles.titleRow}>
              <Text style={styles.title}>{algoritmo.nombre}</Text>
              <DifficultyBadge dificultad={dificultad} />
            </View>

            <Text style={styles.descriptionTopText}>{algoritmo.descripcion}</Text>

            <View style={styles.complexityRow}>
              <View style={styles.complexityCardIndividual}>
                <View style={styles.complexityIconBox}>
                  <Text style={styles.complexityIconText}>🕒</Text>
                </View>
                <View style={styles.complexityContent}>
                  <Text style={styles.complexityLabel}>Tiempo</Text>
                  <Text style={[styles.complexityValue, { fontSize: FontSizes.lg }]}>{algoritmo.complejidadTiempo}</Text>
                </View>
              </View>

              <View style={styles.complexityCardIndividual}>
                <View style={styles.complexityIconBox}>
                  <Text style={styles.complexityIconText}>📦</Text>
                </View>
                <View style={styles.complexityContent}>
                  <Text style={styles.complexityLabel}>Espacio</Text>
                  <Text style={[styles.complexityValue, { fontSize: FontSizes.lg }]}>{algoritmo.complejidadEspacio}</Text>
                </View>
              </View>

              <View style={styles.complexityCardIndividual}>
                <View style={styles.complexityIconBox}>
                  <Text style={styles.complexityIconText}>📁</Text>
                </View>
                <View style={styles.complexityContent}>
                  <Text style={styles.complexityLabel}>Categoría</Text>
                  <Text style={[styles.complexityValue, { fontSize: FontSizes.md }]} numberOfLines={1}>
                    {algoritmo.categoria}
                  </Text>
                </View>
              </View>
            </View>

            {algoritmo?.nombre && (
              <View style={styles.theoryWrapper}>
                <AlgorithmTheory algoritmoNombre={algoritmo.nombre} />
              </View>
            )}
          </ScrollView>
        </View>

        {/* Botón de Iniciar Simulación anclado abajo y centrado */}
        <View style={styles.fixedFooter}>
          <View style={styles.footerInner}>
            {startButtonElement}
          </View>
        </View>

        <Modal
          visible={showProximamente}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProximamente(false)}
          accessibilityViewIsModal
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowProximamente(false)}
            accessibilityLabel="Cerrar modal"
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalIcon}>🚧</Text>
              <Text style={styles.modalTitle}>Próximamente</Text>
              <Text style={styles.modalDesc}>
                Este algoritmo estará disponible muy pronto. Mientras tanto,
                explora los demás algoritmos de la biblioteca.
              </Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowProximamente(false)}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
              >
                <Text style={styles.modalCloseText}>Entendido</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  } catch (e: any) {
    console.error("DEBUG ERROR IN RENDER:", e);
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0E17', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FF4A4A', fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>
          Error de Renderizado (Debug)
        </Text>
        <Text style={{ color: '#E2E8F0', fontSize: 16, fontFamily: 'monospace', marginBottom: 16, textAlign: 'center' }}>
          {e?.message || String(e)}
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'monospace', width: '100%', backgroundColor: '#1E293B', padding: 12, borderRadius: 8 }}>
          {e?.stack || 'No stack trace available'}
        </Text>
      </View>
    );
  }
}
