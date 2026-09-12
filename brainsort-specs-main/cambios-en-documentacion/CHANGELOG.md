# 📝 Registro de Cambios en Documentación

> **Propósito**: Este archivo documenta los cambios **significativos** que se han hecho en las SPECS y que **difieren o extienden** la documentación original (`.docx`, `.uml`, `.pdf`). Cada cambio incluye la justificación técnica y la referencia al documento original afectado.

---

## CDR-011: Simulación Legible y Controles de Datos Sincronizados

**Fecha**: 2026-05-19
**Documentación original afectada**: `features/library-simulation.spec.md`, `plan-de-implementacion/02-frontend-app.md`, `plan-de-implementacion/04-contratos-api.md`

### ¿Qué cambió?
- Merge Sort ahora documenta el paso `Merge` con pseudocódigo extendido: copias `izq/der`, índices `i/j/k`, comparación, copia desde izquierda/derecha y sobrantes.
- `PseudocodePanel` debe mantener visible la línea activa mediante auto-scroll al índice real de la línea resaltada.
- El input de datos personalizados debe reflejar siempre el dataset activo y el botón de regeneración se integra como dado dentro del campo.

### ¿Por qué?
Las animaciones recursivas y de combinación necesitaban más contexto educativo. Además, el usuario debe ver siempre qué datos está simulando y poder regenerarlos sin un botón ancho adicional que distraiga de la simulación.

---

## CDR-001: ~~Engine Auto-Contenido (Pseudocódigo migrado de DB a Engine)~~ ⛔ REVERTIDO por CDR-009

**Fecha**: 2026-04-16  
**Estado**: ⛔ **OBSOLETO** — Revertido por [CDR-009](#cdr-009-pseudocódigo-migrado-de-engine-a-base-de-datos-json-array) el 2026-04-23  
**Documentación original afectada**: `BrainSort-Modelo_del_Dominio.docx` — Entidad `Algoritmo`

> ⚠️ **Este CDR fue revertido**. El pseudocódigo volvió a la base de datos (formato JSON Array) en CDR-009 para permitir edición hot sin redeploy del backend. Se preserva este registro como documentación histórica del proceso de decisión.

### Contexto histórico (obsoleto)
El 2026-04-16 se decidió mover el pseudocódigo de la DB a los archivos engine para evitar desincronización entre seed y lógica. Esta decisión priorizó la **consistencia técnica** sobre la **flexibilidad operativa**.

### Por qué se revirtió
Requerir **redeploy del backend** para cualquier corrección de pseudocódigo no es práctico para un equipo pequeño que necesita iterar rápidamente sobre contenido educativo. Ver CDR-009 para la solución actual.

### Lección aprendida
La decisión técnica "ideal" (engine auto-contenido) no siempre es la "correcta" según las restricciones del equipo y el contexto de negocio.

---

## CDR-002: ESLint 9.x → 8.57.0

**Fecha**: 2026-04-16
**Documentación original afectada**: `BrainSort-Documento_Arquitectura_Software.docx` (dice "ESLint & Prettier" sin versión)
**Archivos SPECS modificados**: `01-backend-api.md`, `02-frontend-app.md`, `task_breakdown.md`

### ¿Qué cambió?
ESLint `^9.x` rebajado a `^8.57.0` en ambos repositorios.

### ¿Por qué?
ESLint 9 usa Flat Config de forma mandatoria. `eslint-config-expo` (requerido por el stack documentado) usa configuraciones legacy incompatibles. La doc original no especifica versión, por lo que `^8.57.0` (compatible nativo con Expo) es la elección correcta.

---

## CDR-003: Criterios de Insignias — Evaluación Hardcoded

**Fecha**: 2026-04-16
**Documentación original afectada**: `BrainSort-Modelo_del_Dominio.docx` — Entidad `Insignia.criterioDesbloqueo`
**Archivos SPECS modificados**: `features/gamification-exercises.plan.md` §6

### ¿Qué cambió?
Se definió formalmente **cómo** se evalúan los criterios de desbloqueo de insignias.

### ¿Por qué?
El modelo original define `criterioDesbloqueo: String` pero no especifica el mecanismo de evaluación. Se adoptó un enfoque hardcoded (map de funciones booleanas en `BadgesService`) con triggers event-driven y caché en memoria.

### Impacto
Ningún cambio en el esquema de datos. Solo se documentó la lógica de evaluación que era implícita.

---

## CDR-004: Módulos Offline — JSON Directo (Sin Bucket Externo)

**Fecha**: 2026-04-16
**Documentación original afectada**: `BrainSort-Documento_Arquitectura_Software.docx` §Offline
**Archivos SPECS modificados**:
- `plan-de-implementacion/04-contratos-api.md` — §8 Offline Module (respuestas reescritas)
- `task/tareas-faltantes.md` — Punto 6 resuelto

### ¿Qué cambió?
El endpoint `GET /api/modules/offline/:id/download` ya **no** retorna URLs a un bucket externo (`brainsort-assets.example.com`). Ahora retorna el contenido completo del módulo como JSON directamente.

### ¿Por qué?
1. `brainsort-assets.example.com` era un **placeholder** — no existía ningún bucket real.
2. Con el patrón Engine Auto-Contenido ~~(CDR-001)~~ **CDR-009**, el backend ya tiene todo lo que el módulo offline necesita: metadatos (DB) + pseudocódigo (DB) + ejercicios (DB).
3. Cada módulo pesa ~10-15 KB en JSON — no justifica un bucket externo.
4. Presupuesto de almacenamiento: $0 (se sirve desde Railway).

### ¿Cuándo SÍ se necesitaría un bucket externo?
Solo si se implementan los módulos WASM opcionales (20-50 MB, solo Android), que están en el punto 7 como prioridad 🟢 Baja.

---

## CDR-006: Enforcement Local de Ramas y Format con Husky

**Fecha**: 2026-04-19
**Documentación original afectada**: N/A (Estrategia DevOps implícita)
**Archivos SPECS modificados**: `plan-de-implementacion/05-despliegue-devops.md`

### ¿Qué cambió?
Se agregó la dependencia `husky` en la configuración de `devDependencies` de ambos repositorios (`brainsort-api`, `brainsort-app`) y se estructuró un script de Bash para el hook `pre-commit`.

### ¿Por qué?
El plan DevOps original definía una política estricta de nombramiento de Git (`feature/<nombre>`, `dev`, `main`) y ejecución obligatoria del linter (ESLint/Prettier). Sin embargo, esto solo se comprobaba de forma tardía en el pipeline remoto de *Integración Continua (CI)* de GitHub Actions. Esto generaba un mal Developer Experience (DX) ya que el desarrollador descubría sus violaciones del linter después de empujar el PR. 

Al instalar un *hook* local (*Shift-Left Testing*), la validación a la Expresión Regular de DevOps y el chequeo estático del linter suceden en la computadora del desarrollador un segundo antes de poder crear el *commit*, evitando saturar la nube con PRs defectuosos.

### Impacto
- **Nuevo Bloqueo**: Imposibilidad de guardar código (`git commit`) si la rama tiene nombres como `task/...`, `frontend/...` o `copilot/...`.
- **Nuevo Bloqueo**: Imposibilidad de guardar código si `npm run lint` halla errores estáticos o de formato en `brainsort-api` y `brainsort-app`.

---

## CDR-007: Corrección de Trazabilidad HU-01 (Evidencia vs Estado)

**Fecha**: 2026-04-19
**Documentación original afectada**: `task/task_roadmap_HU01.md`, `task/task_breakdown.md`
**Archivos SPECS modificados**:
- `task/task_roadmap_HU01.md`
- `task/task_breakdown.md`

### ¿Qué cambió?
Se corrigió el estado de tareas marcadas como completadas para reflejar únicamente trabajo con evidencia de ejecución en entorno:
- `Fase 4`, punto `Verificar que los datos queden disponibles para la biblioteca` volvió a estado pendiente.
- `T-BE-022` (`npx prisma migrate dev --name init`) volvió a estado pendiente.

### ¿Por qué?
Durante la implementación se completaron cambios de código (schema, seed y migración SQL), pero no se pudo ejecutar la verificación end-to-end de datos en biblioteca ni correr la migración inicial con base PostgreSQL activa en el entorno local de esta sesión.

### Impacto
Mejora la confiabilidad del tracking del proyecto: el tablero refleja avance real validado y evita falsos positivos de cierre de fase.

---

## CDR-009: Pseudocódigo Migrado de Engine a Base de Datos (JSON Array)

**Fecha**: 2026-04-23
**Documentación original afectada**: `BrainSort-Modelo_del_Dominio.docx` — Entidad `Algoritmo.pseudocódigo`
**Archivos SPECS modificados**:
- `plan-de-implementacion/03-base-de-datos.md` — Modelo Algoritmo (campo pseudocodigo añadido como Json)
- `plan-de-implementacion/04-contratos-api.md` — CO2 y CO3 obtienen pseudocódigo de DB

### ¿Qué cambió?
El campo `pseudocódigo` fue **reintroducido a la base de datos** en formato JSON Array, revirtiendo parcialmente CDR-001.

Formato almacenado:
```json
[
  {"numero": 1, "codigo": "Para i = 0 hasta n-1"},
  {"numero": 2, "codigo": "  Para j = 0 hasta n-i-1"},
  {"numero": 3, "codigo": "    Si array[j] > array[j+1]"},
  {"numero": 4, "codigo": "      Intercambiar array[j] y array[j+1]"}
]
```

### ¿Por qué?
CDR-001 movió el pseudocódigo a los archivos engine para evitar desincronización entre seed y lógica. Sin embargo, esto requería **redeploy del backend** para cualquier corrección de pseudocódigo, lo cual no es práctico para un equipo pequeño que necesita iterar rápidamente sobre contenido educativo.

La nueva solución permite:
1. **Edición hot**: El administrador puede corregir pseudocódigo sin redeploy
2. **Mantenibilidad**: Cada engine solo mantiene el mapeo de pasos a números de línea (estable)
3. **Formato flexible**: JSON Array permite agregar metadatos futuros (ej: indentación, color)

### Impacto en el Modelo del Dominio
| Campo | Estado | Justificación |
|---|---|---|
| `Algoritmo.pseudocodigo` | ✅ **Reintroducido a la DB** como `Json?` | Permite edición sin redeploy del backend |

### Cambios en los Engines
- El campo `pseudocode` fue removido de `AlgorithmDefinition` en `engine.interface.ts`
- Los engines (`bubble-sort`, `selection-sort`, `insertion-sort`) ya no incluyen el texto del pseudocódigo
- El mapeo de `lineaPseudocodigo` en cada paso se mantiene (conecta paso → número de línea)

### Cambios en los Servicios
- `simulations.service.ts` — `createSimulation()` ahora lee `algoritmo.pseudocodigo` de la DB
- `algorithms.service.ts` — `getAlgorithm()` ahora lee `algoritmo.pseudocodigo` de la DB

### Post-Condición
Ejecutar `npx prisma migrate dev --name add_pseudocodigo` y `npx prisma generate` para aplicar el cambio al schema.

---

## CDR-008: Corrección del Modelo del Dominio — Campo `dificultad` en Algoritmo

**Fecha**: 2026-04-23
**Documentación original afectada**: `BrainSort-Modelo_del_Dominio.docx`, `BrainSort-Historias_de_Usuario.docx` (HU-01)
**Archivos SPECS modificados**:
- `plan-de-implementacion/03-base-de-datos.md` — Modelo Algoritmo (dificultad añadido)
- `plan-de-implementacion/01-backend-api.md` — DTOs de algoritmo (dificultad añadido)
- `plan-de-implementacion/04-contratos-api.md` — Respuestas CO1/CO2 incluyen dificultad

### ¿Qué cambió?
El campo `dificultad` fue **añadido al modelo `Algoritmo`** en la base de datos. Este campo había sido omitido inicialmente en la traducción a SPECS, pero existe en la documentación original del modelo del dominio y es requerido por la HU-01 para la visualización de tarjetas en la biblioteca.

### ¿Por qué?
La Historia de Usuario HU-01 especifica que cada tarjeta de algoritmo en la biblioteca debe mostrar un **nivel de dificultad visual** (colores o estrellas) para que el usuario pueda decidir qué estudiar. Este atributo existe explícitamente en el modelo conceptual del dominio original.

### Impacto en el Modelo del Dominio
| Campo | Estado | Justificación |
|---|---|---|
| `Algoritmo.dificultad` | ✅ **Añadido a la DB** | Requerido por HU-01 para nivel visual en tarjetas (Facil, Medio, Dificil) |

### Diferencia con EjercicioPrediccion.dificultad
Es importante notar que **ambos** modelos tienen un campo `dificultad`:
- `Algoritmo.dificultad`: Describe la dificultad general del algoritmo (para tarjetas de biblioteca, HU-01).
- `EjercicioPrediccion.dificultad`: Describe la dificultad específica del ejercicio (para cálculo de puntos, gamificación).

---

## CDR-010: Visualización Enriquecida y Ejercicios Gamificados de Catálogo Expandido

**Fecha**: 2026-05-19
**Documentación original afectada**: `BrainSort-Modelo_del_Dominio.docx`, `BrainSort-Historias_de_Usuario.docx` HU-04/HU-07
**Archivos SPECS modificados**:
- `features/library-simulation.spec.md`
- `features/gamification-exercises.spec.md`
- `plan-de-implementacion/03-base-de-datos.md`
- `plan-de-implementacion/04-contratos-api.md`
- `task/task_breakdown.md`
- `task/tareas-faltantes.md`

### ¿Qué cambió?
Se formalizó la expansión de catálogo a 14 elementos activos, agregando Segment Tree como estructura de árbol y enriqueciendo la simulación con datos visuales provenientes de DB.

Nuevos campos/contratos:
- `Algoritmo.visualizacion Json?`: roles, colores y etiquetas por línea de pseudocódigo.
- `SimulationStep.marcadores[]`: etiquetas visuales como `j`, `pivot`, `mid`, `espera`.
- `SimulationStep.nodosArbol[]`: nodos explícitos para visualizaciones de árboles.
- `EjercicioPrediccion.tipo`: `PrediccionTexto`, `CompletarPseudocodigo`, `OrdenarBarras`.
- `EjercicioPrediccion.opciones` y `contenido`: datos estructurados para ejercicios gamificados.

### ¿Por qué?
Las simulaciones necesitaban mostrar variables sobre barras y distinguir valores en espera durante recursión sin hardcodear lógica pedagógica en el frontend. Además, las prácticas debían parecerse más a ejercicios gamificados tipo Duolingo y evitar preguntas 100% abiertas difíciles de evaluar automáticamente.

### Impacto
- El frontend consume `marcadores` para pintar etiquetas y colores.
- Segment Tree usa `nodosArbol` para no dibujar árboles desde arreglos dispersos.
- La pantalla de ejercicios no muestra la sección de simulación del algoritmo.
- El seed debe evitar ejercicios abiertos sin `opciones` o `contenido` verificable.
