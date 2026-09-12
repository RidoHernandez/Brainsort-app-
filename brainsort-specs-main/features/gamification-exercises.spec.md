# Gamification & Exercises Specification

> **Fuente de verdad**: `BrainSort-Modelo_del_Dominio.docx`, `BrainSort-Glosario.docx`, `BrainSort-Historias_de_Usuario.docx` (HU-07)

## 1. Context & Motivation
Los estudiantes necesitan un incentivo atractivo para practicar algoritmos. BrainSort resuelve esto con ejercicios de predicción durante la simulación y gamificación (Puntos, Niveles, Rachas Diarias, Ranking, Insignias).

## 2. User Experience (UX)
### Gamificación (ProgresoUsuario)
- Los atributos del progreso según el Modelo del Dominio son: `puntosTotales`, `nivelActual`, `rachaDías`, `posiciónRanking`.
- Un dashboard muestra nivel actual y puntos comparados con el siguiente hito.
- Icono animado 🔥 muestra días consecutivos activos.
- Tabla de clasificación pública (Ranking) lista a los top usuarios.
- Insignias con criterios de desbloqueo se comportan como logros.

### Ejercicios de Predicción (EjercicioPredicción)
- Según Glosario: "Actividad interactiva que permite al usuario anticipar el siguiente paso del algoritmo".
- La respuesta se evalúa automáticamente (según Glosario).
- Depende de la Simulación actual (según Glosario).
- Atributos según Modelo del Dominio: `pregunta`, `respuestaCorrecta`, `dificultad`, `feedbackPositivo`, `feedbackNegativo`.
- **Nota**: El modelo de dominio NO define un campo `opciones`. Las opciones de respuesta múltiple son una decisión de implementación de UI, no del dominio.
- La fase de expansión agrega ejercicios gamificados por algoritmo activo usando formatos cerrados o semi-cerrados, evitando preguntas 100% abiertas.
- Los ejercicios deben cubrir más que memorización: predicción de siguiente estado, completar una línea clave de pseudocódigo y ordenar barras al estado esperado.
- En la pantalla de ejercicios no debe mostrarse el bloque "Simulación del algoritmo"; practicar y simular son flujos separados.

### Tipos de Ejercicio Gamificados

| Tipo | Uso | Datos requeridos |
|---|---|---|
| `CompletarPseudocodigo` | El usuario elige qué fragmento va en un hueco de pseudocódigo. | `opciones[]`, `contenido.antes`, `contenido.despues`, `respuestaCorrecta` |
| `OrdenarBarras` | El usuario acomoda barras para llegar al estado de un paso objetivo. | `contenido.inicial`, `contenido.objetivo`, `contenido.pasoObjetivo`, `respuestaCorrecta` serializada |
| `PrediccionTexto` | Respuesta cerrada o validable automáticamente para predicción puntual. | `respuestaCorrecta`, feedback específico |

**Reglas de contenido:**

- No sembrar ejercicios 100% abiertos sin opciones o sin un estado objetivo verificable.
- Las preguntas deben poder evaluarse automáticamente con `respuestaCorrecta`.
- El seed debe ser idempotente por algoritmo + pregunta.
- Los ejercicios de barras deben describir el paso objetivo sin mostrar la simulación completa debajo.

### Insignias
- Atributos: `nombre`, `descripción`, `imagen`, `criterioDesbloqueo`, `fechaObtención`.
- Relación: ProgresoUsuario registra Insignias (1:0..*).

## 3. Core Requirements
**In-Scope (Según Documentación):**
- **ProgresoUsuario** con los 4 atributos del modelo: puntosTotales, nivelActual, rachaDías, posiciónRanking.
- **Insignias** con criterios de desbloqueo y fechaObtención.
- **EjercicioPredicción** asociado a un Algoritmo específico.
- Banco ampliado de ejercicios por algoritmo activo:
  - mínimo ejercicios de pseudocódigo y/o barras para cada algoritmo de la fase expandida,
  - dificultad ajustada al algoritmo (`Facil`, `Medio`, `Dificil`),
  - feedback positivo y negativo específico al error esperado.
- Mensaje de finalización con opciones "Reiniciar", "Siguiente Algoritmo", "Ver Código" (HU-07).
- Mensaje de éxito desaparece automáticamente después de 5 segundos (HU-07).

**Out-of-Scope:**
- Tiendas de compra de avatares o skins.
- Competencias multijugador en tiempo real.

## 4. Edge Cases & Error Handling
- Envíos rápidos múltiples a un ejercicio: debounce hasta que regrese la respuesta del backend.
- El mensaje de finalización no debe bloquear la interfaz de navegación principal (HU-07).
- Si un algoritmo no tiene ejercicios suficientes, la UI debe mostrar estado "Práctica en preparación" y no bloquear la simulación.
- El seed de ejercicios debe ser idempotente: no duplicar preguntas en ejecuciones repetidas.
