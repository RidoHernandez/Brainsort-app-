/**
 * ControlBar.tsx
 * BrainSort — Barra de control de simulación
 *
 * Implementa (HU-04, HU-06):
 *   - Botón Play / Pause
 *   - Botón paso anterior / siguiente (manual)
 *   - Botón Reiniciar
 *   - Slider de velocidad [0.25x → 2.0x] en incrementos de 0.25
 *   - Al completar: deshabilita Play, habilita Reiniciar (HU-06)
 *
 * Referencia: library-simulation.spec.md §2 HU-04, HU-06
 *             constitution.md §3 velocidad [0.25, 2.0] incrementos 0.25
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DarkSurfaces, DarkText, Accent, Primary, Semantic } from '../../styles/colors';
import { BorderRadius, BorderWidths, LayoutSizes, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ControlBarProps {
  isPlaying: boolean;
  isCompleted: boolean;
  speed: number;
  hasSteps: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onSpeedChange: (speed: number) => void;
  showInlineValues?: boolean;
  onToggleInlineValues?: () => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },

  // Fila principal: prev | play/pause | next | reset
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
  },

  // Botón secundario (prev/next)
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DarkSurfaces.surface,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonDisabled: { opacity: 0.4 },
  iconText: { fontSize: 18, color: DarkText.primary },
  resetIconText: { fontSize: 18, color: Semantic.error },

  // Botón Play/Pause (prominente)
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Accent[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonDisabled: { backgroundColor: DarkSurfaces.border, opacity: 0.5 },
  playIcon: { fontSize: 22, color: '#0F1318' },

  // Botón Reset
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(208, 2, 27, 0.12)',
    borderWidth: BorderWidths.thin,
    borderColor: Semantic.error,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Fila de velocidad
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  speedLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
    color: DarkText.muted,
    minWidth: 28,
  },
  speedOptions: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing[1],
    flexWrap: 'wrap',
  },
  speedChip: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    backgroundColor: DarkSurfaces.surface,
  },
  speedChipActive: {
    borderColor: Accent[500],
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  speedChipText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
    color: DarkText.muted,
  },
  speedChipTextActive: { color: Accent[500] },
  variablesToggleChip: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    backgroundColor: DarkSurfaces.surface,
  },
  variablesToggleChipActive: {
    borderColor: Accent[500],
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
  },
  variablesToggleText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
    color: DarkText.muted,
  },
  variablesToggleTextActive: {
    color: Accent[500],
  },

  // Indicador de estado completado
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(126, 211, 33, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing[2],
    gap: Spacing[2],
  },
  completedText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: '#7ED321',
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

export const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  isCompleted,
  speed,
  hasSteps,
  onPlay,
  onPause,
  onReset,
  onPreviousStep,
  onNextStep,
  onSpeedChange,
  showInlineValues = false,
  onToggleInlineValues,
}) => {
  const canPlay = hasSteps && !isCompleted;

  return (
    <View style={styles.container}>
      {/* Banner de completado */}
      {isCompleted && (
        <View style={styles.completedBanner} accessibilityRole="text">
          <Text>✅</Text>
          <Text style={styles.completedText}>¡Algoritmo completado!</Text>
        </View>
      )}

      {/* Controles principales */}
      <View style={styles.controlRow}>
        {/* Anterior */}
        <TouchableOpacity
          style={[styles.iconButton, !hasSteps && styles.iconButtonDisabled]}
          onPress={onPreviousStep}
          disabled={!hasSteps}
          accessibilityRole="button"
          accessibilityLabel="Paso anterior"
          testID="btn-prev-step"
        >
          <Text style={styles.iconText}>⏮</Text>
        </TouchableOpacity>

        {/* Play / Pause */}
        <TouchableOpacity
          style={[styles.playButton, !canPlay && styles.playButtonDisabled]}
          onPress={isPlaying ? onPause : onPlay}
          disabled={!canPlay}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pausar' : 'Reproducir'}
          accessibilityState={{ disabled: !canPlay }}
          testID="btn-play-pause"
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        {/* Siguiente */}
        <TouchableOpacity
          style={[styles.iconButton, !hasSteps && styles.iconButtonDisabled]}
          onPress={onNextStep}
          disabled={!hasSteps}
          accessibilityRole="button"
          accessibilityLabel="Paso siguiente"
          testID="btn-next-step"
        >
          <Text style={styles.iconText}>⏭</Text>
        </TouchableOpacity>

        {/* Reiniciar */}
        <TouchableOpacity
          style={[styles.resetButton, !hasSteps && styles.iconButtonDisabled]}
          onPress={onReset}
          disabled={!hasSteps}
          accessibilityRole="button"
          accessibilityLabel="Reiniciar simulación"
          testID="btn-reset"
        >
          <Text style={styles.resetIconText}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Velocidad */}
      <View style={styles.speedRow}>
        <Text style={styles.speedLabel}>Vel.</Text>
        <View style={styles.speedOptions}>
          {SPEED_OPTIONS.map((s) => {
            const isActive = s === speed;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.speedChip, isActive && styles.speedChipActive]}
                onPress={() => onSpeedChange(s)}
                accessibilityRole="radio"
                accessibilityState={{ checked: isActive }}
                accessibilityLabel={`Velocidad ${s}x`}
                testID={`speed-${s}`}
              >
                <Text
                  style={[
                    styles.speedChipText,
                    isActive && styles.speedChipTextActive,
                  ]}
                >
                  {s}×
                </Text>
              </TouchableOpacity>
            );
          })}

          {onToggleInlineValues && (
            <>
              {/* Separador visual ligero */}
              <View
                style={{
                  width: 1,
                  height: 16,
                  backgroundColor: DarkSurfaces.border,
                  marginHorizontal: Spacing[1],
                  alignSelf: 'center',
                }}
              />
              <TouchableOpacity
                style={[styles.variablesToggleChip, showInlineValues && styles.variablesToggleChipActive]}
                onPress={onToggleInlineValues}
                accessibilityRole="button"
                accessibilityLabel="Activar/desactivar valores de variables inline"
                testID="btn-toggle-inline-values"
              >
                <Text style={[styles.variablesToggleText, showInlineValues && styles.variablesToggleTextActive]}>
                  {showInlineValues ? 'Var: On' : 'Var: Off'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};
