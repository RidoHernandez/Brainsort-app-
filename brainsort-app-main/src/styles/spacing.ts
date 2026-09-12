/**
 * spacing.ts
 * BrainSort — Sistema de espaciado
 *
 * task_breakdown.md T-FE-025
 *
 * Base: 4 dp (1 unidad = 4 dp). Compatible con React Native dp system.
 * Todos los valores son enteros para alineación de píxeles en dispositivos.
 *
 * Estructura:
 *   - Spacing (escala base)
 *   - BorderRadius
 *   - BorderWidths
 *   - IconSizes
 *   - LayoutSizes (breakpoints, header, tab bar, etc.)
 *   - Shadows
 *   - ZIndex
 */

// ─── Spacing Scale (1 unit = 4 dp) ───────────────────────────────────────────

/**
 * Core spacing scale. Use these values for margin, padding, gap, and position.
 *
 * Usage:
 *   paddingHorizontal: Spacing[4]  // 16 dp
 *   marginBottom: Spacing[2]       // 8 dp
 */
export const Spacing = {
  /** 0 dp */
  0: 0,
  /** 2 dp — hairline dividers */
  0.5: 2,
  /** 4 dp — minimum touchable inset */
  1: 4,
  /** 6 dp */
  1.5: 6,
  /** 8 dp — compact padding */
  2: 8,
  /** 10 dp */
  2.5: 10,
  /** 12 dp — small padding */
  3: 12,
  /** 14 dp */
  3.5: 14,
  /** 16 dp — default element padding */
  4: 16,
  /** 20 dp */
  5: 20,
  /** 24 dp — section gap */
  6: 24,
  /** 28 dp */
  7: 28,
  /** 32 dp — large section padding */
  8: 32,
  /** 36 dp */
  9: 36,
  /** 40 dp — block spacing */
  10: 40,
  /** 48 dp */
  12: 48,
  /** 56 dp */
  14: 56,
  /** 64 dp — hero section padding */
  16: 64,
  /** 80 dp */
  20: 80,
  /** 96 dp */
  24: 96,
  /** 128 dp */
  32: 128,
} as const;

export type SpacingKey = keyof typeof Spacing;

// ─── Semantic Spacing Aliases ─────────────────────────────────────────────────

/**
 * Meaningful aliases on top of the numeric scale.
 * Prefer these over raw scale values for readability.
 */
export const SpacingAlias = {
  /** Screen horizontal edge padding */
  screenPaddingX: Spacing[4],       // 16
  /** Screen vertical edge padding */
  screenPaddingY: Spacing[6],       // 24
  /** Padding inside cards */
  cardPadding: Spacing[4],          // 16
  /** Space between card grid items (both axis) */
  cardGap: Spacing[3],              // 12
  /** Standard button vertical padding */
  buttonPaddingY: Spacing[3],       // 12
  /** Standard button horizontal padding */
  buttonPaddingX: Spacing[6],       // 24
  /** Compact button padding (icon buttons, tags) */
  buttonPaddingCompact: Spacing[2], // 8
  /** Section title margin-bottom */
  sectionTitleGap: Spacing[3],      // 12
  /** List item divider height / gap */
  listItemGap: Spacing[2],          // 8
  /** Input vertical padding */
  inputPaddingY: Spacing[3],        // 12
  /** Input horizontal padding */
  inputPaddingX: Spacing[4],        // 16
  /** Inline icon-to-text gap */
  iconGap: Spacing[2],              // 8
  /** Pseudocode line vertical padding */
  pseudocodePaddingY: Spacing[1],   // 4
  /** Pseudocode line horizontal padding (per indent level) */
  pseudocodeIndentUnit: Spacing[4], // 16
  /** Toast vertical margin from edge */
  toastMargin: Spacing[4],          // 16
  /** Modal internal padding */
  modalPadding: Spacing[6],         // 24
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const BorderRadius = {
  /** 2 dp — hairline */
  none: 0,
  /** 2 dp — very subtle */
  xs: 2,
  /** 4 dp — tags, small chips */
  sm: 4,
  /** 8 dp — buttons, inputs */
  md: 8,
  /** 12 dp — cards */
  lg: 12,
  /** 16 dp — modals, large panels */
  xl: 16,
  /** 24 dp — floating sheets, bottom drawers */
  '2xl': 24,
  /** 9999 dp — pill / fully rounded (badges, avatars) */
  full: 9999,
} as const;

// ─── Border Widths ────────────────────────────────────────────────────────────

export const BorderWidths = {
  hairline: 0.5,
  thin: 1,
  medium: 2,
  thick: 4,
} as const;

// ─── Icon Sizes ───────────────────────────────────────────────────────────────

export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

// ─── Layout Sizes ─────────────────────────────────────────────────────────────

/**
 * Breakpoints for responsive layout (useResponsiveColumns hook — T-FE-054).
 * Maps to: 4 cols (≥1024), 3 cols (≥768), 2 cols (≥480), 1 col (<480)
 */
export const Breakpoints = {
  phone: 480,
  phablet: 768,
  desktop: 1024,
} as const;

export const LayoutSizes = {
  /** Bottom tab bar height including safe area bottom */
  tabBarHeight: 60,
  /** Header / navigation bar height */
  headerHeight: 56,
  /** Minimum touchable area (WCAG 2.5.5) */
  minTouchTarget: 44,
  /** Control bar height (simulation play/pause/slider bar) */
  controlBarHeight: 64,
  /** Pseudocode panel default height */
  pseudocodePanelHeight: 200,
  /** Speed slider track width */
  sliderWidth: 200,
  /** Avatar / profile image — small */
  avatarSm: 32,
  /** Avatar / profile image — large */
  avatarLg: 56,
  /** Badge icon size */
  badgeIcon: 48,
  /** Modal max width — keeps modals readable on wide screens */
  modalMaxWidth: 480,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

/**
 * Shadow definitions — React Native style (shadowColor, shadowOffset, etc.)
 * These are dark-mode friendly and will be composed into the theme.
 */
export const Shadows = {
  /** Subtle lift — card, input */
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2, // Android
  },
  /** Medium lift — floating action, toast */
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 6,
  },
  /** Large lift — modals, bottom sheets */
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 12,
  },
  /** Colored glow — accent / simulation highlights */
  accent: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────

export const ZIndex = {
  base: 0,
  card: 10,
  overlay: 20,
  modal: 30,
  toast: 40,
  tooltip: 50,
} as const;
