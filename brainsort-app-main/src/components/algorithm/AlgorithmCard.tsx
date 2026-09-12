/**
 * AlgorithmCard.tsx
 * BrainSort — Tarjeta premium de algoritmo para la biblioteca.
 */

import React, { useCallback } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Marker,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { AlgoritmoEnBiblioteca } from '../../services/library.service';
import { AlgoritmoProgreso } from '../../services/progress.service';
import {
  DifficultyBadge,
  normalizeDificultad,
} from './DifficultyBadge';
import { DarkText } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

export interface AlgorithmCardProps {
  algoritmo: AlgoritmoEnBiblioteca;
  onPress: (algoritmo: AlgoritmoEnBiblioteca) => void;
  progreso?: AlgoritmoProgreso;
}

const MAX_DESC_CHARS = 118;

const CATEGORY_LABELS: Record<string, string> = {
  Ordenamiento: 'Ordenamiento',
  Busqueda: 'Búsqueda',
  EstructurasLineales: 'Estructuras lineales',
};

function AlgorithmArt({ name }: { name: string }) {
  const common = {
    stroke: '#20D8E2',
    strokeWidth: 1.4,
    fill: 'rgba(0, 219, 226, 0.14)',
  };
  const accent = {
    stroke: '#A6FF2E',
    strokeWidth: 1.3,
    fill: 'rgba(166, 255, 46, 0.18)',
  };

  if (name === 'Bubble Sort') {
    return (
      <Svg viewBox="0 0 180 100" style={styles.artSvg}>
        <Ellipse cx="92" cy="24" rx="33" ry="9" {...common} />
        <Path d="M59 24v64c0 7 66 7 66 0V24" stroke="#20D8E2" strokeWidth={1.4} fill="none" />
        <Ellipse cx="92" cy="88" rx="33" ry="9" {...common} />
        <Circle cx="76" cy="42" r="6" {...common} />
        <Circle cx="105" cy="51" r="8" {...accent} />
        <Circle cx="86" cy="61" r="6" {...common} />
        <Circle cx="97" cy="70" r="5" {...common} />
        <Circle cx="78" cy="80" r="11" {...accent} />
        <Path d="M28 82 C58 66,72 84,92 58" stroke="#20D8E2" strokeWidth={1.2} fill="none" opacity={0.35} />
      </Svg>
    );
  }

  if (name === 'Insertion Sort') {
    return (
      <Svg viewBox="0 0 180 100" style={styles.artSvg}>
        <Defs>
          <Marker id="arrowInsertion" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <Path d="M0 0 L8 4 L0 8" fill="#D7EF22" />
          </Marker>
        </Defs>
        <Rect x="32" y="48" width="28" height="44" rx="2" {...common} />
        <Rect x="64" y="48" width="28" height="44" rx="2" {...common} />
        <Rect x="96" y="48" width="28" height="44" rx="2" {...common} />
        <Rect x="118" y="18" width="34" height="62" rx="5" {...accent} rotation={12} origin="135,49" />
        <Rect x="144" y="48" width="30" height="44" rx="2" stroke="#A6FF2E" strokeDasharray="4 3" fill="none" opacity={0.6} />
        <Path d="M112 82v-22" stroke="#D7EF22" strokeWidth={1.6} fill="none" markerEnd="url(#arrowInsertion)" />
      </Svg>
    );
  }

  if (name === 'Selection Sort') {
    return (
      <Svg viewBox="0 0 180 100" style={styles.artSvg}>
        <G x={22} y={35}>
          {[0, 23, 46, 69, 92, 115].map((x) => (
            <Rect key={x} x={x} y={0} width={20} height={22} rx={2} {...common} />
          ))}
        </G>
        <SvgText x="83" y="51" fill="#D8FBFF" fontSize="16" fontWeight="800">1</SvgText>
        <Path d="M92 51 L122 80 L110 82 L110 96 L99 94 L101 81 L89 87 Z" stroke="#20D8E2" fill="rgba(0,220,226,.12)" />
      </Svg>
    );
  }

  if (name === 'Linked List') {
    return (
      <Svg viewBox="0 0 180 100" style={styles.artSvg}>
        <Defs>
          <Marker id="arrowLinked" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <Path d="M0 0 L8 4 L0 8" fill="#D7EF22" />
          </Marker>
        </Defs>
        <Circle cx="32" cy="48" r="8" {...common} />
        <Circle cx="32" cy="72" r="12" {...common} />
        <Rect x="66" y="55" width="24" height="24" rx="4" {...accent} rotation={15} origin="78,67" />
        <Rect x="106" y="63" width="24" height="24" rx="4" {...accent} rotation={15} origin="118,75" />
        <Rect x="146" y="47" width="24" height="24" rx="4" {...common} rotation={-18} origin="158,59" />
        <Circle cx="158" cy="82" r="11" {...common} />
        <Path d="M44 55 C52 62 58 64 66 66" stroke="#D7EF22" strokeWidth={1.6} fill="none" markerEnd="url(#arrowLinked)" />
        <Path d="M90 68 C98 72 100 73 106 75" stroke="#D7EF22" strokeWidth={1.6} fill="none" markerEnd="url(#arrowLinked)" />
        <Path d="M130 70 C139 67 141 63 146 60" stroke="#D7EF22" strokeWidth={1.6} fill="none" markerEnd="url(#arrowLinked)" />
      </Svg>
    );
  }

  if (name === 'Queue') {
    return (
      <Svg viewBox="0 0 180 100" style={styles.artSvg}>
        <Defs>
          <Marker id="arrowQueue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <Path d="M0 0 L8 4 L0 8" fill="#D7EF22" />
          </Marker>
        </Defs>
        <Rect x="45" y="42" width="94" height="34" rx="17" {...common} rotation={13} origin="92,59" />
        <Path d="M60 43 C50 55,52 69,65 78 M75 45 C65 57,67 72,80 80 M91 48 C82 60,84 74,96 82 M107 50 C99 61,101 75,113 80 M124 54 C116 64,118 75,130 78" stroke="#20D8E2" strokeWidth={1.3} fill="none" />
        <Rect x="28" y="38" width="17" height="17" {...common} rotation={20} origin="36,46" />
        <Rect x="143" y="41" width="17" height="17" {...common} rotation={20} origin="151,49" />
        <Rect x="152" y="76" width="14" height="14" {...common} rotation={20} origin="159,83" />
        <Path d="M139 70 C153 68 158 62 160 51" stroke="#D7EF22" strokeWidth={1.6} fill="none" markerEnd="url(#arrowQueue)" />
      </Svg>
    );
  }

  return (
    <Svg viewBox="0 0 180 100" style={styles.artSvg}>
      <Defs>
        <Marker id="arrowStack" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <Path d="M0 0 L8 4 L0 8" fill="#D7EF22" />
        </Marker>
      </Defs>
      <G x={90} y={30}>
        <Path d="M0 0 L26 12 L26 66 L0 80 L-26 66 L-26 12 Z" {...common} />
        <Path d="M-26 12 L0 25 L26 12 M-26 29 L0 42 L26 29 M-26 46 L0 59 L26 46 M0 25 L0 80" stroke="#20D8E2" strokeWidth={1.3} fill="none" />
      </G>
      <Rect x="55" y="14" width="17" height="17" {...common} />
      <Rect x="84" y="6" width="17" height="17" {...common} />
      <Rect x="115" y="14" width="17" height="17" {...common} />
      <Path d="M64 32 C70 42 76 44 84 45" stroke="#D7EF22" strokeWidth={1.6} fill="none" markerEnd="url(#arrowStack)" />
      <Path d="M124 32 C117 42 110 44 101 45" stroke="#D7EF22" strokeWidth={1.6} fill="none" markerEnd="url(#arrowStack)" />
    </Svg>
  );
}

export const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  algoritmo,
  onPress,
  progreso,
}) => {
  const [pressed, setPressed] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const handlePress = useCallback(() => {
    onPress(algoritmo);
  }, [algoritmo, onPress]);

  const categoryLabel = CATEGORY_LABELS[algoritmo.categoria] ?? algoritmo.categoria;
  const dificultad = normalizeDificultad(algoritmo.dificultad);
  const categoryKey = categoryLabel.trim().toLowerCase();
  const tags = [
    categoryLabel,
    ...(algoritmo.tags ?? []).filter(
      (tag) => tag.trim().toLowerCase() !== categoryKey,
    ),
  ].slice(0, 4);
  const truncatedDesc =
    algoritmo.descripcion.length > MAX_DESC_CHARS
      ? `${algoritmo.descripcion.slice(0, MAX_DESC_CHARS - 3)}...`
      : algoritmo.descripcion;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={`Ver algoritmo ${algoritmo.nombre}, categoría ${categoryLabel}`}
      accessibilityHint="Abre el detalle del algoritmo"
      testID={`algorithm-card-${algoritmo.id}`}
      style={styles.touchable}
    >
      <View
        style={[
          styles.card,
          (pressed || focused) && styles.cardSelected,
        ]}
      >
        <View style={styles.topLayer}>
          <DifficultyBadge dificultad={dificultad} />
        </View>

        <View style={styles.artWrap}>
          <AlgorithmArt name={algoritmo.nombre} />
        </View>

        <View style={styles.copyBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {algoritmo.nombre}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {truncatedDesc}
          </Text>
          <View style={styles.tagsSpacer} />
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {progreso && progreso.ejerciciosTotales > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.round(
                        (progreso.ejerciciosCorrectos /
                          progreso.ejerciciosTotales) *
                          100,
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(
                  (progreso.ejerciciosCorrectos /
                    progreso.ejerciciosTotales) *
                    100,
                )}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Tiempo</Text>
            <Text style={styles.metricValue}>{algoritmo.complejidadTiempo}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Espacio</Text>
            <Text style={styles.metricValue}>{algoritmo.complejidadEspacio}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 176,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(126, 157, 183, 0.22)',
    backgroundColor: 'rgba(10, 24, 39, 0.88)',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[2],
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 12px 26px rgba(0,0,0,0.18), inset 0 0 24px rgba(255,255,255,0.012)',
      } as any,
      android: { elevation: 3 },
    }),
  },
  cardSelected: {
    transform: [{ scale: 0.99 }],
    borderColor: '#A6FF2E',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 1px rgba(166,255,46,0.28), 0 0 24px rgba(166,255,46,0.14)',
      } as any,
    }),
  },
  topLayer: {
    minHeight: 24,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    zIndex: 3,
  },
  artWrap: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
    marginBottom: Spacing[2],
  },
  artSvg: {
    width: 112,
    height: 62,
  },
  copyBlock: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
  },
  name: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 20,
    lineHeight: 23,
    color: DarkText.primary,
    marginBottom: Spacing[1],
  },
  description: {
    fontFamily: FontFamilies.regular,
    fontWeight: FontWeights.regular,
    fontSize: FontSizes.sm,
    lineHeight: 16,
    minHeight: 32,
    color: '#C4CDD5',
    marginBottom: Spacing[3],
  },
  tagsSpacer: {
    flex: 1,
    minHeight: Spacing[2],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1],
    alignContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: Spacing[4],
  },
  tagBadge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(126, 157, 183, 0.21)',
    backgroundColor: 'rgba(18, 38, 55, 0.75)',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  tagText: {
    color: '#D7E2E8',
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: 9,
    lineHeight: 11,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(126, 157, 183, 0.19)',
    paddingTop: Spacing[3],
    marginTop: Spacing[1],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing[2],
  },
  metricLabel: {
    color: '#A9B5BE',
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
  },
  metricValue: {
    color: '#A6FF2E',
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing[1],
    marginBottom: Spacing[2],
    gap: Spacing[2],
  },
  progressBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
    backgroundColor: '#9EFF4E',
  },
  progressText: {
    color: '#D7E2E8',
    fontFamily: FontFamilies.semiBold,
    fontSize: 10,
    lineHeight: 12,
    minWidth: 26,
    textAlign: 'right',
  },
});
