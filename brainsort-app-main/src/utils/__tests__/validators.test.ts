import {
  combineValidations,
  parseDatasetInput,
  validateContrasena,
  validateContrasenaConfirmacion,
  validateCorreo,
  validateDataset,
  validateNombre,
  validateRol,
  validateSpeed,
} from '../validators';

describe('UI validators', () => {
  it('valida nombre, correo, contrasena y rol correctos', () => {
    expect(validateNombre('Ada Lovelace')).toEqual({ valid: true });
    expect(validateCorreo('ada@example.com')).toEqual({ valid: true });
    expect(validateContrasena('Password123')).toEqual({ valid: true });
    expect(validateRol('Estudiante')).toEqual({ valid: true });
  });

  it('rechaza campos de autenticacion invalidos con mensajes de UX', () => {
    expect(validateNombre('A').valid).toBe(false);
    expect(validateNombre('Ada42').valid).toBe(false);
    expect(validateCorreo('correo-sin-arroba').valid).toBe(false);
    expect(validateContrasena('1234567').valid).toBe(false);
    expect(validateContrasenaConfirmacion('Password123', 'Password124').valid).toBe(false);
    expect(validateRol('Administrador').valid).toBe(false);
  });

  it('valida datasets numericos dentro de rango', () => {
    expect(validateDataset([5, 2, 8, 1])).toEqual({ valid: true });
  });

  it('rechaza datasets vacios, pequenos, grandes o no enteros', () => {
    expect(validateDataset([]).valid).toBe(false);
    expect(validateDataset([1]).valid).toBe(false);
    expect(validateDataset(Array.from({ length: 21 }, (_, i) => i)).valid).toBe(false);
    expect(validateDataset([1, 2.5]).valid).toBe(false);
    expect(validateDataset([1, Number.NaN]).valid).toBe(false);
  });

  it('parsea dataset personalizado separado por coma, espacio o punto y coma', () => {
    expect(parseDatasetInput('5, 2; 8 1')).toEqual({
      values: [5, 2, 8, 1],
      error: null,
    });
  });

  it('reporta error al parsear dataset personalizado invalido', () => {
    expect(parseDatasetInput('').error).toContain('Introduce');
    expect(parseDatasetInput('5, abc, 1').error).toContain('abc');
    expect(parseDatasetInput('1').error).toContain('al menos 2');
  });

  it('valida velocidad de simulacion en rango y paso de 0.25', () => {
    expect(validateSpeed(0.25)).toEqual({ valid: true });
    expect(validateSpeed(1)).toEqual({ valid: true });
    expect(validateSpeed(2)).toEqual({ valid: true });
    expect(validateSpeed(0.1).valid).toBe(false);
    expect(validateSpeed(2.25).valid).toBe(false);
    expect(validateSpeed(1.1).valid).toBe(false);
  });

  it('combina validaciones retornando el primer error', () => {
    const firstError = validateCorreo('mal');

    expect(combineValidations([{ valid: true }, firstError, validateContrasena('123')])).toBe(firstError);
    expect(combineValidations([{ valid: true }, { valid: true }])).toEqual({ valid: true });
  });
});
