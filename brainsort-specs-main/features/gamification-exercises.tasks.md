# Tareas de Implementación: Gamification & Exercises

## Backend Tasks
- [ ] Implementar el endpoint `POST /api/ejercicios/{id}/responder` en `controllers/` (evalúa respuesta y asigna puntos).
- [ ] Implementar endpoint administrativo `POST /api/ejercicios` para crear ejercicios asociados a un algoritmo.
- [ ] Implementar endpoint administrativo `PATCH /api/ejercicios/{id}` para editar pregunta, respuesta, dificultad y feedback.
- [ ] Implementar endpoint administrativo `DELETE /api/ejercicios/{id}` para desactivar o eliminar ejercicios.
- [x] Implementar el endpoint `GET /api/progreso/ranking` en `controllers/` (top usuarios por `puntosTotales DESC`).
- [x] Actualizar `seed.ts` para crear ejercicios gamificados por algoritmo activo usando tipos cerrados o semi-cerrados.
- [x] Agregar ejercicios para algoritmos nuevos: Merge Sort, Quick Sort, Heap Sort, Binary Search, Linear Search, Deque, Priority Queue y Segment Tree.
- [x] Eliminar de la seed las preguntas 100% abiertas que no tienen opciones o contenido evaluable.
- [ ] Validar cobertura de ejercicios por algoritmo: bloquear publicación de algoritmo activo si tiene menos de 3 ejercicios.
- [ ] Implementar lógica de puntos: 5pts simulación completa, 10/25/50pts ejercicios (Easy/Med/Hard).
- [ ] Implementar cálculo de racha (streak): validación server-time con ciclos UTC de 24 horas.
- [ ] Implementar tabla join `ProgresoUsuario_Insignia` con `fechaObtencion` (many-to-many).
- [ ] Implementar verificación de criterios de desbloqueo de insignias (`Primer Paso`, `Constancia`, etc.).
- [ ] Implementar validación anti-farming: un usuario no puede obtener puntos del mismo ejercicio ya resuelto correctamente.
- [ ] Implementar transacciones ACID para `SET puntosTotales = puntosTotales + X` (evitar race conditions).
- [ ] Implementar debounce server-side: bloquear submissions hasta que el backend responda (evitar doble asignación de puntos).
- [ ] Optimizar leaderboard con índice DB en `puntosTotales DESC`.
- [ ] Pruebas unitarias para evaluación de ejercicios, cálculo de puntos y streaks.
- [ ] Pruebas unitarias para seed idempotente de ejercicios y validación de cobertura por algoritmo.

## Frontend Tasks
- [x] Crear la solicitud Axios/Fetch para `POST /api/ejercicios/{id}/responder`.
- [x] Crear la solicitud Axios/Fetch para `GET /api/progreso/ranking`.
- [ ] Desarrollar el Dashboard de Gamificación:
  - [x] Mostrar `Nivel` y `Puntos`.
  - [ ] Icono animado 🔥 para racha de días consecutivos.
  - [ ] Mostrar insignias bloqueadas/desbloqueadas (estilo PlayStation Trophies).
- [x] Desarrollar la Tabla de Posiciones pública (top 100 learners).
- [x] Desarrollar el Componente de Ejercicio Predictivo:
  - [x] Prompt: "Dado array [X] en paso Y de Algoritmo Z, predice el siguiente estado."
  - [x] Opciones de selección múltiple para `CompletarPseudocodigo`.
  - [x] Interacción de barras para `OrdenarBarras`.
  - [x] Feedback inmediato con animaciones verde (correcto) / rojo (incorrecto).
  - [x] Mostrar puntos ganados y racha actualizada.
- [ ] Agregar selector/listado de ejercicios por algoritmo cuando existan múltiples ejercicios disponibles.
- [ ] Mostrar estado "Práctica en preparación" si un algoritmo aún no tiene ejercicios suficientes.
- [ ] Crear UI administrativa para alta/edición de ejercicios por algoritmo (`ManageExercisesScreen`).
- [x] Implementar debounce en el botón de respuesta (bloquear hasta respuesta del backend).
- [x] Manejar el estado y mostrar indicadores de carga/error.
- [x] Ocultar la sección "Simulación del algoritmo" dentro de la pantalla de ejercicios.
- [ ] Confirmar compatibilidad y color coding con `constitution.md`.

## Integration
- [ ] Conectar ambos entornos y verificar flujo de trabajo (End-to-End).
- [ ] Verificar flujo: responder ejercicio → ver feedback → puntos actualizados → badge desbloqueado.
- [ ] Verificar que el ranking se actualiza correctamente tras respuestas exitosas.
- [ ] Verificar que cada algoritmo activo muestra al menos 3 ejercicios y que el flujo de práctica funciona para algoritmos nuevos.
