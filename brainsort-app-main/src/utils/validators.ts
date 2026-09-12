/**
 * validators.ts
 * BrainSort — Validaciones de UI
 *
 * task_breakdown.md T-FE-029
 *
 * Validaciones del lado cliente (formularios, dataset de simulación).
 * NO duplican la lógica del backend — son solo para UX inmediata.
 *
 * Convención de retorno:
 *   - Éxito: `{ valid: true }`
 *   - Error:  `{ valid: false, message: string }`     (mensaje en español — idioma del dominio)
 */

// ─── Tipo de Resultado ────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: true;
}

export interface ValidationError {
  valid: false;
  message: string;
}

export type ValidationOutcome = ValidationResult | ValidationError;

function ok(): ValidationResult {
  return { valid: true };
}

function fail(message: string): ValidationError {
  return { valid: false, message };
}

// ─── Auth — Registro de Usuario ───────────────────────────────────────────────

/**
 * Valida el nombre de usuario.
 * Regla: mínimo 2 caracteres, máximo 80, solo letras/espacios/guiones.
 */
export function validateNombre(nombre: string): ValidationOutcome {
  const trimmed = nombre.trim();
  if (trimmed.length < 2) return fail('El nombre debe tener al menos 2 caracteres.');
  if (trimmed.length > 80) return fail('El nombre no puede superar los 80 caracteres.');
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/.test(trimmed)) {
    return fail('El nombre solo puede contener letras, espacios y guiones.');
  }
  return ok();
}

/**
 * Valida un correo electrónico.
 * Regla: formato RFC 5322 básico.
 */
export function validateCorreo(correo: string): ValidationOutcome {
  const trimmed = correo.trim();
  if (!trimmed) return fail('El correo es obligatorio.');
  // RFC 5322 simplified — sufficient for UX-level validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(trimmed)) return fail('Introduce un correo electrónico válido.');
  return ok();
}

/**
 * Valida la contraseña.
 * Regla: mínimo 8 caracteres (alineado con register.dto.ts @MinLength(8)).
 */
export function validateContrasena(contrasena: string): ValidationOutcome {
  if (!contrasena) return fail('La contraseña es obligatoria.');
  if (contrasena.length < 8) return fail('La contraseña debe tener al menos 8 caracteres.');
  return ok();
}

/**
 * Valida que las dos contraseñas coincidan (campo "confirmar contraseña").
 */
export function validateContrasenaConfirmacion(
  contrasena: string,
  confirmacion: string,
): ValidationOutcome {
  if (contrasena !== confirmacion) return fail('Las contraseñas no coinciden.');
  return ok();
}

/**
 * Valida el campo de rol.
 * Valores permitidos: alineados con Enum `Rol` del backend.
 * Referencia: T-BE-039 (RegisterDto @IsEnum)
 */
const ROLES_VALIDOS = ['Estudiante', 'Profesor', 'Autodidacta'] as const;

export type RolValido = (typeof ROLES_VALIDOS)[number];

export function validateRol(rol: string): ValidationOutcome {
  if (!ROLES_VALIDOS.includes(rol as RolValido)) {
    return fail('Selecciona un rol válido: Estudiante, Profesor o Autodidacta.');
  }
  return ok();
}

// ─── Dataset de Simulación ────────────────────────────────────────────────────

/**
 * Valida un arreglo de valores de entrada para la simulación.
 * Referencia: T-BE-057 (CreateSimulationDto) y la lógica del engine (packages/core).
 *
 * Reglas:
 *  1. Sin valores nulos / NaN
 *  2. Solo enteros
 *  3. Al menos 2 elementos; máximo 20
 *  4. Sin caracteres no válidos (cuando viene de un input de texto)
 */
export function validateDataset(values: number[]): ValidationOutcome {
  if (!values || values.length === 0) {
    return fail('Introduce al menos un valor en el conjunto de datos.');
  }
  if (values.length < 2) {
    return fail('El conjunto de datos debe tener al menos 2 elementos.');
  }
  if (values.length > 20) {
    return fail('El conjunto de datos no puede tener más de 20 elementos.');
  }
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (v === null || v === undefined || Number.isNaN(v)) {
      return fail(`El elemento en la posición ${i + 1} no es válido.`);
    }
    if (!Number.isInteger(v)) {
      return fail(`Todos los valores deben ser números enteros. "${v}" no lo es.`);
    }
  }
  return ok();
}

/**
 * Parsea la cadena de texto del input de dataset personalizado.
 * Acepta números separados por comas, espacios o punto y coma.
 *
 * @returns `{ values, error }` — error es null si el parse fue exitoso.
 *
 * @example
 * parseDatasetInput("5, 3, 8, 1")  → { values: [5, 3, 8, 1], error: null }
 * parseDatasetInput("5, abc, 8")   → { values: [], error: "..." }
 */
export function parseDatasetInput(raw: string): { values: number[]; error: string | null } {
  const parts = raw
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return { values: [], error: 'Introduce al menos un número.' };
  }

  const values: number[] = [];
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || Number.isNaN(n)) {
      return {
        values: [],
        error: `"${part}" no es un número entero válido.`,
      };
    }
    values.push(n);
  }

  const result = validateDataset(values);
  if (!result.valid) {
    return { values: [], error: result.message };
  }

  return { values, error: null };
}

// ─── Velocidad de Reproducción ────────────────────────────────────────────────

/**
 * Valida la velocidad de reproducción de la simulación.
 * Rango permitido: [0.25, 2.0] con incrementos de 0.25.
 * Referencia: Glosario y T-FE-068 (SpeedSlider)
 */
const SPEED_MIN = 0.25;
const SPEED_MAX = 2.0;
const SPEED_STEP = 0.25;

export function validateSpeed(speed: number): ValidationOutcome {
  if (speed < SPEED_MIN || speed > SPEED_MAX) {
    return fail(`La velocidad debe estar entre ${SPEED_MIN}× y ${SPEED_MAX}×.`);
  }
  // Verifica que sea múltiplo del paso (tolerancia de punto flotante)
  const remainder = Math.round((speed / SPEED_STEP) * 1000) % 1000;
  if (remainder !== 0) {
    return fail(`La velocidad debe ser un múltiplo de ${SPEED_STEP}.`);
  }
  return ok();
}

// ─── Utilidad — validar formulario completo ───────────────────────────────────

/**
 * Ejecuta múltiples validaciones en orden. Devuelve el primer error encontrado
 * o `{ valid: true }` si todos pasan.
 *
 * @example
 * const result = combineValidations([
 *   validateNombre(nombre),
 *   validateCorreo(correo),
 *   validateContrasena(pass),
 * ]);
 */
export function combineValidations(results: ValidationOutcome[]): ValidationOutcome {
  for (const result of results) {
    if (!result.valid) return result;
  }
  return ok();
}
