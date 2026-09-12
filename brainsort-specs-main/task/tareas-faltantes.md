
# ⚠️ Tareas Faltantes — Información No Especificada en los SPECS

> **Propósito**: Este documento registra los puntos que **no están definidos** en la documentación original del proyecto y que requieren decisión del equipo antes o durante la implementación.
> **Regla**: Ninguno de estos valores ha sido inventado. Cada punto lista el contexto donde se necesita y el impacto si no se define.

---

## 1. ~~Ejercicios de Predicción — Datos Iniciales (Seed)~~ ✅ RESUELTO

> **Resuelto en**: `plan-de-implementacion/03-base-de-datos.md` §5 (seed.ts)
>
> **Resumen**: 1 ejercicio por algoritmo (Bubble Sort, Selection Sort, Insertion Sort) — dificultad Fácil. Mínimo necesario para probar el flujo completo de gamificación. Más ejercicios se agregarán cuando se expanda el catálogo de algoritmos.

- [x] Definir al menos 1 ejercicio por algoritmo de ordenamiento. → 3 ejercicios definidos (1 por algoritmo)
- [x] Especificar: `pregunta`, `respuestaCorrecta`, `dificultad`, `feedbackPositivo`, `feedbackNegativo`. → Completo
- [x] Asociar cada ejercicio a un `algoritmoId`. → Via `findUnique({ where: { nombre } })`

---

## 2. ~~Fórmula de Cálculo de Niveles~~ ✅ RESUELTO

> **Resuelto en**: [`gamification-xp-progression.spec.md`](../features/gamification-xp-progression.spec.md) §3-§4
>
> **Resumen**: Fórmula cuadrática `XP_para_nivel(n) = 50n(n+1)`. XP marginal = `100n`. Nivel máximo = 32 (52,800 XP total). Tiers: Novato → Aprendiz → Intermedio → Avanzado → Experto → Maestro → Leyenda.

- [x] Definir fórmula o tabla de umbrales.
- [x] ¿Existe un nivel máximo? → Sí, nivel 32.
- [x] ¿Los niveles siguen una progresión lineal o exponencial? → Cuadrática (entre ambas).

---

## 3. ~~Puntos Otorgados por Tipo de Actividad~~ ✅ RESUELTO

> **Resuelto en**: [`gamification-xp-progression.spec.md`](../features/gamification-xp-progression.spec.md) §5
>
> **Resumen**: Fácil=10, Medio=25, Difícil=50, Simulación=5, Reto diario=35, Bonus racha 7d=50, Bonus racha 30d=200. Anti-farming incluido.

- [x] Puntos por ejercicio correcto (¿varía según dificultad?) → Sí: 10/25/50.
- [x] Puntos por simulación completada → 5 XP.
- [x] Puntos por racha de días (¿bonus?) → 50 XP a los 7 días, 200 XP a los 30 días.
- [x] ¿Se otorgan puntos por sesiones sincronizadas offline? → Sí, 5 XP por simulación sincronizada completada.

---

## 4. ~~Criterios Exactos de Desbloqueo de Insignias~~ ✅ RESUELTO

> **Resuelto en**: [`gamification-exercises.plan.md`](../features/gamification-exercises.plan.md) §6
>
> **Resumen**: Enfoque hardcoded — `criterioDesbloqueo` como string descriptivo en DB, evaluación con map de funciones booleanas en `BadgesService`. Verificación event-driven desde 3 triggers (simulación completada, ejercicio correcto, racha actualizada). Caché en memoria para insignias. ~4-6ms por check.

- [x] ¿Se verifican insignias automáticamente después de cada actividad o bajo demanda? → Automáticamente, event-driven desde 3 puntos.
- [x] Para "Completar todos los algoritmos de Ordenamiento": ¿se requiere completar la simulación, los ejercicios, o ambos? → Solo simulación completada (`SesionSimulacion.completada = true`).
- [x] ¿Se pueden agregar insignias nuevas desde el panel de administrador? → No en V1. Se agregan por seed/migración.
- [x] Definir la lógica booleana exacta para cada criterio. → Definida en §6.1 con queries Prisma equivalentes.

---

## 5. ~~Gestión de Autenticación del Administrador~~ ✅ RESUELTO

> **Resuelto en**: [`admin-access-routing.spec.md`](../features/admin-access-routing.spec.md)
>
> **Resumen**: Mismo endpoint `/api/auth/login`. Búsqueda secuencial: primero `usuarios`, luego `administradores`. JWT incluye campo `tipo: "usuario" | "administrador"`. Frontend redirige por `tipo` a `MainTabNavigator` o `AdminNavigator`.

- [x] ¿El administrador usa el mismo endpoint `/api/auth/login`? → Sí, búsqueda dual secuencial.
- [x] ¿O existe un endpoint separado? → No, se usa el mismo endpoint.
- [x] ¿El campo `credencialesAdmin` reemplaza al campo `rol`? → No, el JWT lleva `tipo` + `rol` (para admin, `rol="Administrador"`).
- [x] ¿Puede un Administrador tener también un registro en `Usuario`? → No, son entidades mutuamente exclusivas.

---

## 6. ~~Almacenamiento de Assets para Módulos Offline~~ ✅ RESUELTO

> **Resuelto en**: `plan-de-implementacion/04-contratos-api.md` §8, `cambios-en-documentacion/CHANGELOG.md` CDR-004
>
> **Resumen**: Sin bucket externo. El backend genera el JSON del módulo directamente desde el engine registrado (`AlgorithmDefinition`) + ejercicios de la DB. El frontend lo guarda en `expo-sqlite` (móvil) o `IndexedDB` (web). El engine de ejecución (`execute()`) ya está instalado como parte de la app en `packages/core`.

- [x] ¿Qué servicio de almacenamiento se usará? → Ninguno externo. El backend sirve el JSON directamente.
- [x] ¿Las URLs serán pre-firmadas? → No aplica. No hay URLs externas.
- [x] ¿Los archivos se generan estáticamente o dinámicamente? → Dinámicamente desde el engine + DB.
- [x] ¿Presupuesto estimado? → $0. Se sirve desde el mismo Railway.

---

## 7. ~~WASM: Compilación y Módulos Soportados~~ ✅ RESUELTO

> **Resuelto en**: [`sandbox-code-runner.plan.md`](../features/sandbox-code-runner.plan.md)
>
> **Resumen**: V1 usa **MicroPython WASM** (~300KB) para Python y **JSCPP** (~200KB, JS puro) para C++ dentro de un WebView sandboxed. 100% frontend, sin backend nuevo. Ejercicios hardcoded. Funciona en Android, iOS y Web. V2 profundizará con más ejercicios, integración con XP, y editor avanzado.

- [x] ¿Qué intérpretes compilar a WASM? → MicroPython para Python, JSCPP (JS) para C++
- [x] ¿Para qué se usarán? → Mini juez local: el usuario escribe código para resolver ejercicios algorítmicos
- [x] ¿Se necesita un CI pipeline separado? → No. Los assets se descargan pre-compilados
- [x] ¿iOS excluido? → No. WKWebView soporta WASM. Se probará en V1

---

## 8. ~~Mapeo de Líneas de Pseudocódigo para Engines~~ ✅ RESUELTO

> **Resuelto en**: `cambios-en-documentacion/CHANGELOG.md` CDR-001, `01-backend-api.md` §2.4
>
> **Resumen**: Patrón **Engine Auto-Contenido** — cada engine define su `pseudocode: PseudocodeLine[]` junto con la lógica de `execute()`. Las líneas de pseudocódigo están co-localizadas con el código que las referencia, por lo que es **imposible** que se desincronicen. Escala a 120+ algoritmos. Indexado desde 1. Solo operaciones visibles generan steps.

- [x] Definir el mapeo línea-por-línea del pseudocódigo de **Selection Sort**. → 6 líneas definidas en `selection-sort.engine.ts`
- [x] Definir el mapeo línea-por-línea del pseudocódigo de **Insertion Sort**. → 7 líneas definidas en `insertion-sort.engine.ts`
- [x] ¿Se numera desde 1 o desde 0? → Desde 1 (humano-legible)
- [x] ¿Cada operación del engine corresponde exactamente a una línea? → Solo las operaciones visibles (comparación, intercambio, inserción) generan steps. Loops y control no generan steps.

---

## Resumen

| # | Tema | Prioridad | Bloquea |
|---|---|---|---|
| 1 | ~~Seed de ejercicios~~ | ✅ Resuelto | `03-base-de-datos.md` §5 (1 por algoritmo) |
| 2 | ~~Fórmula de niveles~~ | ✅ Resuelto | [`gamification-xp-progression.spec.md`](../features/gamification-xp-progression.spec.md) |
| 3 | ~~Puntos por actividad~~ | ✅ Resuelto | [`gamification-xp-progression.spec.md`](../features/gamification-xp-progression.spec.md) |
| 4 | ~~Criterios de insignias~~ | ✅ Resuelto | [`gamification-exercises.plan.md`](../features/gamification-exercises.plan.md) §6 |
| 5 | ~~Auth de Administrador~~ | ✅ Resuelto | [`admin-access-routing.spec.md`](../features/admin-access-routing.spec.md) |
| 6 | ~~Storage de assets offline~~ | ✅ Resuelto | CDR-004 JSON directo del backend |
| 7 | ~~WASM compilación~~ | ✅ Resuelto | [`sandbox-code-runner.plan.md`](../features/sandbox-code-runner.plan.md) |
| 8 | ~~Mapeo pseudocódigo~~ | ✅ Resuelto | CDR-001 Engine Auto-Contenido |

---

## 9. Test Diagnóstico y Generación de Rutas de Aprendizaje

> **Propósito**: Definir la lógica y contenido del sistema de diagnóstico inicial y cómo este impacta la ruta recomendada.

- [ ] **Contenido del Diagnóstico**: ¿Cuántas preguntas conforman el test diagnóstico inicial? ¿Se cubrirán todos los tipos de algoritmos o solo conceptos generales de lógica?
- [ ] **Algoritmo de Enrutamiento**: ¿Qué reglas exactas determinan la secuencia de la `RutaAprendizaje` generada en base al puntaje del diagnóstico?
- [ ] **Tags en Algoritmos**: Definir un catálogo inicial de tags para los algoritmos (ej. `["divide-y-venceras", "recursividad", "in-place", "estable"]`).
- [ ] **Re-evaluación**: ¿Puede el usuario volver a tomar el test diagnóstico para reajustar su ruta de aprendizaje más adelante?

---

## 10. ~~Expansión de Catálogo y Banco de Ejercicios~~ ✅ RESUELTO

> **Propósito**: La app ya tiene una línea base funcional con algoritmos semilla. La siguiente fase requiere ampliar contenido sin romper la biblioteca, simulación, práctica y módulos offline.
>
> **Resuelto en**: `features/library-simulation.spec.md` §3.1-§3.3, `features/gamification-exercises.spec.md` §2-§3 y `plan-de-implementacion/04-contratos-api.md` §4-§5.
>
> **Resumen**: La fase expandida queda definida con 14 elementos activos incluyendo Segment Tree, ejercicios gamificados cerrados/semi-cerrados (`CompletarPseudocodigo`, `OrdenarBarras`, `PrediccionTexto`), visualización enriquecida desde DB (`visualizacion`, `marcadores`) y soporte explícito de árboles (`nodosArbol`).

- [x] **Catálogo Final de la Fase**: 14 elementos activos: Bubble Sort, Insertion Sort, Selection Sort, Linked List, Queue, Stack, Merge Sort, Quick Sort, Heap Sort, Binary Search, Linear Search, Deque, Priority Queue y Segment Tree.
- [x] **Cobertura por Categoría**: Se agrega `EstructurasArboles` para Segment Tree además de `Ordenamiento`, `Busqueda` y `EstructurasLineales`.
- [x] **Cobertura de Ejercicios**: Se priorizan ejercicios cerrados/semi-cerrados por algoritmo y dificultad (`Facil`, `Medio`, `Dificil`).
- [x] **Contenido de Ejercicios**: Incluye completar pseudocódigo, ordenar barras y predicción validable automáticamente.
- [x] **Algoritmos No Simulables**: Todo algoritmo visible en esta fase debe tener engine o visualización operacional; elementos futuros pueden usar `activo = false` / "Próximamente".
- [x] **Administración de Contenido**: Para esta fase basta con seed/migraciones idempotentes; CRUD admin de ejercicios queda como extensión posterior.
