# Testing & Quality Assurance Specification

> **Fuente de verdad**: Entregable U4-EJ26, IEEE 829-2008, `constitution.md`, `library-simulation.spec.md`, `architecture-auth.spec.md`

## 1. Context & Motivation

BrainSort requiere un proceso de pruebas formal que valide la correcta implementación de sus funcionalidades principales: autenticación, biblioteca de algoritmos, simulaciones visuales, ejercicios de predicción, gamificación e insignias. Las pruebas automatizadas garantizan la estabilidad del software durante su evolución y proporcionan evidencia verificable de calidad.

## 2. Alcance de Pruebas

### In-Scope

**Backend (`brainsort-api`) — módulos cubiertos por la línea base U4-EJ26:**
- `AuthModule`: Registro, login dual (usuario/admin), refresh tokens, manejo de credenciales invalidas
- `UsersModule`: Consulta y actualización de perfil
- `AlgorithmsModule`: Biblioteca categorizada, detalle de algoritmo, filtros por categoría/nombre/tags
- `SimulationsModule`: Generación de simulaciones, validación de datos, engines de ordenamiento
- `ExercisesModule`: Evaluación de respuestas, cálculo de puntos, feedback, rachas
- `ProgressModule`: Progreso del usuario, niveles, ranking
- `BadgesModule`: Sistema de insignias con criterios de desbloqueo y caché
- `SyncModule`: Sincronización batch de progreso offline
- `OfflineModule`: Descarga de módulos para modo offline
- `DiagnosticsModule`: Test diagnóstico inicial
- `LearningPathModule`: Ruta de aprendizaje personalizada
- `PrismaModule`: Capa de acceso a datos
- `CommonModule`: Filtros de excepción, interceptores, pipes de validación

**Frontend (`brainsort-app`) — lógica pura automatizada:**
- `packages/core/engines/`: Engines de Bubble Sort, Selection Sort, Insertion Sort, Merge Sort
- `packages/core/validators/`: Validación de datasets de entrada
- `packages/core/math/`: Cálculos de escalas y coordenadas SVG

### Out-of-Scope
- Pruebas de rendimiento en dispositivos físicos (requiere lab)
- Pruebas de seguridad/penetración (requiere herramientas especializadas)
- Pruebas de usabilidad con usuarios reales (requiere participantes)

## 3. Estrategia de Pruebas

### 3.1 Niveles de Prueba

| Nivel | Qué se prueba | Herramienta | Ubicación |
|---|---|---|---|
| **Unitarias** | Services individuales con mocks de Prisma y dependencias | Jest + @nestjs/testing | `src/**/*.service.spec.ts` |
| **Integración** | Flujos HTTP completos endpoint-a-endpoint | Fastify inject + Jest | `test/*.e2e-spec.ts` |
| **Sistema** | Ejecución local app + API, Swagger y Expo Web | Playwright / navegador | `brainsort-app/e2e/app-flows.spec.ts` + informe |
| **Rendimiento** | FPS durante animación, tiempo de carga | Validación manual exploratoria | Mejora futura si se formaliza medición |

### 3.2 Enfoque por Módulo

| Módulo | Unitarias | E2E | Prioridad |
|---|---|---|---|
| Auth | ✅ 14 tests | ✅ 9 tests | Crítica |
| Users | ✅ 8 tests | — | Alta |
| Algorithms | ✅ 9 tests | ✅ 6 tests | Crítica |
| Simulations | ✅ 14 tests | ✅ 5 tests | Crítica |
| Exercises | ✅ 15 tests | ✅ 4 tests | Crítica |
| Progress | ✅ 6 tests | ✅ 4 tests en flujo progreso/sync | Alta |
| Badges | ✅ 8 tests | ✅ Cubierto en `learning-support.e2e-spec.ts` | Alta |
| Sync | ✅ 8 tests | — | Media |
| Offline | ✅ 4 tests | ✅ Cubierto en `learning-support.e2e-spec.ts` | Media |
| Diagnostics | ✅ 5 tests | ✅ Cubierto en `learning-support.e2e-spec.ts` | Media |
| Learning Path | ✅ 3 tests | ✅ Cubierto en `learning-support.e2e-spec.ts` | Media |
| Engines (FE) | ✅ 24 tests (4 engines sort + estructuras lineales) | — | Crítica |
| Math (FE) | ✅ 4 tests | — | Alta |
| Validators (FE) | ✅ 15 tests (core + UI) | — | Alta |
| Formatters/XP (FE) | ✅ 12 tests | — | Media |
| Service contracts/API services (FE) | ✅ 11 tests | — | Alta |
| Login/Ruta/Perfil UI (FE) | — | ✅ 3 tests Playwright | Crítica |

## 4. Criterios de Aceptación

| Criterio | Métrica | Umbral |
|---|---|---|
| Cobertura de líneas (services) | Jest `--coverage` | ≥ 80% |
| Cobertura de líneas (controllers) | Jest `--coverage` | ≥ 70% |
| Casos críticos | Tests marcados como Crítica | 100% PASADOS |
| Total de tests | 196 pruebas automatizadas ejecutadas | 100% pasando |
| Defectos bloqueantes | Severidad Crítica abiertos | 0 |
| FPS simulación | Bubble Sort 15 elem, 2.0x | ≥ 24 FPS |
| Tiempo de carga | Desde tap hasta barras visibles | < 3 segundos |

### Criterios de Rechazo
- Más de 1 defecto Crítico sin resolver
- Build roto (`npm run build` o `tsc --noEmit` falla)
- FPS < 18 en cualquier algoritmo con 15 elementos
- Tests E2E de autenticación fallando

## 5. Ambiente de Pruebas

| Componente | Especificación |
|---|---|
| SO Desarrollo | Windows 11 |
| Runtime | Node.js v20.x LTS, npm v10.x |
| Backend | NestJS 10.x, Fastify 10.x, Prisma 5.x |
| Frontend | Expo SDK 51, React Native 0.74.x, React 18.x |
| Base de datos | PostgreSQL v15+ (Docker local) |
| IDE | VS Code con ESLint + Prettier |
| Framework de test | Jest 29.x/30.x, @nestjs/testing 10.x |

### Datos de Prueba
- Arreglo base: `[5, 2, 8, 1, 9, 3, 7, 4]`
- Arreglo mínimo: `[3, 1]` (2 elementos)
- Arreglo máximo: `[15,14,13,...,2,1]` (15 elementos, orden inverso)
- Arreglo ya ordenado: `[1, 2, 3, 4, 5, 6, 7, 8]`
- Arreglo con duplicados: `[5, 3, 5, 1, 3, 8, 1]`
- Email válido: `test@example.com`
- Contraseña válida: `Password123!` (≥8 chars)
- Contraseña inválida: `123` (< 8 chars)

## 6. Trazabilidad con Historias de Usuario

| HU | Funcionalidad | Módulos Probados | IDs de Caso |
|---|---|---|---|
| HU-01 | Navegar Biblioteca | AlgorithmsService, LibraryScreen | CP-ALG-001 a CP-ALG-005 |
| HU-02 | Seleccionar Algoritmo | AlgorithmsService, AlgorithmDetailScreen | CP-ALG-006 a CP-ALG-007 |
| HU-03 | Datos Predeterminados/Personalizados | SimulationsService, validators | CP-SIM-001 a CP-SIM-005, CP-VAL-* |
| HU-04 | Controlar Animación | SimulationsService, Engines, Core Math | CP-ENG-*, CP-MATH-001 |
| — | Autenticación | AuthService, guards JWT | CP-AUTH-001 a CP-AUTH-005, CP-LRN-004 |
| — | Ejercicios | ExercisesService | CP-EJR-001 a CP-EJR-005 |
| — | Gamificación | ProgressService, BadgesService | CP-PRG-*, CP-INS-*, CP-LRN-002 |
| — | Diagnóstico/Ruta/Offline | DiagnosticsService, LearningPathService, OfflineService | CP-DIAG-*, CP-RUTA-*, CP-OFF-*, CP-LRN-* |

## 7. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Engine genera bucle infinito con datos corruptos | Media | Crítico | Timeout en registry.ts (max 10s) + test de timeout |
| FPS < 24 en Insertion Sort con 15 elementos | Media | Alto | Validar manualmente en Expo Web y optimizar re-renders si se detecta degradación |
| PseudocodePanel se desfasa del paso actual | Baja | Alto | Verificar lineaPseudocodigo en cada step del engine |
| Tests E2E fallan por estado residual en DB | Media | Medio | Usar emails únicos con `Date.now()`, cleanup en afterAll |
| Mocks de Prisma no reflejan schema real | Baja | Alto | Validar mocks contra schema.prisma en code review |

## 8. Edge Cases & Error Handling

- **Login con email inexistente**: Mensaje genérico "Invalid credentials" (no revelar si falla email o password)
- **Registro con email duplicado**: `409 Conflict`
- **Simulación con datos nulos**: `400 BadRequest` con mensaje descriptivo
- **Tamaño inconsistente con array**: `400 BadRequest`
- **Ejercicio inexistente**: `404 Not Found`
- **Refresh token expirado**: `401 Unauthorized`, cliente fuerza re-login
- **Intentos fallidos de login**: respuesta genérica `401 Unauthorized` sin revelar si falló el correo o la contraseña. El bloqueo temporal 429 queda documentado como mejora de seguridad futura si se incorpora un rate-limit guard.

---

*Nota: Este documento define "Qué" se prueba. Para detalles de implementación de las pruebas, ver las tareas T-QA-* en `task/task_breakdown.md`.*
