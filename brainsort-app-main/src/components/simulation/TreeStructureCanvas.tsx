import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Accent, DarkSurfaces, DarkText, Semantic, SimulationColors } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import type { SimulationStep, SimulationTreeNode } from '@brainsort/core';

interface TreeStructureCanvasProps {
  algorithmName: string;
  step: SimulationStep | null;
  isCompleted: boolean;
  height?: number;
}

type TreeNodeView = Pick<SimulationTreeNode, 'index' | 'value' | 'level' | 'position' | 'label'>;

function getNodeColor(index: number, step: SimulationStep | null, isCompleted: boolean) {
  if (isCompleted) return SimulationColors.final;
  const marker = step?.marcadores?.find((item) => item.index === index);
  if (marker) return marker.color;
  if (!step?.indicesActivos.includes(index)) return DarkSurfaces.surface;
  if (step.tipoOperacion === 'intercambio') return Semantic.error;
  if (step.tipoOperacion === 'insercion') return Accent[500];
  return SimulationColors.comparacion;
}

function getArrayLevels(values: number[]): TreeNodeView[][] {
  const levels: TreeNodeView[][] = [];
  let index = 0;
  let size = 1;

  while (index < values.length) {
    const level = values.slice(index, index + size).map((value, offset) => ({
      value,
      index: index + offset,
      level: levels.length,
      position: offset,
    }));
    levels.push(level);
    index += size;
    size *= 2;
  }

  return levels;
}

function getTreeNodeLevels(nodes: SimulationTreeNode[]): TreeNodeView[][] {
  const maxLevel = Math.max(...nodes.map((node) => node.level));

  return Array.from({ length: maxLevel + 1 }, (_, level) =>
    nodes
      .filter((node) => node.level === level)
      .sort((a, b) => a.position - b.position),
  ).filter((level) => level.length > 0);
}

export function TreeStructureCanvas({
  algorithmName,
  step,
  isCompleted,
  height = 220,
}: TreeStructureCanvasProps) {
  const values = step?.estadoArray ?? [];
  const explicitNodes = step?.nodosArbol ?? [];
  const levels = explicitNodes.length > 0
    ? getTreeNodeLevels(explicitNodes)
    : getArrayLevels(values);
  const isSegmentTree = algorithmName === 'Segment Tree';
  const title = isSegmentTree ? 'Segment tree por rangos' : 'Heap binario';

  if (levels.length === 0) {
    return (
      <View style={[styles.container, { minHeight: height }]}>
        <Text style={styles.emptyText}>Árbol vacío</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { minHeight: height }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{title}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.tree}>
          {levels.map((level, levelIndex) => (
            <View key={`level-${levelIndex}`} style={styles.level}>
              {level.map(({ value, index, label }) => {
                const color = getNodeColor(index, step, isCompleted);
                const marker = step?.marcadores?.find((item) => item.index === index);
                const active = !!marker || step?.indicesActivos.includes(index);
                return (
                  <View key={`node-${index}`} style={styles.nodeWrap}>
                    {levelIndex > 0 ? <View style={styles.connector} /> : null}
                    <View
                      style={[
                        styles.node,
                        {
                          backgroundColor: color,
                          borderColor: active || isCompleted ? color : DarkSurfaces.border,
                        },
                      ]}
                    >
                      <Text style={styles.value}>{value ?? '...'}</Text>
                      <Text style={styles.index}>{label ?? (isSegmentTree ? index + 1 : index)}</Text>
                      {marker ? <Text style={styles.marker}>{marker.label}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: Spacing[3],
  },
  badge: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: Accent[500],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 2,
    backgroundColor: 'rgba(0,212,255,0.12)',
  },
  badgeText: {
    color: Accent[500],
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
  },
  scrollContent: {
    minWidth: '100%',
    justifyContent: 'center',
  },
  tree: {
    gap: Spacing[3],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
  },
  level: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  nodeWrap: {
    alignItems: 'center',
  },
  connector: {
    width: 2,
    height: 10,
    backgroundColor: DarkSurfaces.border,
    marginBottom: 2,
  },
  node: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: DarkText.primary,
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
  index: {
    color: DarkText.muted,
    fontFamily: FontFamilies.mono,
    fontSize: 9,
  },
  marker: {
    color: DarkText.primary,
    fontFamily: FontFamilies.mono,
    fontSize: 8,
  },
  emptyText: {
    color: DarkText.muted,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
});
