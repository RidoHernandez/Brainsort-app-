/**
 * typography.ts
 * BrainSort — Sistema de tipografías
 *
 * task_breakdown.md T-FE-024
 *
 * Fuente elegida: "Inter" (sans-serif moderna, altamente legible en pantallas).
 * Compatible con expo-font ~12.x y disponible vía Google Fonts.
 *
 * Estructura:
 *   - FontFamilies  → nombres de fuente a cargar con expo-font
 *   - FontSizes     → escala de tamaños en puntos (platform-agnostic)
 *   - FontWeights   → pesos tipográficos
 *   - LineHeights   → alturas de línea
 *   - LetterSpacings→ espaciado de letras
 *   - TextVariants  → estilos completos listos para usar en StyleSheet
 */

import { Platform } from 'react-native';

// ─── Font Families ─────────────────────────────────────────────────────────

/**
 * Font asset keys as loaded by expo-font.
 * Actual font files must be placed in src/assets/fonts/ and registered in App.tsx.
 */
export const FontFamilies = {
  /** Regular weight — body text */
  regular: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'Inter, "Segoe UI", Arial, sans-serif',
  }) as string,
  /** Medium weight — labels, subtítulos */
  medium: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'Inter, "Segoe UI", Arial, sans-serif',
  }) as string,
  /** Semi-bold — card titles, UI emphasis */
  semiBold: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'Inter, "Segoe UI", Arial, sans-serif',
  }) as string,
  /** Bold — section headings */
  bold: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'Inter, "Segoe UI", Arial, sans-serif',
  }) as string,
  /** Extra-bold — hero headings, brand marks */
  extraBold: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'Inter, "Segoe UI", Arial, sans-serif',
  }) as string,
  /**
   * Monospace — pseudocode panel, code snippets.
   * Falls back to system monospace if not loaded.
   */
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: '"Courier New", monospace',
  }) as string,
} as const;

// ─── Font Sizes (points / sp — React Native default unit) ────────────────────

/**
 * T-shirt size scale. All values are in React Native dp / CSS px-equivalent.
 */
export const FontSizes = {
  /** 10 — tiny labels, captions */
  xs: 10,
  /** 12 — secondary captions, badges */
  sm: 12,
  /** 14 — body text default */
  md: 14,
  /** 16 — large body / primary input */
  lg: 16,
  /** 18 — card titles */
  xl: 18,
  /** 22 — section headings */
  '2xl': 22,
  /** 28 — screen titles */
  '3xl': 28,
  /** 36 — hero text */
  '4xl': 36,
  /** 48 — display text */
  '5xl': 48,
} as const;

export type FontSizeKey = keyof typeof FontSizes;

// ─── Font Weights ─────────────────────────────────────────────────────────────

/**
 * Mapped to React Native's accepted weight strings.
 * NOTE: On Android, some fonts only support '400' and '700'. Inter supports all.
 */
export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
} as const;

// ─── Line Heights ─────────────────────────────────────────────────────────────

/**
 * Line heights — expressed as absolute pixel values for React Native compatibility.
 * Calculated as fontSize × multiplier (1.2–1.6 depending on context).
 */
export const LineHeights = {
  tight: (size: number) => Math.round(size * 1.2),
  normal: (size: number) => Math.round(size * 1.5),
  relaxed: (size: number) => Math.round(size * 1.6),
} as const;

// ─── Letter Spacings ──────────────────────────────────────────────────────────

export const LetterSpacings = {
  tighter: -0.4,
  tight: -0.2,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
} as const;

// ─── Text Variants — ready-to-use StyleSheet style objects ───────────────────

/**
 * Pre-composed text variants for consistent usage across all screens and components.
 * Each variant is a StyleSheet-compatible style object.
 *
 * Usage:
 *   import { TextVariants } from '../styles/typography';
 *   <Text style={TextVariants.bodyMd}>Hello</Text>
 */
export const TextVariants = {
  // ── Display ──────────────────────────────────────────────────────────────

  /** Hero headline — splash / welcome screens */
  display: {
    fontFamily: FontFamilies.extraBold,
    fontWeight: FontWeights.extraBold,
    fontSize: FontSizes['5xl'],
    lineHeight: LineHeights.tight(FontSizes['5xl']),
    letterSpacing: LetterSpacings.tighter,
  },

  /** Section hero title */
  h1: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes['4xl'],
    lineHeight: LineHeights.tight(FontSizes['4xl']),
    letterSpacing: LetterSpacings.tight,
  },

  /** Screen / modal title */
  h2: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes['3xl'],
    lineHeight: LineHeights.tight(FontSizes['3xl']),
    letterSpacing: LetterSpacings.tight,
  },

  /** Section heading */
  h3: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes['2xl'],
    lineHeight: LineHeights.tight(FontSizes['2xl']),
    letterSpacing: LetterSpacings.normal,
  },

  /** Card heading */
  h4: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xl,
    lineHeight: LineHeights.tight(FontSizes.xl),
    letterSpacing: LetterSpacings.normal,
  },

  // ── Body ─────────────────────────────────────────────────────────────────

  /** Primary body — most UI text */
  bodyLg: {
    fontFamily: FontFamilies.regular,
    fontWeight: FontWeights.regular,
    fontSize: FontSizes.lg,
    lineHeight: LineHeights.normal(FontSizes.lg),
    letterSpacing: LetterSpacings.normal,
  },

  /** Default body */
  bodyMd: {
    fontFamily: FontFamilies.regular,
    fontWeight: FontWeights.regular,
    fontSize: FontSizes.md,
    lineHeight: LineHeights.normal(FontSizes.md),
    letterSpacing: LetterSpacings.normal,
  },

  /** Small body — secondary descriptions */
  bodySm: {
    fontFamily: FontFamilies.regular,
    fontWeight: FontWeights.regular,
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.relaxed(FontSizes.sm),
    letterSpacing: LetterSpacings.normal,
  },

  // ── Labels & UI ──────────────────────────────────────────────────────────

  /** Button label — medium size */
  labelMd: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.md,
    lineHeight: LineHeights.tight(FontSizes.md),
    letterSpacing: LetterSpacings.wide,
  },

  /** Button label — small (tab labels, badges) */
  labelSm: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.tight(FontSizes.sm),
    letterSpacing: LetterSpacings.wide,
  },

  /** Overline — all-caps small label above sections */
  overline: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
    lineHeight: LineHeights.tight(FontSizes.xs),
    letterSpacing: LetterSpacings.widest,
  },

  /** Caption — image credits, helper text */
  caption: {
    fontFamily: FontFamilies.regular,
    fontWeight: FontWeights.regular,
    fontSize: FontSizes.xs,
    lineHeight: LineHeights.relaxed(FontSizes.xs),
    letterSpacing: LetterSpacings.normal,
  },

  // ── Monospace (Pseudocode Panel) ─────────────────────────────────────────

  /** Code block text — PseudocodePanel, CodeEditor */
  code: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.regular,
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.relaxed(FontSizes.sm),
    letterSpacing: LetterSpacings.normal,
  },

  /** Code block — slightly larger for readability in panels */
  codeMd: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.regular,
    fontSize: FontSizes.md,
    lineHeight: LineHeights.relaxed(FontSizes.md),
    letterSpacing: LetterSpacings.normal,
  },
} as const;

export type TextVariantKey = keyof typeof TextVariants;
