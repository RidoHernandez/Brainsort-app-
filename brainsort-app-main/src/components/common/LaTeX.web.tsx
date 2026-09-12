import React, { useEffect, useRef } from 'react';

interface LaTeXProps {
  math: string;
  block?: boolean;
  style?: any;
}

export function LaTeX({ math, block = false, style }: LaTeXProps) {
  const containerRef = useRef<any>(null);

  useEffect(() => {
    const renderMath = () => {
      if ((window as any).katex && containerRef.current) {
        try {
          (window as any).katex.render(math, containerRef.current, {
            displayMode: block,
            throwOnError: false,
          });
        } catch (e) {
          console.error('KaTeX rendering error:', e);
          if (containerRef.current) {
            containerRef.current.innerText = math;
          }
        }
      }
    };

    if ((window as any).katex) {
      renderMath();
    } else {
      const interval = setInterval(() => {
        if ((window as any).katex) {
          clearInterval(interval);
          renderMath();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [math, block]);

  // Convert standard React Native style properties to standard CSS properties if they are passed.
  // This prevents style warnings or crashes in standard React DOM.
  const resolvedStyle: React.CSSProperties = {
    display: block ? 'block' : 'inline-block',
    margin: block ? '12px 0' : '0 2px',
    color: '#00D4FF',
    maxWidth: '100%',
    overflowX: block ? 'auto' : 'visible',
  };

  if (style) {
    // Copy safe properties if present
    if (style.color) resolvedStyle.color = style.color;
    if (style.fontSize) resolvedStyle.fontSize = style.fontSize;
    if (style.fontWeight) resolvedStyle.fontWeight = style.fontWeight;
  }

  return (
    <span
      ref={containerRef}
      style={resolvedStyle}
    />
  );
}
