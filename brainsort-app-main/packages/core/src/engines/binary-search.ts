import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class BinarySearchEngine implements SortEngine {
  name = 'Binary Search';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'low = 0; high = n - 1', indent: 0 },
      { line: 2, text: 'Mientras low <= high', indent: 0 },
      { line: 3, text: 'mid = piso((low + high) / 2)', indent: 1 },
      { line: 4, text: 'Si arreglo[mid] == objetivo: devolver mid', indent: 1 },
      { line: 5, text: 'Si arreglo[mid] < objetivo: low = mid + 1', indent: 1 },
      { line: 6, text: 'Si no: high = mid - 1', indent: 1 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const array = [...data].sort((a, b) => a - b);
    const target = array[Math.floor(array.length * 0.65)] ?? array[0];
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    let low = 0;
    let high = array.length - 1;
    let lastMid = 0;

    const getMarkers = (l: number, h: number, m: number, targetFoundIndex?: number) => {
      const markersList: any[] = [];
      
      // 1. Gather pointer labels dynamically by index first
      const indexLabels: Record<number, string[]> = {};
      if (l >= 0 && l < array.length) {
        indexLabels[l] = indexLabels[l] ?? [];
        indexLabels[l].push('low');
      }
      if (h >= 0 && h < array.length) {
        indexLabels[h] = indexLabels[h] ?? [];
        indexLabels[h].push('high');
      }
      if (m >= 0 && m < array.length && targetFoundIndex === undefined) {
        indexLabels[m] = indexLabels[m] ?? [];
        if (!indexLabels[m].includes('mid')) {
          indexLabels[m].push('mid');
        }
      }

      if (targetFoundIndex !== undefined && targetFoundIndex >= 0 && targetFoundIndex < array.length) {
        indexLabels[targetFoundIndex] = ['found'];
      }

      // 2. Mark discarded elements (outside range [l, h]) ONLY if they don't have active pointers
      for (let i = 0; i < array.length; i++) {
        if (indexLabels[i] === undefined && (i < l || i > h)) {
          markersList.push({
            index: i,
            label: '',
            role: 'descartado',
            color: '#1A2333', // Keep color value for compatibility, handled via opacity in BarChart
          });
        }
      }

      // Helper to merge labels into the project's standard codes
      const getMergedLabel = (labels: string[]) => {
        const hasLow = labels.includes('low');
        const hasHigh = labels.includes('high');
        const hasMid = labels.includes('mid');

        if (hasLow && hasHigh && hasMid) return 'L/M/H';
        if (hasLow && hasHigh) return 'L/H';
        if (hasLow && hasMid) return 'L/M';
        if (hasMid && hasHigh) return 'M/H';
        return labels[0];
      };

      // 3. Construct the actual pointer markers list
      for (const idxStr of Object.keys(indexLabels)) {
        const idx = parseInt(idxStr, 10);
        const labels = indexLabels[idx];
        const mergedLabel = getMergedLabel(labels);
        const isFound = labels.includes('found');

        markersList.push({
          index: idx,
          label: mergedLabel,
          role: isFound ? 'final' : 'pointer',
          color: isFound ? '#7ED321' : (mergedLabel.includes('mid') ? '#F5A623' : '#00D4FF'),
        });
      }

      return markersList;
    };

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      lastMid = mid;
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'comparacion',
        indicesActivos: [mid],
        estadoArray: [...array],
        lineaPseudocodigo: 3,
        marcadores: getMarkers(low, high, mid),
      });

      if (array[mid] === target) {
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'final',
          indicesActivos: [mid],
          estadoArray: [...array],
          lineaPseudocodigo: 4,
          marcadores: getMarkers(low, high, mid, mid),
        });
        return steps;
      }

      if (array[mid] < target) {
        low = mid + 1;
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: [],
          estadoArray: [...array],
          lineaPseudocodigo: 5,
          marcadores: getMarkers(low, high, mid),
        });
      } else {
        high = mid - 1;
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: [],
          estadoArray: [...array],
          lineaPseudocodigo: 6,
          marcadores: getMarkers(low, high, mid),
        });
      }
    }

    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      indicesActivos: [],
      estadoArray: [...array],
      lineaPseudocodigo: 6,
      marcadores: getMarkers(low, high, lastMid),
    });
    return steps;
  }
}
