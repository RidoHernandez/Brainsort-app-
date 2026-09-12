/**
 * LinearStructureCanvas.tsx
 * BrainSort — Canvas de animación para Estructuras Lineales
 *
 * Renderiza visualmente:
 *   - Stack: bloques apilados verticalmente, top resaltado
 *   - Queue: nodos en fila horizontal con punteros head/tail
 *   - Deque: nodos en fila con operaciones por ambos extremos
 *   - Linked List: cajas de nodos conectadas con flechas animadas
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, Text, StyleSheet, ScrollView } from 'react-native';
import { Accent, DarkSurfaces, DarkText, Semantic, SimulationColors } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SimulationStep {
  tipoOperacion: 'comparacion' | 'intercambio' | 'insercion' | 'final' | 'idle';
  indicesActivos: number[];
  estadoArray: number[];
  lineaPseudocodigo?: number;
}

interface Props {
  step: SimulationStep | null;
  isCompleted: boolean;
  algorithmName: string; // 'Stack' | 'Queue' | 'Deque' | 'Linked List'
  height?: number;
}

// ─── Colores ──────────────────────────────────────────────────────────────────

const getNodeColor = (
  idx: number,
  indicesActivos: number[],
  tipoOperacion: string,
  isCompleted: boolean,
) => {
  if (isCompleted) return SimulationColors.final;
  if (!indicesActivos.includes(idx)) return DarkSurfaces.surface;
  if (tipoOperacion === 'insercion') return Accent[500];
  if (tipoOperacion === 'intercambio') return Semantic.error;
  if (tipoOperacion === 'comparacion') return SimulationColors.comparacion;
  return DarkSurfaces.surfaceHighlight;
};

const getNodeBorderColor = (
  idx: number,
  indicesActivos: number[],
  tipoOperacion: string,
  isCompleted: boolean,
) => {
  if (isCompleted) return SimulationColors.final;
  if (indicesActivos.includes(idx)) {
    if (tipoOperacion === 'insercion') return Accent[500];
    if (tipoOperacion === 'intercambio') return Semantic.error;
    return SimulationColors.comparacion;
  }
  return DarkSurfaces.border;
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StackCanvas({ step, isCompleted }: { step: SimulationStep | null; isCompleted: boolean }) {
  const items = step?.estadoArray ?? [];
  const active = step?.indicesActivos ?? [];
  const op = step?.tipoOperacion ?? 'idle';
  const topIdx = items.length - 1;

  if (items.length === 0) {
    return (
      <View style={styles.emptyMessage}>
        <Text style={styles.emptyText}>Stack vacío</Text>
      </View>
    );
  }

  return (
    <View style={styles.stackContainer}>
      {/* Label HEAD */}
      <View style={styles.pointerRow}>
        <Text style={styles.pointerLabel}>← TOP</Text>
      </View>

      {/* Renderizar items de arriba a abajo (top primero) */}
      {[...items].reverse().map((val, reversedIdx) => {
        const idx = items.length - 1 - reversedIdx;
        const isTop = idx === topIdx;
        const bgColor = getNodeColor(idx, active, op, isCompleted);
        const borderColor = getNodeBorderColor(idx, active, op, isCompleted);

        return (
          <View
            key={`stack-${idx}-${val}`}
            style={[
              styles.stackNode,
              { backgroundColor: bgColor, borderColor },
              isTop && styles.stackNodeTop,
            ]}
          >
            <Text style={styles.nodeValue}>{val}</Text>
            {isTop && <Text style={styles.topLabel}>TOP</Text>}
          </View>
        );
      })}

      {/* Base de la pila */}
      <View style={styles.stackBase} />
    </View>
  );
}

function QueueCanvas({ step, isCompleted }: { step: SimulationStep | null; isCompleted: boolean }) {
  const items = step?.estadoArray ?? [];
  const active = step?.indicesActivos ?? [];
  const op = step?.tipoOperacion ?? 'idle';

  if (items.length === 0) {
    return (
      <View style={styles.emptyMessage}>
        <Text style={styles.emptyText}>Queue vacía</Text>
      </View>
    );
  }

  return (
    <View style={styles.queueWrapper}>
      {/* Puntero HEAD */}
      <View style={styles.queuePointers}>
        <Text style={styles.pointerLabel}>HEAD ↓</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.pointerLabel}>↓ TAIL</Text>
      </View>

      {/* Nodos de la cola */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.queueContainer}>
        {items.map((val, idx) => {
          const bgColor = getNodeColor(idx, active, op, isCompleted);
          const borderColor = getNodeBorderColor(idx, active, op, isCompleted);
          const isHead = idx === 0;
          const isTail = idx === items.length - 1;

          return (
            <View key={`queue-${idx}-${val}`} style={styles.queueNodeWrapper}>
              <View style={[styles.queueNode, { backgroundColor: bgColor, borderColor }]}>
                <Text style={styles.nodeValue}>{val}</Text>
                {isHead && <Text style={styles.topLabel}>H</Text>}
                {isTail && <Text style={[styles.topLabel, { color: Accent[300] }]}>T</Text>}
              </View>
              {/* Flecha → entre nodos */}
              {idx < items.length - 1 && (
                <Text style={styles.arrow}>→</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Dirección etiquetas */}
      <View style={styles.queueDirectionLabels}>
        <Text style={styles.directionLabel}>↑ dequeue()</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.directionLabel}>enqueue() ↑</Text>
      </View>
    </View>
  );
}

function DequeCanvas({ step, isCompleted }: { step: SimulationStep | null; isCompleted: boolean }) {
  const items = step?.estadoArray ?? [];
  const active = step?.indicesActivos ?? [];
  const op = step?.tipoOperacion ?? 'idle';

  if (items.length === 0) {
    return (
      <View style={styles.emptyMessage}>
        <Text style={styles.emptyText}>Deque vacío</Text>
      </View>
    );
  }

  return (
    <View style={styles.queueWrapper}>
      <View style={styles.queuePointers}>
        <Text style={styles.pointerLabel}>FRONT ↓</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.pointerLabel}>↓ BACK</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.queueContainer}>
        {items.map((val, idx) => {
          const bgColor = getNodeColor(idx, active, op, isCompleted);
          const borderColor = getNodeBorderColor(idx, active, op, isCompleted);
          return (
            <View key={`deque-${idx}-${val}`} style={styles.queueNodeWrapper}>
              <View style={[styles.queueNode, { backgroundColor: bgColor, borderColor }]}>
                <Text style={styles.nodeValue}>{val}</Text>
                {idx === 0 && <Text style={styles.topLabel}>F</Text>}
                {idx === items.length - 1 && <Text style={[styles.topLabel, { color: Accent[300] }]}>B</Text>}
              </View>
              {idx < items.length - 1 && <Text style={styles.arrow}>↔</Text>}
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.queueDirectionLabels}>
        <Text style={styles.directionLabel}>push/pop front</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.directionLabel}>push/pop back</Text>
      </View>
    </View>
  );
}

// ─── Linked List: animation helpers ─────────────────────────────────────────

interface NodeAnimValues {
  scale: Animated.Value;
  opacity: Animated.Value;
  glowOpacity: Animated.Value;
  arrowOpacity: Animated.Value;
  arrowX: Animated.Value;
  pointerPulse: Animated.Value;
}

function useNodeAnimValues(count: number): React.MutableRefObject<NodeAnimValues[]> {
  const animsRef = useRef<NodeAnimValues[]>([]);

  // Grow the array when count increases (new nodes added)
  while (animsRef.current.length < count) {
    animsRef.current.push({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
      glowOpacity: new Animated.Value(0),
      arrowOpacity: new Animated.Value(0),
      arrowX: new Animated.Value(-12),
      pointerPulse: new Animated.Value(1),
    });
  }

  // Trim when count shrinks
  if (animsRef.current.length > count) {
    animsRef.current = animsRef.current.slice(0, count);
  }

  return animsRef;
}

function LinkedListCanvas({ step, isCompleted }: { step: SimulationStep | null; isCompleted: boolean }) {
  const items = step?.estadoArray ?? [];
  const active = step?.indicesActivos ?? [];
  const op = step?.tipoOperacion ?? 'idle';

  const animsRef = useNodeAnimValues(items.length);
  const headSlide = useRef(new Animated.Value(-8)).current;
  const headOpacity = useRef(new Animated.Value(0)).current;
  const nullFade = useRef(new Animated.Value(0)).current;
  const glowLoopsRef = useRef<Animated.CompositeAnimation[]>([]);
  const prevCountRef = useRef(0);

  // ── Entry animations for newly added nodes (prepend = index 0 is always newest)
  useEffect(() => {
    const anims = animsRef.current;
    if (items.length === 0) return;

    const newCount = items.length;
    const oldCount = prevCountRef.current;
    prevCountRef.current = newCount;

    // Animate each node that is new (all nodes shift on prepend)
    anims.forEach((a, i) => {
      const isNew = newCount > oldCount && i === 0;
      if (isNew || (a.scale as any)._value === 0) {
        // pop-in spring for new head
        Animated.parallel([
          Animated.spring(a.scale, {
            toValue: 1,
            tension: 180,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(a.opacity, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(a.arrowOpacity, {
            toValue: 1,
            duration: 300,
            delay: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(a.arrowX, {
            toValue: 0,
            tension: 140,
            friction: 10,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    // HEAD indicator slide
    headSlide.setValue(-8);
    headOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(headSlide, { toValue: 0, tension: 200, friction: 10, useNativeDriver: true }),
      Animated.timing(headOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    // NULL fade-in
    Animated.timing(nullFade, {
      toValue: 1,
      duration: 400,
      delay: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // ── Glow pulse for active nodes
  useEffect(() => {
    // Stop previous loops
    glowLoopsRef.current.forEach((l) => l.stop());
    glowLoopsRef.current = [];

    const anims = animsRef.current;
    active.forEach((idx) => {
      if (!anims[idx]) return;
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anims[idx].glowOpacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anims[idx].glowOpacity, {
            toValue: 0.25,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      glowLoopsRef.current.push(loop);
    });

    // Reset glow on inactive nodes
    anims.forEach((a, i) => {
      if (!active.includes(i)) {
        Animated.timing(a.glowOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });

    // Pointer pulse on active nodes (→ cell)
    const pointerPulseAnims: Animated.CompositeAnimation[] = [];
    anims.forEach((a, i) => {
      if (active.includes(i) && (op === 'comparacion' || op === 'insercion')) {
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(a.pointerPulse, { toValue: 0.3, duration: 350, useNativeDriver: true }),
            Animated.timing(a.pointerPulse, { toValue: 1, duration: 350, useNativeDriver: true }),
          ]),
        );
        pulse.start();
        pointerPulseAnims.push(pulse);
        glowLoopsRef.current.push(pulse);
      } else {
        a.pointerPulse.setValue(1);
      }
    });

    return () => {
      glowLoopsRef.current.forEach((l) => l.stop());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active.join(','), op]);

  if (items.length === 0) {
    return (
      <View style={styles.emptyMessage}>
        <Text style={styles.emptyText}>Lista vacía</Text>
      </View>
    );
  }

  return (
    <View style={styles.linkedListWrapper}>
      {/* Animated HEAD indicator */}
      <Animated.View
        style={[
          styles.llHeadPointer,
          { opacity: headOpacity, transform: [{ translateY: headSlide }] },
        ]}
      >
        <Text style={styles.llHeadLabel}>HEAD</Text>
        <Text style={styles.llHeadArrow}>↓</Text>
      </Animated.View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linkedListContainer}>
        {items.map((val, idx) => {
          const bgColor = getNodeColor(idx, active, op, isCompleted);
          const borderColor = getNodeBorderColor(idx, active, op, isCompleted);
          const anim = animsRef.current[idx];
          const isActive = active.includes(idx);

          if (!anim) return null;

          return (
            <Animated.View
              key={`node-${idx}`}
              style={[
                styles.llNodeWrapper,
                {
                  opacity: anim.opacity,
                  transform: [{ scale: anim.scale }],
                },
              ]}
            >
              {/* Glow ring behind node */}
              {isActive && (
                <Animated.View
                  style={[
                    styles.llGlowRing,
                    { borderColor, opacity: anim.glowOpacity },
                  ]}
                />
              )}

              {/* Node box: [value | →] */}
              <View style={[styles.llNode, { borderColor }]}>
                <View style={[styles.llNodeValue, { backgroundColor: bgColor }]}>
                  <Text style={styles.nodeValue}>{val}</Text>
                </View>
                {/* Pointer cell with pulse animation */}
                <Animated.View style={[styles.llNodePointer, { opacity: anim.pointerPulse }]}>
                  <Text style={[styles.llPointerText, isActive && { color: borderColor }]}>→</Text>
                </Animated.View>
              </View>

              {/* Animated connecting arrow between nodes */}
              {idx < items.length - 1 && (
                <Animated.View
                  style={[
                    styles.llArrowWrapper,
                    {
                      opacity: anim.arrowOpacity,
                      transform: [{ translateX: anim.arrowX }],
                    },
                  ]}
                >
                  <Text style={styles.llArrow}>──</Text>
                </Animated.View>
              )}
            </Animated.View>
          );
        })}

        {/* NULL terminal with fade-in */}
        <Animated.View style={[styles.llNullNode, { opacity: nullFade }]}>
          <Text style={styles.llNullText}>NULL</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function LinearStructureCanvas({ step, isCompleted, algorithmName, height = 220 }: Props) {
  const renderCanvas = () => {
    switch (algorithmName) {
      case 'Stack':
        return <StackCanvas step={step} isCompleted={isCompleted} />;
      case 'Queue':
        return <QueueCanvas step={step} isCompleted={isCompleted} />;
      case 'Deque':
        return <DequeCanvas step={step} isCompleted={isCompleted} />;
      case 'Linked List':
        return <LinkedListCanvas step={step} isCompleted={isCompleted} />;
      default:
        return (
          <View style={styles.emptyMessage}>
            <Text style={styles.emptyText}>Estructura no reconocida: {algorithmName}</Text>
          </View>
        );
    }
  };

  // Badge de operación actual — extendido para Linked List
  const isLinkedList = algorithmName === 'Linked List';
  const opLabelMap = isLinkedList
    ? {
        insercion: '⬅ prepend()',
        intercambio: '✂ remove()',
        comparacion: '→ traverse',
        final: '✅ Listo',
        idle: '',
      }
    : {
        insercion: '⬆ Push / Insert',
        intercambio: '⬇ Pop / Dequeue',
        comparacion: '👁 Inspeccionar',
        final: '✅ Completado',
        idle: '',
      };
  const opLabel = step ? opLabelMap[step.tipoOperacion] : '';

  return (
    <View style={[styles.container, { minHeight: height }]}>
      {opLabel ? (
        <View style={styles.opBadge}>
          <Text style={styles.opBadgeText}>{opLabel}</Text>
        </View>
      ) : null}
      {renderCanvas()}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[2],
  },
  emptyMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[6],
  },
  emptyText: {
    color: DarkText.muted,
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.regular,
  },
  opBadge: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: 'rgba(0,212,255,0.12)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Accent[500],
  },
  opBadgeText: {
    color: Accent[500],
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
  },

  // Stack styles
  stackContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing[4],
  },
  pointerRow: {
    alignSelf: 'flex-start',
    marginLeft: 80,
    marginBottom: 2,
  },
  pointerLabel: {
    color: Accent[500],
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
  },
  stackNode: {
    width: 120,
    height: 40,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    flexDirection: 'row',
    gap: Spacing[2],
    paddingHorizontal: Spacing[2],
  },
  stackNodeTop: {
    borderStyle: 'dashed' as any,
    shadowColor: Accent[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  topLabel: {
    color: Accent[300],
    fontSize: 9,
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
  },
  stackBase: {
    width: 130,
    height: 4,
    backgroundColor: DarkText.muted,
    borderRadius: 2,
    marginTop: 2,
  },
  nodeValue: {
    color: DarkText.primary,
    fontSize: FontSizes.md,
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
  },

  // Queue styles
  queueWrapper: {
    width: '100%',
    paddingHorizontal: Spacing[2],
  },
  queuePointers: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[2],
    marginBottom: 2,
  },
  queueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  queueNodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueNode: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    color: DarkText.muted,
    fontSize: FontSizes.lg,
    marginHorizontal: 2,
  },
  queueDirectionLabels: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[2],
    marginTop: 4,
  },
  directionLabel: {
    color: DarkText.muted,
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.regular,
  },

  // Linked List styles
  linkedListWrapper: {
    width: '100%',
    paddingHorizontal: Spacing[2],
    alignItems: 'flex-start',
  },
  llHeadPointer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: Spacing[4],
    marginBottom: 2,
  },
  llHeadLabel: {
    color: Accent[500],
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    letterSpacing: 0.5,
  },
  llHeadArrow: {
    color: Accent[500],
    fontSize: FontSizes.sm,
    lineHeight: 14,
  },
  linkedListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  llNodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  llGlowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    zIndex: 0,
  },
  llNode: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    height: 56,
    zIndex: 1,
  },
  llNodeValue: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  llNodePointer: {
    width: 28,
    backgroundColor: DarkSurfaces.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: DarkSurfaces.border,
  },
  llPointerText: {
    color: Accent[500],
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.semiBold,
  },
  llArrowWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  llArrow: {
    color: DarkText.muted,
    fontSize: FontSizes.lg,
    marginHorizontal: 1,
    letterSpacing: -4,
  },
  llNullNode: {
    width: 52,
    height: 56,
    borderWidth: 2,
    borderColor: DarkSurfaces.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed' as any,
    marginLeft: 4,
  },
  llNullText: {
    color: DarkText.muted,
    fontSize: 10,
    fontFamily: FontFamilies.mono,
  },
});
