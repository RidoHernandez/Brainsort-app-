# Sistema de Gamificación y Progresión (XP) — Especificación Técnica

> **Fuente de verdad**: `BrainSort-Modelo_del_Dominio.docx`, `BrainSort-Glosario.docx`, `BrainSort-Historias_de_Usuario.docx` (HU-07), `gamification-exercises.spec.md`, `gamification-exercises.plan.md`
> **Resuelve**: `tareas-faltantes.md` §2 (Fórmula de Niveles) y §3 (Puntos por Actividad)
> **Estado**: ✅ Definido — Pendiente aprobación del equipo

---

## 1. Contexto y Motivación

El modelo `ProgresoUsuario` define `nivelActual` (default 1) y `puntosTotales` (default 0), pero los SPECS no especificaban:
- La **fórmula** para calcular cuándo sube de nivel un usuario.
- Los **valores numéricos de XP** que otorga cada tipo de actividad.

Sin estos valores, `progress.service.ts` y `exercises.service.ts` no pueden funcionar. Este documento cierra ambas brechas.

---

## 2. Filosofía de Diseño

Se busca un sistema inspirado en **Duolingo**:
- **Accesible al inicio**: Los primeros niveles se alcanzan rápido para generar enganche.
- **Retador pero alcanzable**: A nivel 32, el requerimiento debe ser alto pero no astronómico.
- **Sin crecimiento exponencial puro**: Evitar que el XP se duplique en cada nivel. Se usa una fórmula **polinomial cuadrática con suavizado** que crece más rápido que lo lineal pero mucho más lento que lo exponencial.
- **Tiers de dificultad**: Los niveles se agrupan en tiers temáticos que dan significado narrativo al progreso.

---

## 3. Fórmula de Progresión de Niveles

### 3.1 Fórmula Base

```
XP_para_nivel(n) = 50 × n² + 50 × n
```

Donde `n` es el nivel al que se quiere subir (el nivel objetivo).

**Simplificado**: `XP_para_nivel(n) = 50n(n + 1)`

Esto da el **XP acumulado total** necesario para alcanzar el nivel `n`.

**XP marginal** (lo que cuesta pasar de nivel `n-1` a nivel `n`):
```
XP_marginal(n) = XP_para_nivel(n) - XP_para_nivel(n-1) = 100n
```

Es decir, cada nivel cuesta **100 XP más** que el anterior. Simple, predecible y justo.

### 3.2 Propiedades de la Fórmula

| Propiedad | Valor |
|---|---|
| Tipo de crecimiento | Cuadrático (`O(n²)`) |
| XP marginal por nivel | `100n` (lineal) |
| Nivel máximo definido | **32** (configurable) |
| XP total para nivel 32 | **52,800 XP** |
| Ratio nivel 32 / nivel 1 | 32× (controlado, no exponencial) |

### 3.3 Cálculo Inverso (Nivel a partir de XP)

Para determinar el nivel actual dado un total de XP:

```
nivel = floor((-1 + sqrt(1 + 4 × XP / 50)) / 2)
```

Si `nivel < 1`, retornar `1`.
Si `nivel > 32`, retornar `32` (cap).

---

## 4. Tabla de Progresión Completa (Niveles 1-32)

| Nivel | XP Acumulado | XP Marginal | Tier |
|------:|-----------:|----------:|------|
| 1 | 100 | 100 | 🌱 Novato |
| 2 | 300 | 200 | 🌱 Novato |
| 3 | 600 | 300 | 🌱 Novato |
| 4 | 1,000 | 400 | 🌱 Novato |
| 5 | 1,500 | 500 | 🌱 Novato |
| 6 | 2,100 | 600 | 🌿 Aprendiz |
| 7 | 2,800 | 700 | 🌿 Aprendiz |
| 8 | 3,600 | 800 | 🌿 Aprendiz |
| 9 | 4,500 | 900 | 🌿 Aprendiz |
| 10 | 5,500 | 1,000 | 🌿 Aprendiz |
| 11 | 6,600 | 1,100 | 🔥 Intermedio |
| 12 | 7,800 | 1,200 | 🔥 Intermedio |
| 13 | 9,100 | 1,300 | 🔥 Intermedio |
| 14 | 10,500 | 1,400 | 🔥 Intermedio |
| 15 | 12,000 | 1,500 | 🔥 Intermedio |
| 16 | 13,600 | 1,600 | ⚡ Avanzado |
| 17 | 15,300 | 1,700 | ⚡ Avanzado |
| 18 | 17,100 | 1,800 | ⚡ Avanzado |
| 19 | 19,000 | 1,900 | ⚡ Avanzado |
| 20 | 21,000 | 2,000 | ⚡ Avanzado |
| 21 | 23,100 | 2,100 | 💎 Experto |
| 22 | 25,300 | 2,200 | 💎 Experto |
| 23 | 27,600 | 2,300 | 💎 Experto |
| 24 | 30,000 | 2,400 | 💎 Experto |
| 25 | 32,500 | 2,500 | 💎 Experto |
| 26 | 35,100 | 2,600 | 🏆 Maestro |
| 27 | 37,800 | 2,700 | 🏆 Maestro |
| 28 | 40,600 | 2,800 | 🏆 Maestro |
| 29 | 43,500 | 2,900 | 🏆 Maestro |
| 30 | 46,500 | 3,000 | 🏆 Maestro |
| 31 | 49,600 | 3,100 | 👑 Leyenda |
| 32 | 52,800 | 3,200 | 👑 Leyenda |

### 4.1 Tiers de Progresión

| Tier | Niveles | Icono | Descripción |
|---|---|---|---|
| Novato | 1-5 | 🌱 | Primeros pasos, aprendiendo lo básico |
| Aprendiz | 6-10 | 🌿 | Familiarizado con los conceptos |
| Intermedio | 11-15 | 🔥 | Domina las técnicas fundamentales |
| Avanzado | 16-20 | ⚡ | Comprende patrones complejos |
| Experto | 21-25 | 💎 | Alto dominio de algoritmos |
| Maestro | 26-30 | 🏆 | Dominio excepcional |
| Leyenda | 31-32 | 👑 | Máximo reconocimiento |

---

## 5. Puntos (XP) por Actividad

### 5.1 Tabla de XP por Actividad

| Actividad | XP Otorgado | Condiciones |
|---|---:|---|
| **Ejercicio correcto — Fácil** | 10 XP | Respuesta correcta, primera vez. |
| **Ejercicio correcto — Medio** | 20 XP | Respuesta correcta, primera vez. |
| **Ejercicio correcto — Difícil** | 30 XP | Respuesta correcta, primera vez. |
| **Ejercicio incorrecto** | 0 XP | No se restan puntos (diseño Duolingo). |
| **Ejercicio ya resuelto (repetido)** | 0 XP | Anti-farming: no se otorga XP por el mismo ejercicio correcto ya resuelto. |
| **Simulación completada** | 5 XP | Completar todos los pasos de una simulación. Una vez por sesión. |
| **Bonus racha 7 días** | 50 XP | Se otorga automáticamente cuando `rachaDias` alcanza 7 por primera vez. |
| **Bonus racha 30 días** | 200 XP | Se otorga automáticamente cuando `rachaDias` alcanza 30 por primera vez. |
| **Reto diario** | 35 XP | Completar un ejercicio especial asignado diariamente (1 por día, dificultad variable). |

### 5.2 Reglas Generales de XP

1. **No se restan puntos**: Un ejercicio incorrecto retorna `puntosGanados: 0`. Los `puntosTotales` nunca disminuyen.
2. **Anti-farming**: Si el usuario ya resolvió correctamente un ejercicio (`RespuestaEjercicio` donde `correcto = true` y mismo `ejercicioId + usuarioId`), las respuestas posteriores retornan `puntosGanados: 0` aunque sean correctas.
3. **Racha diaria**: Se actualiza `rachaDias` si la última actividad fue el día calendario anterior (UTC). Si se pierde un día, `rachaDias` se resetea a 1. Los bonus de racha (7 y 30 días) se otorgan **una sola vez** (verificar contra insignia o flag).
4. **Nivel máximo**: Al alcanzar nivel 32, el usuario sigue acumulando XP pero el nivel no sube más.
5. **Transacciones ACID**: Toda actualización de `puntosTotales`, `nivelActual` y `rachaDias` debe hacerse dentro de una transacción Prisma para evitar race conditions.

### 5.3 Validación de Equilibrio

**Escenario: ¿Cuántos ejercicios para alcanzar nivel 32?**

| Estrategia del usuario | Ejercicios necesarios | Días estimados |
|---|---:|---:|
| Solo ejercicios fáciles (10 XP c/u) | 5,280 | ~264 días (20/día) |
| Solo ejercicios medios (20 XP c/u) | 2,640 | ~132 días (20/día) |
| Solo ejercicios difíciles (30 XP c/u) | 1,760 | ~88 días (20/día) |
| Mix realista (5F + 3M + 2D c/día) | — | ~228 días |
| Mix + simulaciones + retos diarios | — | ~150 días |

> **Conclusión**: Alcanzar nivel 32 requiere ~5 meses de uso constante con un mix de actividades. Es retador pero alcanzable, análogo a completar el árbol de Duolingo.

---

## 6. Pseudológica del Servicio de Progresión

> ⚠️ Esto NO es código, es pseudológica para documentar el comportamiento esperado.

### 6.1 Recalcular Nivel

```
FUNCIÓN recalcularNivel(puntosTotales):
  nivel = floor((-1 + sqrt(1 + 4 * puntosTotales / 50)) / 2)
  SI nivel < 1 ENTONCES nivel = 1
  SI nivel > 32 ENTONCES nivel = 32
  RETORNAR nivel
```

### 6.2 Evaluar Respuesta de Ejercicio

```
FUNCIÓN evaluarRespuesta(usuarioId, ejercicioId, respuesta):
  ejercicio = BUSCAR EjercicioPrediccion POR ejercicioId
  
  esCorrecto = (respuesta == ejercicio.respuestaCorrecta)
  puntosGanados = 0
  
  SI esCorrecto:
    yaResuelto = BUSCAR RespuestaEjercicio DONDE usuarioId Y ejercicioId Y correcto = true
    SI NO yaResuelto:
      puntosGanados = SEGÚN ejercicio.dificultad:
        Facil  → 10
        Medio  → 20
        Dificil → 30
  
  // Registrar respuesta
  INSERTAR RespuestaEjercicio(usuarioId, ejercicioId, respuesta, esCorrecto, puntosGanados)
  
  // Actualizar progreso (dentro de transacción ACID)
  TRANSACCIÓN:
    progreso.puntosTotales += puntosGanados
    progreso.nivelActual = recalcularNivel(progreso.puntosTotales)
    progreso.rachaDias = recalcularRacha(progreso.ultimaActividad)
    progreso.ultimaActividad = AHORA()
    progreso.posicionRanking = recalcularRanking(progreso.id)
  
  RETORNAR { esCorrecto, feedback, puntosGanados, rachaDias, posicionRanking, nivelActual }
```

### 6.3 Recalcular Racha

```
FUNCIÓN recalcularRacha(ultimaActividad):
  hoy = FECHA_UTC_ACTUAL()
  ultimoDia = FECHA_UTC(ultimaActividad)
  
  SI hoy == ultimoDia:
    // Ya se registró actividad hoy, no cambiar racha
    RETORNAR rachaDias_actual
  SI hoy == ultimoDia + 1_DIA:
    // Día consecutivo
    RETORNAR rachaDias_actual + 1
  SI NO:
    // Se perdió la racha
    RETORNAR 1
```

---

## 7. Respuesta API Actualizada

El endpoint `POST /api/ejercicios/:id/responder` ya retorna los campos necesarios (según `04-contratos-api.md`). Los valores ahora están definidos:

```json
// Ejemplo: Ejercicio Medio correcto, primera vez
{
  "data": {
    "correcto": true,
    "feedbackPositivo": "¡Correcto! Bubble Sort mueve el elemento mayor al final.",
    "puntosGanados": 20,
    "rachaDias": 4,
    "posicionRanking": 12,
    "nivelActual": 3
  }
}
```

---

## 8. Datos Auxiliares para el Frontend

### 8.1 Barra de Progreso del Dashboard

El frontend debe mostrar el progreso hacia el siguiente nivel:

```
xpActual = puntosTotales
xpParaNivelActual = 50 × nivelActual × (nivelActual + 1)
xpParaSiguienteNivel = 50 × (nivelActual + 1) × (nivelActual + 2)
xpMarginalRestante = xpParaSiguienteNivel - xpActual
porcentaje = (xpActual - xpParaNivelActual) / (xpParaSiguienteNivel - xpParaNivelActual) × 100
```

### 8.2 Texto del Tier

El tier se determina desde el `nivelActual`:

| Rango | Tier |
|---|---|
| 1-5 | Novato |
| 6-10 | Aprendiz |
| 11-15 | Intermedio |
| 16-20 | Avanzado |
| 21-25 | Experto |
| 26-30 | Maestro |
| 31-32 | Leyenda |

---

## 9. Impacto en Otros Módulos

| Módulo | Impacto |
|---|---|
| `progress.service` | Implementar `recalcularNivel()` con la fórmula cuadrática |
| `exercises.service` | Usar la tabla de XP por dificultad, validar anti-farming |
| `sync.service` | Sumar 5 XP por simulación sincronizada completada |
| `badges.service` | Verificar bonus de racha (7 y 30 días) |
| Frontend `PointsBanner` | Mostrar tier, nivel, barra de progreso |
| Frontend `ProgressScreen` | Tabla de niveles con tier actual resaltado |

---

## 10. Decisiones Abiertas

- [ ] **Reto diario**: ¿Se implementa en la V1 o se posterga? (Propuesta: postergar a V1.1 por complejidad de selección aleatoria equilibrada).
- [ ] **Bonus racha 30 días**: ¿Se otorga como insignia también o solo como XP? (Propuesta: crear una insignia adicional "Constancia Legendaria").
- [ ] **Nivel máximo**: ¿32 es definitivo o puede crecer con futuras expansiones de contenido?
