import { InsertionSortEngine } from '../insertion-sort';

describe('InsertionSortEngine', () => {
  let engine: InsertionSortEngine;

  beforeEach(() => {
    engine = new InsertionSortEngine();
  });

  it('debe ordenar correctamente un arreglo desordenado y generar pasos con campos requeridos', () => {
    const input = [5, 2, 8, 1];
    const steps = engine.execute(input);

    expect(steps.length).toBeGreaterThan(0);
    
    steps.forEach((step) => {
      expect(step).toHaveProperty('numeroPaso');
      expect(step).toHaveProperty('tipoOperacion');
      expect(step).toHaveProperty('indicesActivos');
      expect(step).toHaveProperty('estadoArray');
      expect(step).toHaveProperty('lineaPseudocodigo');
    });

    const finalStep = steps[steps.length - 1];
    expect(finalStep.tipoOperacion).toBe('final');
    expect(finalStep.estadoArray).toEqual([1, 2, 5, 8]);
  });

  it('debe retornar mínimo de pasos para arreglo de 1 elemento', () => {
    const input = [42];
    const steps = engine.execute(input);
    
    expect(steps).toHaveLength(1);
    expect(steps[0].tipoOperacion).toBe('final');
    expect(steps[0].estadoArray).toEqual([42]);
  });

  it('debe retornar lista vacía si el arreglo está vacío', () => {
    const input: number[] = [];
    const steps = engine.execute(input);
    expect(steps).toHaveLength(0);
  });

  it('arreglo ya ordenado genera pasos sin intercambios', () => {
    const input = [1, 2, 3];
    const steps = engine.execute(input);
    
    const intercambios = steps.filter((step) => step.tipoOperacion === 'intercambio');
    expect(intercambios.length).toBe(0);
    
    const finalStep = steps[steps.length - 1];
    expect(finalStep.estadoArray).toEqual([1, 2, 3]);
  });

  it('arreglo en orden inverso genera máximo de intercambios', () => {
    const input = [3, 2, 1];
    const steps = engine.execute(input);
    
    const intercambios = steps.filter((step) => step.tipoOperacion === 'intercambio');
    expect(intercambios.length).toBe(3);
    
    const finalStep = steps[steps.length - 1];
    expect(finalStep.estadoArray).toEqual([1, 2, 3]);
  });
});
