# Tareas de Implementación: Core Domain

## Backend Tasks
- [ ] Implementar la entidad `Usuario` en `models/`.
- [ ] Implementar la entidad `Algoritmo` en `models/`.
- [ ] Implementar la entidad `ProgresoUsuario` en `models/`.
- [ ] Implementar la entidad `Insignia` en `models/`.
- [ ] Implementar la entidad `EjercicioPrediccion` en `models/`.
- [ ] Implementar la entidad `Simulacion` en `models/`.
- [ ] Implementar la entidad `Paso` (Step) en `models/`.
- [ ] Implementar la entidad `ConjuntoDeDatos` (DataSet) en `models/`.
- [ ] Implementar la entidad `SesionEstudio` (StudySession) en `models/`.
- [ ] Implementar la tabla join `ProgresoUsuario_Insignia` (many-to-many).
- [ ] Crear las enumeraciones: `AlgorithmCategory`, `UserRole`, `DifficultyLevel`, `SimulationState`, `OriginType`.
- [ ] Crear el endpoint `GET /api/algorithms?category=` en `controllers/`.
- [ ] Crear el endpoint `GET /api/algorithms/:id` en `controllers/`.
- [ ] Validaciones de entrada (arrays: 2–50 items, enteros positivos ≤ 999).
- [ ] Pruebas unitarias para los endpoints de Algoritmo.

## Frontend Tasks
- [ ] Crear la solicitud Axios/Fetch para `GET /api/algorithms`.
- [ ] Crear la solicitud Axios/Fetch para `GET /api/algorithms/:id`.
- [ ] Desarrollar el Componente Visual de la Biblioteca de Algoritmos (grid layout, filtros por categoría, búsqueda por nombre).
- [ ] Desarrollar la vista de detalle de Algoritmo (descripción, Big-O, pseudocódigo).
- [ ] Manejar el estado y mostrar indicadores de carga/error.
- [ ] Confirmar compatibilidad y color coding con `constitution.md`.

## Integration
- [ ] Conectar ambos entornos y verificar flujo de trabajo (End-to-End).
- [ ] Verificar que las relaciones del diagrama de clases se respetan en el ORM.
