import {
  formatDuration,
  formatFileSize,
  formatNumber,
  formatPercent,
  formatPoints,
  formatRanking,
  formatRelativeTime,
  formatSpeed,
  formatStep,
  formatStreak,
  truncateDescription,
} from '../formatters';

describe('formatters', () => {
  it('formatea numeros, puntos y porcentajes con locale es-MX', () => {
    expect(formatNumber(12500)).toBe('12,500');
    expect(formatPoints(1540)).toBe('1,540 pts');
    expect(formatPercent(0.853)).toBe('85%');
    expect(formatPercent(0.853, 1)).toBe('85.3%');
  });

  it('formatea tamanos de archivo en KB y MB', () => {
    expect(formatFileSize(900)).toBe('900 KB');
    expect(formatFileSize(2048)).toBe('2.0 MB');
  });

  it('formatea velocidad, pasos, ranking y racha', () => {
    expect(formatSpeed(1)).toBe('1×');
    expect(formatSpeed(0.25)).toBe('0.25×');
    expect(formatStep(3, 24)).toBe('Paso 3 de 24');
    expect(formatRanking(12)).toBe('#12');
    expect(formatStreak(1)).toBe('1 día');
    expect(formatStreak(7)).toBe('7 días');
  });

  it('formatea duraciones cortas y largas', () => {
    expect(formatDuration(3500)).toBe('4 s');
    expect(formatDuration(10000)).toBe('10 s');
    expect(formatDuration(90000)).toBe('1 min 30 s');
  });

  it('calcula tiempo relativo usando Date.now fijo', () => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-05-17T12:00:00Z').getTime());

    expect(formatRelativeTime('2026-05-16T12:00:00Z')).toContain('ayer');
    expect(formatRelativeTime('2026-05-18T12:00:00Z')).toContain('mañana');

    jest.restoreAllMocks();
  });

  it('trunca descripciones largas sin exceder el limite', () => {
    const text = 'a'.repeat(150);
    const result = truncateDescription(text, 20);

    expect(result).toHaveLength(20);
    expect(result.endsWith('…')).toBe(true);
    expect(truncateDescription('corto', 20)).toBe('corto');
  });
});
