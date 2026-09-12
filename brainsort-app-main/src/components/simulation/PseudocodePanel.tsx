/**
 * PseudocodePanel.tsx
 * BrainSort — Panel de pseudocódigo sincronizado con la simulación
 *
 * Resalta la línea activa del pseudocódigo según el paso actual.
 * Usa ScrollView para algoritmos con muchas líneas.
 * Indentación proporcional al nivel del código.
 *
 * Referencia: library-simulation.spec.md §2 HU-04
 *             library.service.ts PseudocodeLine interface
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DarkSurfaces, DarkText, Accent } from '../../styles/colors';
import { BorderRadius, BorderWidths, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import type { PseudocodeLine } from '../../services/library.service';
import type { SimulationStep } from '@brainsort/core';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PseudocodePanelProps {
  lines: PseudocodeLine[];
  currentStep: SimulationStep | null;
  showInlineValues?: boolean;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const INDENT_UNIT = 16; // dp por nivel de indentación
const LINE_HEIGHT = 26;
const VISIBLE_CODE_HEIGHT = 170;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F1318',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: DarkSurfaces.borderSubtle,
    maxHeight: 220,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: BorderWidths.thin,
    borderBottomColor: DarkSurfaces.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: FontFamilies.semiBold,
    fontSize: FontSizes.xs,
    color: DarkText.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  scroll: { flex: 1 },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: Spacing[3],
    minHeight: LINE_HEIGHT,
  },
  lineActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: Accent[500],
  },
  lineNumber: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.xs,
    color: DarkText.disabled,
    width: 28,
    textAlign: 'right',
    paddingRight: Spacing[2],
  },
  lineNumberActive: { color: Accent[500] },
  lineText: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
    flex: 1,
  },
  lineTextActive: { color: '#FFFFFF', fontWeight: FontWeights.semiBold },
  inlineVal: {
    fontSize: 11,
    opacity: 0.55,
    fontFamily: FontFamilies.mono,
  },
  inlineValLow: {
    color: '#38BDF8',
  },
  inlineValHigh: {
    color: '#C084FC',
  },
  inlineValMid: {
    color: '#FB923C',
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  zoomButton: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    backgroundColor: DarkSurfaces.surface,
  },
  zoomButtonText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.bold,
    fontSize: 10,
    color: DarkText.secondary,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

export const PseudocodePanel: React.FC<PseudocodePanelProps> = ({
  lines,
  currentStep,
  showInlineValues = false,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [baseFontSize, setBaseFontSize] = useState(13); // Default 13px

  const handleZoomIn = () => {
    setBaseFontSize((prev) => Math.min(20, prev + 1));
  };
  const handleZoomOut = () => {
    setBaseFontSize((prev) => Math.max(10, prev - 1));
  };

  const lineFontSize = baseFontSize;
  const inlineValFontSize = Math.max(8, baseFontSize - 2);

  const renderLineText = (text: string) => {
    if (!showInlineValues) {
      return text;
    }

    const variables: Record<string, number> = {};

    // 1. Extract values from stepMarkers
    const stepMarkers = currentStep?.marcadores ?? (currentStep as any)?.markers;
    if (currentStep && stepMarkers) {
      for (const m of stepMarkers) {
        const label = m.label;
        const index = m.index;

        if (label === 'low') {
          variables['low'] = index;
        } else if (label === 'high') {
          variables['high'] = index;
        } else if (label === 'mid') {
          variables['mid'] = index;
        } else if (label === 'L/H') {
          variables['low'] = index;
          variables['high'] = index;
        } else if (label === 'L/M/H') {
          variables['low'] = index;
          variables['high'] = index;
          variables['mid'] = index;
        } else if (label === 'L/M') {
          variables['low'] = index;
          variables['mid'] = index;
        } else if (label === 'M/H') {
          variables['mid'] = index;
          variables['high'] = index;
        } else if (label) {
          variables[label.toLowerCase()] = index;
        }
      }
    }

    // 2. Extract array length as 'n'
    const arrLength =
      (currentStep as any)?.valores?.length ??
      (currentStep as any)?.estadoArray?.length ??
      null;
    if (arrLength !== null) {
      variables['n'] = arrLength;
    }

    const varNames = Object.keys(variables);
    if (varNames.length === 0) {
      return text;
    }

    const getVariableColor = (name: string) => {
      switch (name) {
        case 'low':
          return '#00D4FF'; // Cyan
        case 'high':
          return '#A855F7'; // Purple
        case 'mid':
          return '#FB923C'; // Orange
        case 'i':
          return '#F43F5E'; // Rose
        case 'j':
          return '#10B981'; // Emerald
        case 'n':
          return '#3B82F6'; // Blue
        default:
          return '#94A3B8'; // Slate/Muted
      }
    };

    // Sort variable names by length descending to prevent substring mismatch (e.g. 'mid' before 'm')
    const sortedVarNames = [...varNames].sort((a, b) => b.length - a.length);

    // Escape variable names for RegExp
    const escapedNames = sortedVarNames.map((name) =>
      name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    );

    const regex = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'g');
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      const cleanPart = part.toLowerCase();
      if (variables[cleanPart] !== undefined) {
        const val = variables[cleanPart];
        return (
          <Text key={idx}>
            {part}
            <Text style={[styles.inlineVal, { color: getVariableColor(cleanPart), fontSize: inlineValFontSize }]}>
              :{val}
            </Text>
          </Text>
        );
      }
      return part;
    });
  };
  const activeLine =
    (currentStep as any)?.pseudocodeLine ??
    (currentStep as any)?.lineaPseudocodigo ??
    -1;
  const activeIndex = lines.findIndex((lineObj) => lineObj.line === activeLine);

  // Auto-scroll a la línea activa
  useEffect(() => {
    if (activeIndex >= 0 && scrollRef.current) {
      const centeredOffset = activeIndex * LINE_HEIGHT - VISIBLE_CODE_HEIGHT / 2 + LINE_HEIGHT / 2;
      scrollRef.current.scrollTo({
        y: Math.max(0, centeredOffset),
        animated: true,
      });
    }
  }, [activeIndex, lines.length]);

  if (!lines || lines.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
          <Text>📋</Text>
          <Text style={styles.headerText}>Pseudocódigo</Text>
        </View>
        <View style={styles.zoomRow}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomOut}
            accessibilityRole="button"
            accessibilityLabel="Disminuir tamaño de letra"
            testID="btn-zoom-out"
          >
            <Text style={styles.zoomButtonText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={handleZoomIn}
            accessibilityRole="button"
            accessibilityLabel="Aumentar tamaño de letra"
            testID="btn-zoom-in"
          >
            <Text style={styles.zoomButtonText}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {lines.map((lineObj) => {
          const isActive = lineObj.line === activeLine;
          return (
            <View
              key={lineObj.line}
              style={[styles.line, isActive && styles.lineActive]}
              accessibilityLabel={`Línea ${lineObj.line}: ${lineObj.text}`}
            >
              <Text
                style={[
                  styles.lineNumber,
                  isActive && styles.lineNumberActive,
                  { fontSize: lineFontSize - 2 },
                ]}
              >
                {lineObj.line}
              </Text>
              <Text
                style={[
                  styles.lineText,
                  isActive && styles.lineTextActive,
                  { paddingLeft: lineObj.indent * INDENT_UNIT, fontSize: lineFontSize },
                ]}
                numberOfLines={1}
              >
                {renderLineText(lineObj.text)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
