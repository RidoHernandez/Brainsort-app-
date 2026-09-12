# 🧪 Documentación de Pruebas — BrainSort

> **Estándar de referencia**: IEEE 829-2008  
> **Proyecto**: BrainSort — Aplicación educativa para visualización de algoritmos y estructuras de datos  
> **Versión**: 1.0 — Mayo 2026

---

## Estructura del Directorio

```
pruebas/
├── README.md                              ← Este archivo
├── 3.1-Plan-de-Pruebas-BrainSort.docx     ← Plan de pruebas formal U4-EJ26
├── 3.2-Diseno-de-Casos-de-Prueba-BrainSort.docx ← Diseño de casos con formato de ficha
├── 3.2-Casos-de-Prueba-BrainSort.xlsx     ← Anexo tabular + equivalencia/límites
├── 3.3-Informe-de-Prueba-BrainSort.docx   ← Informe de ejecución con formato narrativo
├── 3.3-Informe-de-Prueba-BrainSort.xlsx   ← Anexo tabular de resultados
├── ejemplos/                              ← Templates de referencia (pre-llenados)
│   ├── 3.1-Plan-de-Pruebas-EJEMPLO.docx
│   ├── 3.2-Diseno-de-Casos-de-Prueba-EJEMPLO.docx
│   ├── 3.2-Casos-de-Prueba-EJEMPLO.xlsx
│   ├── 3.3-Informe-de-Prueba-EJEMPLO.docx
│   └── 3.3-Informe-de-Prueba-EJEMPLO.xlsx
└── scripts/                               ← Generadores auxiliares (Python)
    ├── gen_ejemplo_plan.py
    ├── gen_ejemplo_casos.py
    └── gen_ejemplo_informe.py
```

---

## 1. Plan de Pruebas de Software (3.1)

**Archivo**: `3.1-Plan-de-Pruebas-BrainSort.docx`

Define la estrategia global de pruebas para el proyecto BrainSort. Contenido:

| Sección | Descripción |
|---|---|
| 1. Introducción | Propósito, alcance y referencias del plan |
| 2. Elementos a probar | Módulos y componentes bajo prueba (Backend API + Frontend App) |
| 3. Elementos excluidos | Funcionalidades fuera de alcance en esta iteración |
| 4. Enfoque de pruebas | Niveles (unitarias, integración, sistema/E2E), herramientas, responsables |
| 5. Criterios de aceptación | Métricas de cobertura, casos críticos, defectos bloqueantes |
| 6. Ambiente de pruebas | SO, runtime, Docker local, PostgreSQL, Jest, Fastify inject, TypeScript |
| 7. Responsabilidades | Roles del equipo de QA |
| 8. Cronograma | Fases y fechas de ejecución |
| 9. Riesgos | Riesgos técnicos y mitigaciones |
| 10. Aprobaciones | Firmas de revisión y aprobación |

### Módulos bajo prueba

**Backend (`brainsort-api`):**
- `AuthModule` — Registro, login usuario/admin, refresh, credenciales inválidas
- `UsersModule` — Perfil, actualización
- `AlgorithmsModule` — Biblioteca, detalle, filtros por categoría/nombre/tags
- `SimulationsModule` — Generación de simulaciones, engines, validación de datos
- `ExercisesModule` — Evaluación de respuestas, puntos, feedback
- `ProgressModule` — Progreso, ranking, niveles
- `BadgesModule` — Insignias, verificación de criterios, caché
- `SyncModule` — Sincronización batch de progreso offline
- `DiagnosticsModule` — Test diagnóstico inicial
- `LearningPathModule` — Ruta de aprendizaje

**Frontend (`brainsort-app`):**
- `packages/core/engines/` — Bubble Sort, Selection Sort, Insertion Sort, Merge Sort
- `packages/core/math/` — Escalas, transiciones, coordenadas
- `packages/core/validators/` — Validación de datasets
- `src/hooks/` — Custom hooks (useAuth, useLibrary, useSimulation, etc.)
- `src/components/` — Componentes de UI (AlgorithmCard, ControlBar, etc.)
- `src/screens/` — Pantallas principales (Library, Simulation, Exercise, etc.)

---

## 2. Diseño de Casos de Prueba (3.2)

**Archivos**:
- `3.2-Diseno-de-Casos-de-Prueba-BrainSort.docx`
- `3.2-Casos-de-Prueba-BrainSort.xlsx`

El `.docx` sigue el formato de ficha del documento de referencia del docente: portada, leyenda, resumen de estados, módulos y una ficha por caso de prueba. El `.xlsx` se conserva como anexo tabular para trazabilidad, equivalencia y valores límite. Cada caso incluye:

| Campo | Descripción |
|---|---|
| **ID** | Identificador único (ej. `CP-AUTH-001`, `CP-SIM-003`) |
| **Módulo** | Módulo del sistema bajo prueba |
| **Tipo** | Unitaria / Integración / E2E / Rendimiento |
| **HU Relacionada** | Historia de usuario que cubre (ej. HU-01, HU-04) |
| **Descripción** | Descripción breve del caso |
| **Precondiciones** | Estado del sistema antes de la prueba |
| **Pasos** | Secuencia de acciones a ejecutar |
| **Datos de entrada** | Valores específicos de prueba |
| **Resultado esperado** | Comportamiento correcto del sistema |
| **Resultado real** | Resultado observado durante la ejecución |
| **Estado** | PASÓ / FALLÓ / BLOQUEADO / NO EJECUTADO |
| **Severidad** | Crítica / Alta / Media / Baja |
| **Archivo de código** | Archivo `.spec.ts` o `.e2e-spec.ts` correspondiente |

### Convención de IDs

| Prefijo | Módulo |
|---|---|
| `CP-AUTH-` | Autenticación |
| `CP-USR-` | Usuarios |
| `CP-ALG-` | Algoritmos / Biblioteca |
| `CP-SIM-` | Simulaciones |
| `CP-ENG-` | Engines de algoritmos |
| `CP-EJR-` | Ejercicios de predicción |
| `CP-PRG-` | Progreso |
| `CP-INS-` | Insignias |
| `CP-SYN-` | Sincronización |
| `CP-REN-` | Rendimiento |
| `CP-FE-` | Frontend (componentes/hooks) |

---

## 3. Informe de Prueba de Software (3.3)

**Archivos**:
- `3.3-Informe-de-Prueba-BrainSort.docx`
- `3.3-Informe-de-Prueba-BrainSort.xlsx`

El `.docx` sigue el formato de informe de resultados del documento de referencia del docente: resumen ejecutivo, métricas globales, resultados por módulo, defectos, riesgos residuales y decisión Go/No-Go. El `.xlsx` se conserva como anexo tabular de resultados. Contenido:

| Sección | Descripción |
|---|---|
| Resumen ejecutivo | Estadísticas globales: total ejecutados, pasados, fallados, bloqueados |
| Cobertura por módulo | Desglose de resultados por cada módulo del sistema |
| Defectos encontrados | Lista de defectos con severidad, estado y resolución |
| Cobertura de código | Porcentaje de cobertura (líneas, ramas) por Jest `--coverage` |
| Métricas de calidad | FPS de simulación, tiempo de carga, etc. |
| Conclusiones | Evaluación global y recomendaciones |

---

## 4. Código Fuente de Pruebas

El código de pruebas automatizadas se encuentra en los repositorios de código:

### Backend (`brainsort-api`)

| Ubicación | Tipo | Descripción |
|---|---|---|
| `src/auth/auth.service.spec.ts` | Unitaria | AuthService: register, login, refresh |
| `src/users/users.service.spec.ts` | Unitaria | UsersService: getProfile, updateProfile |
| `src/algorithms/algorithms.service.spec.ts` | Unitaria | AlgorithmsService: getLibrary, filtros |
| `src/simulations/simulations.service.spec.ts` | Unitaria | SimulationsService: createSimulation, validación |
| `src/exercises/exercises.service.spec.ts` | Unitaria | ExercisesService: evaluación, puntos, racha |
| `src/progress/progress.service.spec.ts` | Unitaria | ProgressService: progreso, ranking, niveles |
| `src/badges/badges.service.spec.ts` | Unitaria | BadgesService: insignias, checkAndAward, caché |
| `src/sync/sync.service.spec.ts` | Unitaria | SyncService: sincronización batch |
| `test/auth.e2e-spec.ts` | E2E | Flujo completo de autenticación |
| `test/algorithms.e2e-spec.ts` | E2E | Flujo completo de biblioteca |
| `test/simulations.e2e-spec.ts` | E2E | Flujo completo de simulaciones |
| `test/exercises.e2e-spec.ts` | E2E | Flujo: ejercicios → responder → puntos |
| `test/progress.e2e-spec.ts` | E2E | Flujo: progreso → ranking |
| `test/learning-support.e2e-spec.ts` | E2E | Flujo: diagnóstico → ruta, insignias y módulos offline |
| `test/app.e2e-spec.ts` | E2E | Health/ruta raíz |

### Frontend (`brainsort-app`)

| Ubicación | Tipo | Descripción |
|---|---|---|
| `packages/core/src/engines/__tests__/bubble-sort.test.ts` | Unitaria | Engine Bubble Sort: pasos correctos, edge cases |
| `packages/core/src/engines/__tests__/selection-sort.test.ts` | Unitaria | Engine Selection Sort |
| `packages/core/src/engines/__tests__/insertion-sort.test.ts` | Unitaria | Engine Insertion Sort |
| `packages/core/src/engines/__tests__/merge-sort.test.ts` | Unitaria | Engine Merge Sort |
| `packages/core/src/engines/__tests__/linear-structures.test.ts` | Unitaria | Engines Stack, Queue y Linked List |
| `packages/core/src/math/__tests__/math.test.ts` | Unitaria | Escalas, coordenadas y transiciones |
| `packages/core/src/validators/__tests__/dataset.test.ts` | Unitaria | Validación de datasets |
| `src/services/__tests__/contract-shapes.test.ts` | Unitaria | Contratos frontend para ranking, ejercicios, offline y sync |
| `src/services/__tests__/api-services.test.ts` | Unitaria | Endpoints y payloads de servicios frontend |
| `src/utils/__tests__/validators.test.ts` | Unitaria | Validadores UI de auth, dataset y velocidad |
| `src/utils/__tests__/formatters.test.ts` | Unitaria | Formateadores de puntos, duración, velocidad y texto |
| `src/utils/__tests__/xp.utils.test.ts` | Unitaria | Cálculo de XP, niveles, progreso y tiers |
| `e2e/app-flows.spec.ts` | E2E Web | Login, ruta de aprendizaje y perfil con Playwright sobre Expo Web |

---

## 5. Trazabilidad HU ↔ Casos de Prueba

| Historia de Usuario | Casos de Prueba Asociados | Tipo |
|---|---|---|
| **HU-01**: Navegar Biblioteca | CP-ALG-001 a CP-ALG-005 | Unitaria + E2E |
| **HU-02**: Seleccionar Algoritmo | CP-ALG-006 a CP-ALG-007 | Unitaria + E2E |
| **HU-03**: Datos Predeterminados/Personalizados | CP-SIM-001 a CP-SIM-005, CP-VAL-001 a CP-VAL-002 | Unitaria + E2E |
| **HU-04**: Controlar Animación | CP-ENG-001 a CP-ENG-004, CP-MATH-001 | Unitaria |
| **Autenticación** | CP-AUTH-001 a CP-AUTH-005, CP-LRN-004 | Unitaria + E2E |
| **Ejercicios de Predicción** | CP-EJR-001 a CP-EJR-005 | Unitaria + E2E |
| **Progreso y Gamificación** | CP-PRG-001 a CP-PRG-003, CP-INS-001 a CP-INS-002, CP-LRN-002 | Unitaria + E2E |
| **Diagnóstico y Ruta** | CP-DIAG-001 a CP-DIAG-002, CP-RUTA-001, CP-LRN-001 | Unitaria + E2E |
| **Offline y Sync** | CP-OFF-001 a CP-OFF-002, CP-SYNC-001, CP-LRN-003 | Unitaria + E2E |

---

## 6. Herramientas de Prueba

| Herramienta | Versión | Uso |
|---|---|---|
| **Jest** | 29.x / 30.x según repo | Framework de pruebas unitarias y E2E |
| **@nestjs/testing** | 10.x | Testing module para NestJS (inyección de dependencias mock) |
| **TypeScript typecheck** | 5.x | Validación estática del frontend |
| **Fastify inject** | — | Pruebas E2E HTTP sin servidor real |
| **bcrypt (mock)** | — | Mock de hashing para tests unitarios |
| **Expo Web + navegador** | — | Validación manual de sistema local |

---

## 7. Generación de Documentos

Los scripts en `scripts/` permiten regenerar los documentos `.docx` y `.xlsx` con datos actualizados:

```bash
# Requiere: pip install python-docx openpyxl
cd pruebas/scripts

python generate_brainsort_testing_docs.py  # Genera los 3 entregables reales y las copias EJEMPLO
python gen_ejemplo_plan.py                 # Regenera solo 3.1
python gen_ejemplo_casos.py                # Regenera solo 3.2
python gen_ejemplo_informe.py              # Regenera solo 3.3
```

> **Nota**: Los documentos reales se generan directamente en `pruebas/`. Las copias `EJEMPLO` quedan en `pruebas/ejemplos/` solo como referencia.
