import { ConjuntoDeDatos, TipoOrigenDatos } from '../types/simulation.types';

export interface DatasetValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_ORIGENES: TipoOrigenDatos[] = ['Predeterminado', 'Personalizado'];

/**
 * T-FE-020: Valida un ConjuntoDeDatos antes de enviarlo al engine o a la API.
 * Reglas (según T-BE-057 y contrato API):
 *  - valores: solo enteros, sin nulos, sin NaN
 *  - tipoOrigen: debe ser 'Predeterminado' | 'Personalizado'
 *  - tamano: debe coincidir con valores.length
 */
export function validateDataset(dataset: ConjuntoDeDatos): DatasetValidationResult {
  const errors: string[] = [];

  // Validar tipoOrigen
  if (!VALID_ORIGENES.includes(dataset.tipoOrigen)) {
    errors.push(
      `tipoOrigen inválido: "${dataset.tipoOrigen}". Debe ser "Predeterminado" o "Personalizado".`
    );
  }

  // Validar que valores no esté vacío
  if (!Array.isArray(dataset.valores) || dataset.valores.length === 0) {
    errors.push('El arreglo de valores no puede estar vacío.');
    return { valid: false, errors };
  }

  // Validar que tamano coincida con la longitud real
  if (dataset.tamano !== dataset.valores.length) {
    errors.push(
      `tamano (${dataset.tamano}) no coincide con la longitud del arreglo (${dataset.valores.length}).`
    );
  }

  // Validar cada elemento del arreglo
  dataset.valores.forEach((val, idx) => {
    if (val === null || val === undefined) {
      errors.push(`El valor en el índice ${idx} es nulo o indefinido.`);
    } else if (typeof val !== 'number' || isNaN(val)) {
      errors.push(`El valor en el índice ${idx} no es un número válido: "${val}".`);
    } else if (!Number.isInteger(val)) {
      errors.push(`El valor en el índice ${idx} debe ser un entero: ${val}.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
