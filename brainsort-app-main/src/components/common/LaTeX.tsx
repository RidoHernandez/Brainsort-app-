import React from 'react';
import { StyleSheet, Platform, Text } from 'react-native';

interface LaTeXProps {
  math: string;
  block?: boolean;
  style?: any;
}

export function LaTeX({ math, block = false, style }: LaTeXProps) {
  const renderedText = renderFallbackLaTeX(math);
  return (
    <Text style={[styles.fallbackMath, block && styles.blockFallbackMath, style]}>
      {renderedText}
    </Text>
  );
}

function renderFallbackLaTeX(math: string): string {
  return math
    .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '∑ ($1 a $2)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\theta/gi, 'θ')
    .replace(/\\omega/gi, 'ω')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\ne/g, '≠')
    .replace(/O\(n\^2\)/g, 'O(n²)')
    .replace(/O\(n\\log n\)/g, 'O(n log n)')
    .replace(/n\^2/g, 'n²')
    .replace(/i\+1/g, 'i+1')
    .replace(/\\cdot/g, '·')
    .replace(/\\log/g, 'log')
    .replace(/\\infty/g, '∞');
}

const styles = StyleSheet.create({
  fallbackMath: {
    fontStyle: 'italic',
    color: '#00D4FF',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  blockFallbackMath: {
    textAlign: 'center',
    marginVertical: 8,
    fontSize: 15,
  },
});
