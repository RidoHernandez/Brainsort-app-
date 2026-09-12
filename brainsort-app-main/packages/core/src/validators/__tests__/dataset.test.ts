import { validateDataset } from '../dataset.validator';
import { ConjuntoDeDatos } from '../../types/simulation.types';

describe('dataset.validator', () => {
  it('Acepta arreglo válido de enteros', () => {
    const dataset: ConjuntoDeDatos = {
      tipoOrigen: 'Predeterminado',
      tamano: 3,
      valores: [10, 5, 8],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('Rechaza arreglo vacío', () => {
    const dataset: ConjuntoDeDatos = {
      tipoOrigen: 'Predeterminado',
      tamano: 0,
      valores: [],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('El arreglo de valores no puede estar vacío.');
  });

  it('Rechaza arreglo con valores no numéricos', () => {
    const dataset: any = {
      tipoOrigen: 'Personalizado',
      tamano: 3,
      valores: [1, 'texto', 3],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('no es un número válido'))).toBe(true);
  });

  it('Rechaza arreglo con valores nulos o indefinidos', () => {
    const dataset: any = {
      tipoOrigen: 'Personalizado',
      tamano: 2,
      valores: [1, null],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('es nulo o indefinido'))).toBe(true);
  });

  it('Rechaza arreglo con valores no enteros', () => {
    const dataset: ConjuntoDeDatos = {
      tipoOrigen: 'Predeterminado',
      tamano: 2,
      valores: [1.5, 2],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('debe ser un entero'))).toBe(true);
  });

  it('Valida rango de tamaño y consistencia', () => {
    const dataset: ConjuntoDeDatos = {
      tipoOrigen: 'Predeterminado',
      tamano: 5, // Tamaño dice 5
      valores: [1, 2, 3], // Pero solo hay 3 valores
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('no coincide con la longitud del arreglo'))).toBe(true);
  });

  it('Valida tipoOrigen correcto', () => {
    const dataset: any = {
      tipoOrigen: 'Invalido',
      tamano: 2,
      valores: [1, 2],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('tipoOrigen inválido'))).toBe(true);
  });
});
