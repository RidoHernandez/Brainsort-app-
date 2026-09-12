# Gamification & Exercises Technical Plan

> **Fuente de verdad**: `BrainSort-Modelo_del_Dominio.docx`, `BrainSort-Modelo_del_Dominio.uml`

## 1. Architectural Impact
La gamificación agrega estado significativo a los perfiles de usuario. Los atributos del ProgresoUsuario (`puntosTotales`, `nivelActual`, `rachaDías`, `posiciónRanking`) cambian frecuentemente. Transacciones ACID recomendadas para actualizaciones concurrentes.

## 2. API Design (Gamification & Exercises)

**Evaluar Ejercicio:**
```json
// POST /api/ejercicios/{id}/responder
{
  "respuesta": "[3, 1, 5, 8]"
}

// Response -> 200 OK
{
  "correcto": true,
  "feedback": "Correcto. Bubble Sort mueve el 5 a la derecha.",
  "feedbackPositivo": "Correcto. Bubble Sort mueve el 5 a la derecha.",
  "puntosGanados": 20,
  "puntosTotales": 340,
  "rachaDias": 4,
  "posicionRanking": 12,
  "nivelActual": 3
}
```

## 3. Data Models (Según Modelo del Dominio)

### ProgresoUsuario
- `puntosTotales`: Integer (Default 0)
- `nivelActual`: Integer
- `rachaDías`: Integer (Default 0)
- `posiciónRanking`: Integer

### EjercicioPredicción
- `pregunta`: Text
- `respuestaCorrecta`: String
- `dificultad`: String
- `feedbackPositivo`: Text
- `feedbackNegativo`: Text
- FK: `algoritmoId` → Algoritmo

### Insignia
- `nombre`: String
- `descripción`: Text
- `imagen`: String (URL/ruta)
- `criterioDesbloqueo`: String
- `fechaObtención`: DateTime

### Relación ProgresoUsuario ↔ Insignia
- Según UML: ProgresoUsuario **registra** Insignia (1:0..*)
- Tabla intermedia: `ProgresoUsuario_Insignia` con `progresoId`, `insigniaId`, `fechaObtencion`.

## 4. Leaderboard Strategy
- Índice global en DB sobre `puntosTotales DESC` para consultas rápidas.
- El `posiciónRanking` existe como atributo del dominio y debe actualizarse cuando cambien los puntos de cualquier usuario.

## 5. Security & Validation
- Los estudiantes no pueden asignar puntos manualmente. El endpoint evalúa las respuestas internamente.
- Validar que el ejercicio pertenezca a un algoritmo existente en la biblioteca.

## 6. Sistema de Insignias — Criterios y Evaluación

> **Enfoque**: `criterioDesbloqueo` como string descriptivo en la DB + evaluación hardcoded en `BadgesService`.
> No se requiere DSL, parser de reglas, ni tablas adicionales.

### 6.1 Catálogo de Insignias con Lógica Formal

| Insignia | `criterioDesbloqueo` (DB) | Lógica booleana | Evento trigger |
|---|---|---|---|
| **Primer Paso** | `"Completar 1 simulación"` | `SesionSimulacion.count(WHERE usuarioId AND completada = true) >= 1` | Simulación completada |
| **Explorador** | `"Visualizar 3 algoritmos"` | `SesionSimulacion.count(DISTINCT algoritmoId WHERE usuarioId) >= 3` | Simulación completada |
| **Racha de 7** | `"rachaDías >= 7"` | `ProgresoUsuario.rachaDias >= 7` | Actualización de racha |
| **Maestro del Orden** | `"Completar todos los algoritmos de Ordenamiento"` | `Algoritmo.count(WHERE categoria = Ordenamiento) == SesionSimulacion.count(DISTINCT algoritmoId WHERE usuarioId AND completada = true AND algoritmo.categoria = Ordenamiento)` | Simulación completada |

> **Nota sobre "Completar"**: Para insignias, "completar un algoritmo" = haber completado al menos 1 simulación de ese algoritmo (`SesionSimulacion.completada = true`). No se requiere completar ejercicios.

### 6.2 Pseudológica de BadgesService

```
FUNCIÓN checkAndAward(usuarioId):
  progreso = BUSCAR ProgresoUsuario POR usuarioId
  earned = BUSCAR insigniaIds de ProgresoInsignia POR progresoId
  allBadges = OBTENER_TODAS_INSIGNIAS()  // con caché en memoria
  
  PARA CADA badge EN allBadges:
    SI badge.id ESTÁ EN earned:
      CONTINUAR  // Ya la tiene, saltar
    
    SI meetsRequirement(badge.criterioDesbloqueo, usuarioId, progreso):
      INSERTAR ProgresoInsignia(progresoId, insigniaId, fechaObtencion = AHORA())
  
FUNCIÓN meetsRequirement(criterio, usuarioId, progreso) → booleano:
  SEGÚN criterio:
    "Completar 1 simulación"
      → CONTAR SesionSimulacion WHERE usuarioId AND completada = true >= 1
    "Visualizar 3 algoritmos"
      → CONTAR DISTINCT algoritmoId de SesionSimulacion WHERE usuarioId >= 3
    "rachaDías >= 7"
      → progreso.rachaDias >= 7
    "Completar todos los algoritmos de Ordenamiento"
      → totalOrdenamiento = CONTAR Algoritmo WHERE categoria = Ordenamiento AND activo = true
        completados = CONTAR DISTINCT algoritmoId de SesionSimulacion
                      WHERE usuarioId AND completada = true AND algoritmo.categoria = Ordenamiento
        → completados >= totalOrdenamiento
    DEFAULT → false  // Criterio desconocido, no otorgar
```

### 6.3 Eventos que Disparan la Verificación

La verificación **no** se ejecuta en cada request. Solo se llama `checkAndAward(userId)` desde 3 puntos:

| Servicio | Método | Cuando se llama |
|---|---|---|
| `simulations.service` | Después de marcar `SesionSimulacion.completada = true` | Simulación llega al último paso |
| `exercises.service` | Después de `evaluarRespuesta()` si `puntosGanados > 0` | Ejercicio correcto por primera vez |
| `progress.service` | Después de `recalcularRacha()` si `rachaDias` cambió | Actualización de racha diaria |

### 6.4 Caché de Insignias (Optimización)

Las insignias cambian muy raramente (solo cuando el Admin agrega una nueva). Se cachean en memoria:

```
VARIABLE badgesCache = null

FUNCIÓN getAllBadges():
  SI badgesCache ES null:
    badgesCache = SELECT * FROM insignias
  RETORNAR badgesCache

FUNCIÓN invalidateCache():
  badgesCache = null
  // Se llama cuando el Admin crea/modifica/elimina una insignia
```

**Costo por verificación**: 2 queries (progreso + earnedIds) + comparaciones en memoria. ~4-6ms total.

### 6.5 Agregar Nuevas Insignias

Para agregar una insignia nueva:
1. **INSERT** en tabla `insignias` con `criterioDesbloqueo` descriptivo.
2. **Agregar** un nuevo `case` en `meetsRequirement()` del `BadgesService`.
3. **Llamar** `invalidateCache()` para refrescar la caché.

No se requieren migraciones de DB ni cambios en el schema Prisma.

### 6.6 Administración de Insignias

Las insignias **no** se gestionan desde el panel de administrador en la V1. Se agregan por seed/migración. Si en el futuro se necesita un CRUD de insignias desde el admin, se puede agregar sin cambios al modelo de datos (los endpoints `GET /api/insignias` y `GET /api/insignias/me` ya existen).

