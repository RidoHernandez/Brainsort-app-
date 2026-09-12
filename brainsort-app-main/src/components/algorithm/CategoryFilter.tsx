/**
 * CategoryFilter.tsx
 * BrainSort — Filtro de categorías para la biblioteca de algoritmos
 *
 * task_breakdown.md T-FE-062
 *
 * Barra horizontal de chips filtrables:
 *   "Todos" | "Ordenamiento" | "Búsqueda" | "Estructuras Lineales"
 *
 * - Resalta el filtro activo con color de acento
 * - Emite `onSelect(categoria | undefined)` al padre
 * - Scroleable horizontalmente en móvil (showsHorizontalScrollIndicator=false)
 *
 * Referencia: library-simulation.spec.md §2 HU-01
 *             task_breakdown.md T-FE-062
 */

import React, { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DarkSurfaces, DarkText, Neutral, Primary, Accent } from '../../styles/colors';
import { BorderRadius, BorderWidths, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Categorías según el backend spec */
export type Categoria =
  | 'Ordenamiento'
  | 'Busqueda'
  | 'EstructurasLineales';

export interface CategoryFilterProps {
  /** Categorías disponibles provenientes de la API */
  categorias: string[];
  /** Categoría actualmente seleccionada (undefined = Todos) */
  selected: string | undefined;
  /** Callback de selección. undefined significa "Todos" */
  onSelect: (categoria: string | undefined) => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Mapa de labels amigables para el usuario */
const CATEGORY_LABELS: Record<string, string> = {
  Ordenamiento: 'Ordenamiento',
  Busqueda: 'Búsqueda',
  EstructurasLineales: 'Estructuras Lineales',
};

const CATEGORY_ICONS: Record<string, string> = {
  Ordenamiento: '⇅',
  Busqueda: '⌕',
  EstructurasLineales: '≡',
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing[3],
  },
  scrollContent: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    backgroundColor: DarkSurfaces.surface,
  },
  chipActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderColor: Accent[500],
  },
  chipIcon: {
    fontSize: FontSizes.md,
    color: DarkText.muted,
  },
  chipIconActive: {
    color: Accent[500],
  },
  chipLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
  },
  chipLabelActive: {
    color: Accent[500],
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
  },

  // Indicador de selección debajo del chip activo (barra de subrayado)
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: Accent[500],
    borderRadius: BorderRadius.full,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Filtro horizontal de categorías. Poner "todos" primero siempre.
 *
 * @example
 * <CategoryFilter
 *   categorias={['Ordenamiento', 'Busqueda']}
 *   selected={activeCategory}
 *   onSelect={setActiveCategory}
 * />
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categorias,
  selected,
  onSelect,
}) => {
  const handleAll = useCallback(() => onSelect(undefined), [onSelect]);

  const handleSelect = useCallback(
    (cat: string) => {
      // Toggle: si ya estaba seleccionada, vuelve a "Todos"
      onSelect(selected === cat ? undefined : cat);
    },
    [selected, onSelect],
  );

  const isAllActive = selected === undefined;

  return (
    <View style={styles.container} accessibilityRole="tablist">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Filtros de categoría"
      >
        {/* Chip "Todos" */}
        <TouchableOpacity
          style={[styles.chip, isAllActive && styles.chipActive]}
          onPress={handleAll}
          activeOpacity={0.75}
          accessibilityRole="tab"
          accessibilityState={{ selected: isAllActive }}
          accessibilityLabel="Todos los algoritmos"
          testID="category-filter-all"
        >
          <Text
            style={[
              styles.chipIcon,
              isAllActive && styles.chipIconActive,
            ]}
          >
            ❖
          </Text>
          <Text
            style={[
              styles.chipLabel,
              isAllActive && styles.chipLabelActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        {/* Chips de categoría */}
        {categorias.map((cat) => {
          const isActive = selected === cat;
          const label = CATEGORY_LABELS[cat] ?? cat;
          const icon = CATEGORY_ICONS[cat] ?? '◈';

          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => handleSelect(cat)}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filtrar por ${label}`}
              testID={`category-filter-${cat}`}
            >
              <Text
                style={[
                  styles.chipIcon,
                  isActive && styles.chipIconActive,
                ]}
              >
                {icon}
              </Text>
              <Text
                style={[
                  styles.chipLabel,
                  isActive && styles.chipLabelActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
