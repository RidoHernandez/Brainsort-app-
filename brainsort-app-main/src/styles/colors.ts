/**
 * colors.ts
 * BrainSort — Paleta de colores oficial
 *
 * Fuente de verdad: constitution.md §3 "Color Coding (Simulación)"
 * task_breakdown.md T-FE-023
 *
 * Convención: nombres en inglés (structure), terminología de dominio en español (comments).
 */

// ─── Colores de Simulación (Constitution §3) ─────────────────────────────────
/**
 * Simulation state colors.
 * These are the canonical values that must be used across ALL simulation components
 * (ColorMapper.ts, BarRenderer.tsx, AccessibilityIcons.tsx, SimulationCanvas.tsx, etc.)
 */
export const SimulationColors = {
  /** Elemento inactivo / base — Azul */
  idle: '#4A90D9',
  /** Comparando — Amarillo */
  comparacion: '#F5A623',
  /** Intercambiando — Rojo */
  intercambio: '#D0021B',
  /** Posición final correcta — Verde */
  final: '#7ED321',
} as const;

export type SimulationColorKey = keyof typeof SimulationColors;

// ─── Paleta Base ──────────────────────────────────────────────────────────────

/**
 * Brand primary — deep blue family.
 */
export const Primary = {
  50: '#EBF4FF',
  100: '#C3DEFE',
  200: '#9AC8FD',
  300: '#72B2FB',
  400: '#4A9CF9',
  500: '#2275C8', // Primary brand
  600: '#1A5BA0',
  700: '#134178',
  800: '#0C2850',
  900: '#060E28',
} as const;

/**
 * Accent — vivid cyan / teal for interactive elements.
 */
export const Accent = {
  100: '#CCFAFF',
  300: '#66EEFF',
  500: '#00D4FF', // Default accent
  700: '#007A99',
  900: '#002233',
} as const;

/**
 * Neutral grays — used for backgrounds, borders, and text.
 */
export const Neutral = {
  0: '#FFFFFF',
  50: '#F7F8FA',
  100: '#EEF0F3',
  200: '#DDE0E6',
  300: '#C2C7D0',
  400: '#9BA3B0',
  500: '#747D8C',
  600: '#4E5764',
  700: '#343B45',
  800: '#1F252E',
  850: '#171C23',
  900: '#0F1318',
  950: '#080B0F',
} as const;

/**
 * Semantic colors — feedback / status.
 */
export const Semantic = {
  success: '#7ED321',     // Same as SimulationColors.final — intentional
  successLight: '#D4F4AB',
  warning: '#F5A623',     // Same as SimulationColors.comparacion — intentional
  warningLight: '#FDE8BB',
  error: '#D0021B',       // Same as SimulationColors.intercambio — intentional
  errorLight: '#FAC4CB',
  info: '#4A90D9',        // Same as SimulationColors.idle — intentional
  infoLight: '#C3DEFE',
} as const;

// ─── Surface & Background ─────────────────────────────────────────────────────

/** Dark mode surfaces */
export const DarkSurfaces = {
  background: Neutral[950],    // Page background
  surface: Neutral[900],       // Card / panel base
  surfaceElevated: Neutral[850], // Modals, dropdowns
  surfaceHighlight: Neutral[800], // Active states, hover
  border: Neutral[700],
  borderSubtle: Neutral[800],
} as const;

/** Light mode surfaces */
export const LightSurfaces = {
  background: Neutral[50],
  surface: Neutral[0],
  surfaceElevated: Neutral[100],
  surfaceHighlight: Neutral[200],
  border: Neutral[200],
  borderSubtle: Neutral[100],
} as const;

// ─── Text ─────────────────────────────────────────────────────────────────────

/** Dark mode text */
export const DarkText = {
  primary: Neutral[0],
  secondary: Neutral[300],
  muted: Neutral[500],
  disabled: Neutral[600],
  inverse: Neutral[950],
  onAccent: Neutral[950],
} as const;

/** Light mode text */
export const LightText = {
  primary: Neutral[900],
  secondary: Neutral[600],
  muted: Neutral[400],
  disabled: Neutral[300],
  inverse: Neutral[0],
  onAccent: Neutral[0],
} as const;

// ─── Gradients ────────────────────────────────────────────────────────────────

export const Gradients = {
  brandHero: ['#0F1318', '#1A3A6B', '#0F1318'] as const,
  accent: ['#00D4FF', '#4A90D9'] as const,
  simulationBar: ['#4A90D9', '#2275C8'] as const,
  successGlow: ['#7ED321', '#4CAF50'] as const,
  darkCard: ['#1F252E', '#171C23'] as const,
} as const;

// ─── Re-export convenience object ────────────────────────────────────────────

export const Colors = {
  simulation: SimulationColors,
  primary: Primary,
  accent: Accent,
  neutral: Neutral,
  semantic: Semantic,
  gradients: Gradients,
} as const;
