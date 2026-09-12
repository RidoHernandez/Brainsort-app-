import { MergeSortEngine } from '../merge-sort';

describe('MergeSortEngine', () => {
  let engine: MergeSortEngine;

  beforeEach(() => {
    engine = new MergeSortEngine();
  });

  it('debe ordenar correctamente un arreglo desordenado y generar pasos con campos requeridos', () => {
    const steps = engine.execute([5, 2, 8, 1]);

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
    const steps = engine.execute([42]);

    expect(steps).toHaveLength(1);
    expect(steps[0].tipoOperacion).toBe('final');
    expect(steps[0].estadoArray).toEqual([42]);
  });

  it('debe retornar lista vacía si el arreglo está vacío', () => {
    expect(engine.execute([])).toHaveLength(0);
  });

  it('debe manejar valores duplicados sin perder elementos', () => {
    const steps = engine.execute([5, 3, 5, 1, 3]);
    const finalStep = steps[steps.length - 1];

    expect(finalStep.estadoArray).toEqual([1, 3, 3, 5, 5]);
  });

  it('debe exponer pseudocódigo con líneas numeradas', () => {
    const pseudocode = engine.getPseudocode();

    expect(pseudocode.length).toBeGreaterThan(0);
    expect(pseudocode[0]).toEqual(
      expect.objectContaining({ line: 1, indent: 0 }),
    );
  });
});
