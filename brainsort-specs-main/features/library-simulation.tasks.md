# Tareas de Implementación: Library & Simulation

## Backend Tasks
- [ ] Implementar el endpoint `POST /api/simulaciones` en `controllers/` (genera pasos de simulación).
- [ ] Implementar el Step Generator (motor que calcula comparaciones, intercambios y posiciones finales).
- [ ] Mantener los 6 algoritmos base en biblioteca: Bubble Sort, Insertion Sort, Selection Sort, Linked List, Queue y Stack.
- [x] Implementar expansión del catálogo con Merge Sort, Quick Sort, Heap Sort, Binary Search, Linear Search, Deque, Priority Queue y Segment Tree.
- [x] Crear engines para cada algoritmo nuevo simulable (`meta`, `execute` y mapeo `lineaPseudocodigo`; el pseudocódigo vive en DB).
- [x] Registrar los engines nuevos en `src/simulations/engines/registry.ts`.
- [x] Actualizar `seed.ts` con metadatos, dificultad, categoría, tags, pseudocódigo y configuración visual de los algoritmos nuevos.
- [x] Agregar `visualizacion` por algoritmo para etiquetas de variables y estados de recursión sin hardcodear en frontend.
- [ ] Implementar CRUD de `Algoritmo` para el dashboard de administrador.
- [ ] Validaciones de entrada (array: min 2, max 50, enteros positivos hasta 999).
- [ ] Sanitizar inputs manuales: filtrar no-enteros, restringir longitud ≤ 50.
- [ ] Pruebas unitarias para cada algoritmo del Step Generator.
- [ ] Pruebas unitarias para el endpoint de simulación.

## Frontend Tasks
- [x] Crear la solicitud Axios/Fetch para `POST /api/simulaciones`.
- [ ] Desarrollar la Biblioteca de Algoritmos: grid layout responsive para 13+ algoritmos categorizados.
- [ ] Implementar filtro por categoría y búsqueda por nombre (instantáneo).
- [ ] Verificar que los filtros y búsqueda soporten tags de algoritmos nuevos.
- [ ] Agregar estado visual para algoritmos no navegables o `activo = false` ("Próximamente").
- [ ] Desarrollar el Simulation Viewer:
  - [ ] Gráfico de barras central representando los números del array.
  - [ ] Sidebar con pseudocódigo y resaltado de la línea en ejecución (`lineaPseudocodigo`).
  - [ ] Controles inferiores: Play (▶️), Pause (⏸️), Step-Forward (⏭️), Step-Back (⏮️).
  - [ ] Slider de velocidad ajustable (125ms a 2000ms).
- [ ] Implementar Data Intake: generación aleatoria, arrays casi-ordenados, input manual (CSV: `4,2,7,1`).
- [ ] Implementar motor de renderizado con `requestAnimationFrame` o CSS Transitions para animaciones a 60FPS.
- [x] Implementar color coding según `constitution.md` y soportar `marcadores[]` desde DB.
- [x] Agregar visualización de árboles con `TreeStructureCanvas` y soporte de `nodosArbol[]` para Segment Tree.
- [ ] Manejar el estado `currentStepIndex` con `useState` para navegación entre pasos.
- [ ] Manejar edge case: step forward cuando simulación está completa (no-op seguro).
- [ ] Confirmar compatibilidad y color coding con `constitution.md`.

## Integration
- [ ] Conectar ambos entornos y verificar flujo de trabajo (End-to-End).
- [ ] Verificar flujo: seleccionar algoritmo → ingresar datos → ver simulación paso a paso.
- [x] Verificar flujo para al menos 1 algoritmo nuevo de cada categoría: Ordenamiento, Búsqueda, Estructuras Lineales y Estructuras de Árboles.
- [ ] Verificar que el admin puede hacer CRUD de algoritmos desde su dashboard.
