/**
 * formatters.ts
 * BrainSort — Formateo de números y fechas
 *
 * task_breakdown.md T-FE-028
 *
 * Funciones puras de formateo. Sin dependencias externas — solo la API
 * nativa de Intl disponible en V8 / Hermes (React Native ≥0.70).
 *
 * Uso:
 *   import { formatPoints, formatDate, formatDuration } from '../utils/formatters';
 *   formatPoints(1540)        // → "1,540 pts"
 *   formatDate(new Date())    // → "18 abr 2026"
 */

// ─── Locale por defecto ───────────────────────────────────────────────────────

/**
 * Locale fijo del proyecto: español-México.
 * Si en el futuro se necesita internacionalización, este es el único lugar a cambiar.
 */
const DEFAULT_LOCALE = 'es-MX';

// ─── Números y Puntos ─────────────────────────────────────────────────────────

/**
 * Formatea una cantidad de puntos de gamificación.
 * @example formatPoints(1540) → "1,540 pts"
 * @example formatPoints(0)    → "0 pts"
 */
export function formatPoints(points: number): string {
  const formatted = new Intl.NumberFormat(DEFAULT_LOCALE).format(points);
  return `${formatted} pts`;
}

/**
 * Formatea un número entero con separadores de miles.
 * @example formatNumber(12500) → "12,500"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE).format(value);
}

/**
 * Formatea un porcentaje (valor entre 0 y 1).
 * @example formatPercent(0.853) → "85%"
 * @example formatPercent(1)     → "100%"
 */
export function formatPercent(ratio: number, decimals = 0): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(ratio);
}

/**
 * Formatea tamaño en KB a una cadena legible.
 * @example formatFileSize(1024) → "1,024 KB"
 * @example formatFileSize(2048) → "2.0 MB"  (si ≥ 1024 KB)
 */
export function formatFileSize(kb: number): string {
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(1)} MB`;
  }
  return `${new Intl.NumberFormat(DEFAULT_LOCALE).format(Math.round(kb))} KB`;
}

// ─── Fechas ───────────────────────────────────────────────────────────────────

/**
 * Formatea una fecha con formato corto legible en español.
 * @example formatDate(new Date('2026-04-18')) → "18 abr 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Formatea una fecha con hora incluida.
 * @example formatDateTime(new Date()) → "18 abr 2026, 18:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Expresa una fecha de forma relativa al momento actual.
 * Usa Intl.RelativeTimeFormat si está disponible (Hermes ≥ 0.74 soportado).
 * @example formatRelativeTime(yesterday) → "hace 1 día"
 * @example formatRelativeTime(lastWeek)  → "hace 7 días"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diffMs = d.getTime() - now;
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: 'auto' });

  if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, 'second');
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  return rtf.format(diffDays, 'day');
}

// ─── Simulación / Algoritmos ──────────────────────────────────────────────────

/**
 * Formatea la velocidad de reproducción de la simulación.
 * @example formatSpeed(1)    → "1×"
 * @example formatSpeed(0.25) → "0.25×"
 * @example formatSpeed(2)    → "2×"
 */
export function formatSpeed(speed: number): string {
  // Elimina decimales innecesarios: 1.00 → "1", 0.25 → "0.25"
  const clean = parseFloat(speed.toFixed(2)).toString();
  return `${clean}×`;
}

/**
 * Formatea "paso actual / total de pasos".
 * @example formatStep(3, 24) → "Paso 3 de 24"
 */
export function formatStep(current: number, total: number): string {
  return `Paso ${formatNumber(current)} de ${formatNumber(total)}`;
}

/**
 * Formatea una duración en milisegundos a segundos legibles.
 * @example formatDuration(3500)   → "3.5 s"
 * @example formatDuration(10000)  → "10 s"
 * @example formatDuration(90000)  → "1 min 30 s"
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds} s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds > 0 ? `${minutes} min ${seconds} s` : `${minutes} min`;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────

/**
 * Formatea la posición del ranking con ordinal.
 * @example formatRanking(1)  → "#1"
 * @example formatRanking(12) → "#12"
 */
export function formatRanking(position: number): string {
  return `#${formatNumber(position)}`;
}

/**
 * Formatea la racha de días.
 * @example formatStreak(1)  → "1 día"
 * @example formatStreak(7)  → "7 días"
 */
export function formatStreak(days: number): string {
  return days === 1 ? '1 día' : `${formatNumber(days)} días`;
}

// ─── Truncado de texto ────────────────────────────────────────────────────────

/**
 * Trunca una descripción a un máximo de caracteres.
 * Referencia: task_breakdown T-FE-061 (AlgorithmCard — descripción ≤140 chars)
 *
 * @param text   Texto a truncar
 * @param maxLen Límite de caracteres (default 140)
 * @example truncateDescription('Algoritmo de...', 140)
 */
export function truncateDescription(text: string, maxLen = 140): string {
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1).trimEnd()}…`;
}
