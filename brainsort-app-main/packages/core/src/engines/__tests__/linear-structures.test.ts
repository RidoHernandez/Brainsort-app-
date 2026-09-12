import { LinkedListEngine } from '../linked-list';
import { QueueEngine } from '../queue';
import { StackEngine } from '../stack';

describe('linear structure engines', () => {
  it('StackEngine genera pasos LIFO hasta estado final vacio', () => {
    const engine = new StackEngine();
    const steps = engine.execute([1, 2, 3]);

    expect(steps[0]).toMatchObject({
      tipoOperacion: 'insercion',
      estadoArray: [1],
      lineaPseudocodigo: 2,
    });
    expect(steps.some((step) => step.estadoArray.join(',') === '1,2,3')).toBe(true);
    expect(steps[steps.length - 1]).toMatchObject({
      tipoOperacion: 'final',
      estadoArray: [],
      lineaPseudocodigo: 7,
    });
  });

  it('QueueEngine genera pasos FIFO hasta estado final vacio', () => {
    const engine = new QueueEngine();
    const steps = engine.execute([1, 2, 3]);

    expect(steps[0]).toMatchObject({
      tipoOperacion: 'insercion',
      indicesActivos: [0],
      estadoArray: [1],
      lineaPseudocodigo: 2,
    });
    expect(steps.some((step) => step.tipoOperacion === 'intercambio' && step.indicesActivos[0] === 0)).toBe(true);
    expect(steps[steps.length - 1]).toMatchObject({
      tipoOperacion: 'final',
      estadoArray: [],
      lineaPseudocodigo: 7,
    });
  });

  it('LinkedListEngine inserta al inicio y conserva recorrido final', () => {
    const engine = new LinkedListEngine();
    const steps = engine.execute([1, 2, 3]);

    expect(steps[0]).toMatchObject({
      tipoOperacion: 'insercion',
      indicesActivos: [0],
      estadoArray: [1],
      lineaPseudocodigo: 2,
    });
    expect(steps.some((step) => step.estadoArray.join(',') === '3,2,1')).toBe(true);
    expect(steps[steps.length - 1]).toMatchObject({
      tipoOperacion: 'final',
      estadoArray: [3, 2, 1],
      lineaPseudocodigo: 6,
    });
  });

  it('expone pseudocodigo para cada estructura lineal', () => {
    expect(new StackEngine().getPseudocode()).toHaveLength(7);
    expect(new QueueEngine().getPseudocode()).toHaveLength(7);
    expect(new LinkedListEngine().getPseudocode()).toHaveLength(6);
  });
});
