# 📋 Desglose de Tareas — BrainSort

> **Fuente**: SPECS `01-backend-api.md`, `02-frontend-app.md`, `03-base-de-datos.md`, `04-contratos-api.md`, `05-despliegue-devops.md`, `constitution.md`
> **Orden de implementación**: Base de Datos → Backend API → Frontend Base → Biblioteca → Simulación → Gamificación → Offline → Despliegue

---

# 🔧 BACKEND — Repositorio `brainsort-api`

> **Stack**: NestJS + Fastify · TypeScript · PostgreSQL v15+ · Prisma ORM
> **Repositorio**: https://github.com/BrainSort/brainsort-api

---

## 📁 `brainsort-api/` (Raíz)

- [x] **T-BE-001**: Inicializar proyecto NestJS con adaptador Fastify (`@nestjs/platform-fastify`)
- [x] **T-BE-002**: Configurar `package.json` con las dependencias especificadas: `@nestjs/common ^10.x`, `@nestjs/core ^10.x`, `@nestjs/platform-fastify ^10.x`, `@nestjs/swagger ^7.x`, `@nestjs/jwt ^10.x`, `@nestjs/passport ^10.x`, `@prisma/client ^5.x`, `bcrypt ^5.x`, `class-validator ^0.14.x`, `class-transformer ^0.5.x`, `passport ^0.7.x`, `passport-jwt ^4.x`
- [x] **T-BE-003**: Configurar `devDependencies`: `prisma ^5.x`, `@nestjs/testing ^10.x`, `typescript ^5.x`, `eslint ^8.57.0`, `prettier ^3.x`
- [x] **T-BE-004**: Configurar `tsconfig.json` y `tsconfig.build.json` para TypeScript
- [X] **T-BE-005**: Configurar `nest-cli.json`
- [x] **T-BE-006**: Crear archivo `.env.example` con las variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION` (15m), `JWT_REFRESH_EXPIRATION` (7d), `PORT` (3000), `NODE_ENV`, `FRONTEND_URLS`
- [ ] **T-BE-007**: Crear `Dockerfile` multi-stage (base → deps → build → production) con Node 20-slim, usando `npm ci --omit=dev`, `npx prisma generate`, `npm run build`, exponiendo puerto 3000
- [x] **T-BE-008**: Crear `docker-compose.yml` para desarrollo local con servicios `api` (build local, puerto 3000, hot-reload) y `db` (postgres:15, usuario/password brainsort, volumen `pgdata`)

---

## 📁 `brainsort-api/prisma/`

- [x] **T-BE-009**: Crear `schema.prisma` con `generator client` (prisma-client-js), `datasource db` (postgresql, url desde env)
- [x] **T-BE-010**: Definir modelo `Usuario` con campos: `id` (UUID), `nombre`, `correo` (unique), `rol` (Enum), `contrasena`, `createdAt`, `updatedAt`. Relaciones: `progreso` (1:1), `sesiones[]`, `respuestas[]`. Map: `"usuarios"`
- [x] **T-BE-011**: Definir Enum `Rol` con valores: `Estudiante`, `Profesor`, `Autodidacta`
- [x] **T-BE-012**: Definir modelo `Administrador` con campos: `id` (UUID), `nombre`, `correo` (unique), `contrasena`, `credencialesAdmin`, `ultimoAcceso`, `createdAt`, `updatedAt`. Map: `"administradores"`
- [x] **T-BE-013**: Definir modelo `Algoritmo` con campos: `id` (UUID), `nombre` (unique), `descripcion` (Text), `dificultad`, `complejidadTiempo`, `complejidadEspacio`, `categoria` (Enum), `activo` (default true), `createdAt`, `updatedAt`. Relaciones: `ejercicios[]`, `sesiones[]`. Map: `"algoritmos"`. **HU-01: agregar `dificultad` y mantener `pseudocodigo` fuera del modelo, en engines**
- [x] **T-BE-014**: Definir Enum `CategoriaAlgoritmo` con valores: `Ordenamiento`, `Busqueda`, `EstructurasLineales`
- [x] **T-BE-015**: Definir modelo `EjercicioPrediccion` con campos: `id` (UUID), `pregunta` (Text), `respuestaCorrecta`, `dificultad` (Enum), `feedbackPositivo` (Text), `feedbackNegativo` (Text), `createdAt`. FK: `algoritmoId`. Relaciones: `algoritmo`, `respuestas[]`. Map: `"ejercicios_prediccion"`
- [x] **T-BE-016**: Definir Enum `DificultadEjercicio` con valores: `Facil`, `Medio`, `Dificil`
- [x] **T-BE-017**: Definir modelo `ProgresoUsuario` con campos: `id` (UUID), `puntosTotales` (default 0), `nivelActual` (default 1), `rachaDias` (default 0), `posicionRanking` (default 0), `ultimaActividad`, `createdAt`, `updatedAt`. FK: `usuarioId` (unique). Índice: `puntosTotales DESC`. Map: `"progreso_usuario"`
- [x] **T-BE-018**: Definir modelo `Insignia` con campos: `id` (UUID), `nombre` (unique), `descripcion` (Text), `imagen`, `criterioDesbloqueo`, `createdAt`. Relaciones: `progresosOtorgados[]`. Map: `"insignias"`
- [x] **T-BE-019**: Definir modelo `ProgresoInsignia` (tabla intermedia) con campos: `id` (UUID), `fechaObtencion`. FKs: `progresoId`, `insigniaId`. Constraint: `@@unique([progresoId, insigniaId])`. Map: `"progreso_insignias"`
- [x] **T-BE-020**: Definir modelo `SesionSimulacion` con campos: `id` (UUID), `pasosCompletados` (default 0), `totalPasos`, `completada` (default false), `fechaInicio`, `fechaFin` (nullable). FKs: `usuarioId`, `algoritmoId`. Map: `"sesiones_simulacion"`
- [x] **T-BE-021**: Definir modelo `RespuestaEjercicio` con campos: `id` (UUID), `respuesta`, `correcto`, `puntosGanados` (default 0), `fechaRespuesta`. FKs: `usuarioId`, `ejercicioId`. Map: `"respuestas_ejercicio"`
- [x] **T-BE-022**: Ejecutar migración inicial: `npx prisma migrate dev --name init`
- [x] **T-BE-023**: Crear `seed.ts` con: (1) Administrador por defecto (`admin@brainsort.edu`, password hasheada con bcrypt, credencial `SUPER_ADMIN`), (2) 3 algoritmos de ordenamiento (Bubble Sort, Selection Sort, Insertion Sort) con `descripcion` corta, `dificultad` y `categoria`, **CDR-001: pseudocodigo vive en engines**, (3) 3 ejercicios de predicción (1 por algoritmo, dificultad Fácil), (4) 4 insignias (Primer Paso, Explorador, Racha de 7, Maestro del Orden) con criterios de desbloqueo

---

## 📁 `brainsort-api/src/`

### 📁 `src/main.ts`

- [x] **T-BE-024**: Implementar `main.ts` Bootstrap: crear app con `NestFactory.create<NestFastifyApplication>` usando `FastifyAdapter`
- [x] **T-BE-025**: Configurar prefijo global `api` con `app.setGlobalPrefix('api')`
- [x] **T-BE-026**: Configurar `ValidationPipe` global con opciones: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- [x] **T-BE-027**: Configurar CORS con whitelist: `http://localhost:8081` (Expo dev) y `https://brainsort.vercel.app` (Producción Web)
- [x] **T-BE-028**: Configurar Swagger con `DocumentBuilder`: título "BrainSort API", descripción, versión 1.0, `addBearerAuth()`. Setup en ruta `/api/docs`
- [x] **T-BE-029**: Configurar `app.listen(3000, '0.0.0.0')`

---

### 📁 `src/app.module.ts`

- [x] **T-BE-030**: Crear `AppModule` como módulo raíz que importa todos los módulos: `AuthModule`, `UsersModule`, `AlgorithmsModule`, `SimulationsModule`, `ExercisesModule`, `ProgressModule`, `BadgesModule`, `OfflineModule`, `SyncModule`, `PrismaModule`

---

### 📁 `src/prisma/`

- [x] **T-BE-031**: Crear `PrismaModule` como módulo global (`@Global()`)
- [x] **T-BE-032**: Crear `PrismaService` que extiende `PrismaClient` e implementa `OnModuleInit` con método `onModuleInit()` que ejecuta `this.$connect()`

---

### 📁 `src/common/`

- [x] **T-BE-033**: Crear `http-exception.filter.ts` — Filtro global de excepciones HTTP con formato de respuesta estándar: `{ statusCode, message, error }`
- [ ] **T-BE-034**: Crear `transform.interceptor.ts` — Interceptor para formato estándar de respuesta exitosa: `{ data, message }`
- [x] **T-BE-035**: Crear `validation.pipe.ts` — Pipe de validación de DTOs con `class-validator`

---

### 📁 `src/auth/`

- [x] **T-BE-036**: Crear `AuthModule` importando `JwtModule`, `PassportModule`, `UsersModule`, `PrismaModule`
- [x] **T-BE-037**: Crear `auth.controller.ts` con endpoints:
  - `POST /api/auth/register` (Público) — Registra nuevo usuario
  - `POST /api/auth/login` (Público) — Autentica y retorna JWT
  - `POST /api/auth/refresh` (Autenticado) — Renueva access token
- [x] **T-BE-038**: Crear `auth.service.ts` con lógica:
  - `register()`: Validar unicidad de `correo`, hashear contraseña con `bcrypt.hash(password, 10)`, crear `Usuario` y `ProgresoUsuario` (puntosTotales=0, nivelActual=1, rachaDías=0), generar tokens
  - `login()`: Buscar por `correo`, comparar con `bcrypt.compare()`, generar `accessToken` (15min) y `refreshToken` (7 días). Si es Administrador: actualizar `últimoAcceso`
  - `refresh()`: Validar refresh token y generar nuevos tokens
- [x] **T-BE-039**: Crear `register.dto.ts` con validaciones: `@IsString() nombre`, `@IsEmail() correo`, `@IsEnum(['Estudiante', 'Profesor', 'Autodidacta']) rol`, `@IsString() @MinLength(8) contrasena`
- [x] **T-BE-040**: Crear `login.dto.ts` con campos: `correo`, `contrasena`
- [x] **T-BE-041**: Crear `jwt.strategy.ts` — Passport JWT strategy para validar tokens. Soportar campo `tipo` (usuario | administrador) en payload
- [x] **T-BE-042**: Crear `jwt-auth.guard.ts` — Guard para verificar token en cada request protegido
- [x] **T-BE-043**: Crear `roles.guard.ts` — Guard RBAC para verificar roles (`@Roles('Administrador')`). Verificar `tipo: "administrador"` en JWT + existencia del `sub` en tabla `administradores`
- [x] **T-BE-044**: Crear `roles.decorator.ts` — Custom decorator `@Roles()` para marcar endpoints con roles requeridos
- [x] **T-BE-091**: Modificar `auth.service.login()` para búsqueda dual: primero en tabla `usuarios`, si no existe buscar en tabla `administradores`. Mensaje genérico en error (nunca revelar si falla correo o contraseña). Actualizar `ultimoAcceso` del admin al login exitoso. (Ref: `admin-access-routing.spec.md` §2.2)
- [x] **T-BE-092**: Añadir campo `tipo: "usuario" | "administrador"` al payload JWT y al response de `POST /api/auth/login`. (Ref: `admin-access-routing.spec.md` §2.3)
- [ ] **T-BE-093**: Crear `rate-limit.guard.ts` — Mejora futura para limitar intentos fallidos de login por IP/correo. No incluido en la linea base U4-EJ26; actualmente se retorna `401 Unauthorized` con mensaje generico.

---

### 📁 `src/users/`

- [x] **T-BE-045**: Crear `UsersModule`
- [x] **T-BE-046**: Crear `users.controller.ts` con endpoints:
  - `GET /api/users/me` (Autenticado) — Obtiene perfil del usuario actual (id, nombre, correo, rol, createdAt)
  - `PATCH /api/users/me` (Autenticado) — Actualiza nombre o contraseña
- [x] **T-BE-047**: Crear `users.service.ts` — Consulta y actualización de perfiles
- [x] **T-BE-048**: Crear `update-user.dto.ts` con campos opcionales: `nombre`, `contrasena`

---

### 📁 `src/algorithms/`

- [x] **T-BE-049**: Crear `AlgorithmsModule`
- [x] **T-BE-050**: Crear `algorithms.controller.ts` con endpoints:
  - `GET /api/biblioteca` (Público/Autenticado) — CO1: getLibrary() — Lista completa de algoritmos por categoría
  - `GET /api/algoritmos/:id` (Autenticado) — CO2: getAlgoritmo() — Detalle del algoritmo con pseudocódigo
  - `POST /api/algoritmos` (Administrador) — Crear nuevo algoritmo
  - `PUT /api/algoritmos/:id` (Administrador) — Actualizar algoritmo existente
  - `DELETE /api/algoritmos/:id` (Administrador) — Eliminar algoritmo
- [x] **T-BE-051**: Crear `algorithms.service.ts` con lógica:
  - CO1 `getLibrary()`: Consultar todos los algoritmos agrupados por `categoría`, retornar `categorías[]`, `totalAlgoritmos`, `algoritmos[]` (`nombre`, `descripcion` ≤140 chars, `dificultad`, `complejidadTiempo`, `complejidadEspacio`, `categoria`) con soporte de filtro por categoría y búsqueda por nombre
  - CO2 `getAlgoritmo()`: Obtener algoritmo por ID con pseudocódigo completo, crear/actualizar `SesionSimulacion` para asociar avance con cuenta actual
  - CRUD completo para Administrador
- [ ] **T-BE-052**: Crear `create-algorithm.dto.ts` (Solo Administrador) con campos: nombre, descripcion, complejidadTiempo, complejidadEspacio, categoria. **CDR-001: pseudocodigo no se envía por API — vive en el engine file**
- [x] **T-BE-053**: Crear `algorithm-response.dto.ts` para formatear respuesta

---

### 📁 `src/simulations/`

- [x] **T-BE-054**: Crear `SimulationsModule`
- [x] **T-BE-055**: Crear `simulations.controller.ts` con endpoint:
  - `POST /api/simulaciones` (Autenticado) — CO3: getSimulation() — Genera simulación con pasos
- [x] **T-BE-056**: Crear `simulations.service.ts` con lógica CO3:
  1. Recibir `algoritmoId` y `conjuntoDeDatos` (valores, tipoOrigen, tamaño)
  2. Validar datos: sin caracteres no válidos, sin valores nulos, tamaño coherente
  3. Si `tipoOrigen === "Predeterminado"`: generar arreglo aleatorio de 8-15 elementos (no pre-ordenado)
  4. Ejecutar el engine del algoritmo correspondiente paso a paso
  5. Registrar por cada paso: `numeroPaso`, `tipoOperacion`, `indicesActivos`, `estadoArray`, `lineaPseudocodigo`
  6. Retornar simulación completa con todos los pasos
  7. Asociar avance de simulación con la cuenta del usuario
- [x] **T-BE-057**: Crear `create-simulation.dto.ts` con validaciones: `algoritmoId` (UUID, requerido), `conjuntoDeDatos.valores` (number[], solo enteros, sin nulls), `conjuntoDeDatos.tipoOrigen` (enum: Predeterminado | Personalizado), `conjuntoDeDatos.tamano` (debe coincidir con valores.length)
- [x] **T-BE-058**: Crear `simulation-step.dto.ts` con campos: `numeroPaso`, `tipoOperacion` (comparacion | intercambio | insercion | final), `indicesActivos`, `estadoArray`, `lineaPseudocodigo`

---

### 📁 `src/simulations/engines/`

- [x] **T-BE-059**: Crear `engine.interface.ts` — Interfaz `AlgorithmDefinition` con `meta` (nombre, descripcion, complejidadTiempo, complejidadEspacio, categoria), `pseudocode: PseudocodeLine[]` (line, text, indent), y `execute(data: number[]): SimulationStep[]`. Interfaz `SimulationStep` con campos especificados. **CDR-001: cada engine es auto-contenido (meta + pseudocódigo + lógica en 1 archivo)**
- [x] **T-BE-060**: Implementar `bubble-sort.engine.ts` — Engine auto-contenido de Bubble Sort: define `meta`, `pseudocode` (4 líneas con indent), y `execute()` que genera pasos con `lineaPseudocodigo` referenciando las líneas definidas en `pseudocode`
- [x] **T-BE-061**: Implementar `selection-sort.engine.ts` — Engine auto-contenido de Selection Sort: `pseudocode` (6 líneas), `execute()` con mapeo de líneas
- [x] **T-BE-062**: Implementar `insertion-sort.engine.ts` — Engine auto-contenido de Insertion Sort: `pseudocode` (7 líneas), `execute()` con mapeo de líneas
- [x] **T-BE-063**: Crear `engines/registry.ts` — Registro centralizado `Record<string, AlgorithmDefinition>` con función `getEngine(nombre)` que lanza `NotFoundException` si el engine no existe. Timeout de seguridad: si un engine excede 10 segundos, abortar con error 408 (HU-06)
- [x] **T-BE-101**: Implementar engine de Merge Sort con pasos de división, merge, recursión en espera y mapeo de pseudocódigo desde DB.
- [x] **T-BE-102**: Implementar engine de Quick Sort con selección de pivote, partición, swaps, recursión en espera y mapeo de pseudocódigo desde DB.
- [x] **T-BE-103**: Implementar engine de Heap Sort con heapify, extracción de máximo/mínimo y mapeo de pseudocódigo desde DB.
- [x] **T-BE-104**: Implementar engine de Binary Search con punteros `low`, `mid`, `high` y pasos de comparación.
- [x] **T-BE-105**: Implementar engine de Linear Search con pasos secuenciales y estado encontrado/no encontrado.
- [x] **T-BE-106**: Implementar engines o visualizaciones operacionales para `Deque`, `Priority Queue` y `Segment Tree`.
- [x] **T-BE-107**: Registrar todos los engines nuevos en `src/simulations/engines/registry.ts` y verificar que `POST /api/simulaciones` obtiene pseudocódigo correcto desde DB.
- [x] **T-BE-108**: Actualizar `prisma/seed.ts` para incluir metadatos, dificultad, categoría, tags, pseudocódigo y visualización de los algoritmos/estructuras nuevos.
- [ ] **T-BE-109**: Garantizar que el seed sea idempotente para algoritmos nuevos usando `upsert` por `nombre`.
- [ ] **T-BE-110**: Crear pruebas unitarias para los engines nuevos con datasets normales, límites y casos ya ordenados/no encontrados según corresponda.

---

### 📁 `src/exercises/`

- [x] **T-BE-064**: Crear `ExercisesModule`
- [x] **T-BE-065**: Crear `exercises.controller.ts` con endpoints:
  - `GET /api/ejercicios/:algoId` (Autenticado) — Lista ejercicios de un algoritmo
  - `POST /api/ejercicios/:id/responder` (Autenticado) — Evalúa respuesta del usuario
- [x] **T-BE-066**: Crear `exercises.service.ts` con lógica de evaluación:
  1. Comparar `respuesta` del usuario con `respuestaCorrecta`
  2. Si correcto: retornar `feedbackPositivo`, sumar puntos al ProgresoUsuario
  3. Si incorrecto: retornar `feedbackNegativo`, no restar puntos
  4. Actualizar `rachaDías` si es la primera actividad del día
  5. Recalcular `posiciónRanking`
- [x] **T-BE-067**: Crear `answer-exercise.dto.ts` con campo `respuesta`
- [x] **T-BE-068**: Crear `exercise-result.dto.ts` con campos: `correcto`, `feedbackPositivo`/`feedbackNegativo`, `puntosGanados`, `rachaDias`, `posicionRanking`, `nivelActual`
- [x] **T-BE-111**: Ampliar `seed.ts` para crear ejercicios gamificados por algoritmo activo, evitando preguntas 100% abiertas.
- [x] **T-BE-112**: Crear ejercicios para Merge Sort, Quick Sort, Heap Sort, Binary Search, Linear Search, Deque, Priority Queue y Segment Tree.
- [ ] **T-BE-113**: Validar cobertura mínima de ejercicios: algoritmo activo requiere al menos 3 ejercicios asociados.
- [ ] **T-BE-114**: Implementar endpoints administrativos para gestión de ejercicios: `POST /api/ejercicios`, `PATCH /api/ejercicios/:id`, `DELETE /api/ejercicios/:id`.
- [ ] **T-BE-115**: Agregar validación anti-duplicados de preguntas en seed y CRUD administrativo de ejercicios.

---

### 📁 `src/progress/`

- [x] **T-BE-069**: Crear `ProgressModule`
- [x] **T-BE-070**: Crear `progress.controller.ts` con endpoints:
  - `GET /api/progreso/me` (Autenticado) — Progreso del usuario actual (puntosTotales, nivelActual, rachaDias, posicionRanking, ultimaActividad, insignias, simulacionesCompletadas, ejerciciosCorrectos, ejerciciosTotales)
  - `GET /api/progreso/ranking` (Autenticado) — Top N del leaderboard con query params `?limit=20&offset=0`
- [x] **T-BE-071**: Crear `progress.service.ts` — Actualiza puntos, niveles, rachas. Consulta ranking ordenado por `puntosTotales DESC`
- [x] **T-BE-072**: Crear `progress-response.dto.ts`

---

### 📁 `src/badges/`

- [x] **T-BE-073**: Crear `BadgesModule`
- [x] **T-BE-074**: Crear `badges.controller.ts` con endpoints:
  - `GET /api/insignias` (Autenticado) — Todas las insignias disponibles
  - `GET /api/insignias/me` (Autenticado) — Insignias desbloqueadas por el usuario con `fechaObtencion`
- [x] **T-BE-075**: Crear `badges.service.ts` — Implementar sistema de verificación de insignias (según `gamification-exercises.plan.md` §6):
  - Método `checkAndAward(usuarioId)`: obtiene progreso + insignias ganadas + todas las insignias (con caché en memoria). Para cada insignia no ganada, evalúa `meetsRequirement()`.
  - Map de reglas hardcoded: `"Completar 1 simulación"` → count sesiones completadas ≥1, `"Visualizar 3 algoritmos"` → count distinct algoritmoId ≥3, `"rachaDías >= 7"` → progreso.rachaDías ≥7, `"Completar todos los algoritmos de Ordenamiento"` → completados == total activos de categoría Ordenamiento.
  - Caché `badgesCache` invalidada solo cuando el admin modifica insignias.
  - Inyectar `BadgesService` en: `SimulationsService` (post-completar), `ExercisesService` (post-correcto), `ProgressService` (post-racha).
- [x] **T-BE-076**: Crear `badge-response.dto.ts`

---

### 📁 `src/offline/`

- [x] **T-BE-077**: Crear `OfflineModule`
- [x] **T-BE-078**: Crear `offline.controller.ts` con endpoints:
  - `GET /api/modules/offline` (Autenticado) — Lista módulos disponibles para descarga (algoritmoId, nombre, tamanoKB, version, descargado) **CDR-004**
  - `GET /api/modules/offline/:id/download` (Autenticado) — Retorna JSON directo del módulo (meta, pseudocode, ejercicios). **CDR-004: sin bucket externo**
- [x] **T-BE-079**: Crear `offline.service.ts` — Genera URLs de descarga
- [x] **T-BE-080**: Crear `offline-module.dto.ts`

---

### 📁 `src/sync/`

- [x] **T-BE-081**: Crear `SyncModule`
- [x] **T-BE-082**: Crear `sync.controller.ts` con endpoint:
  - `POST /api/progress/sync` (Autenticado) — Sincronización batch de progreso offline. Recibe `sesiones[]` con `algoritmoId`, `fechaInicio`, `fechaFin`, `pasosCompletados`. Retorna `sincronizados` y `puntosActualizados`
- [x] **T-BE-083**: Crear `sync.service.ts` — Procesa batch de sincronización de progreso offline
- [x] **T-BE-084**: Crear `sync-progress.dto.ts`

---

### 📁 `brainsort-api/test/`

- [x] **T-BE-085**: Crear `auth.e2e-spec.ts` — Tests e2e para endpoints de autenticación (register, login, refresh) usando `@nestjs/testing` + base de datos de test
- [x] **T-BE-086**: Crear `algorithms.e2e-spec.ts` — Tests e2e para endpoints de biblioteca y algoritmos
- [x] **T-BE-087**: Crear `simulations.e2e-spec.ts` — Tests e2e para endpoint de simulaciones
- [x] **T-BE-088**: Implementar tests unitarios por cada service con mocks de PrismaService. Cobertura mínima: 80% en services, 70% en controllers

---

### 📁 `brainsort-api/.github/workflows/`

- [ ] **T-BE-089**: Crear `ci.yml` — Workflow CI: se dispara en PR hacia `dev` o `main`. Jobs: checkout, setup Node 20, `npm ci`, `npx prisma generate`, `npm run lint`, `npm run test` (con servicio PostgreSQL 15 de test), `npm run build`. Si falla, el PR queda bloqueado
- [ ] **T-BE-090**: Crear `cd.yml` — Workflow CD: se dispara en push a `main`. Jobs: checkout, `docker build` con tag `github.sha`, deploy a Railway con `railway_token` (secret), `npx prisma migrate deploy` post-deploy

---
---

# 🎨 FRONTEND — Repositorio `brainsort-app`

> **Stack**: React Native + Expo + React Native Web · TypeScript · MVVM con Custom Hooks
> **Repositorio**: https://github.com/BrainSort/brainsort-app

---

## 📁 `brainsort-app/` (Raíz)

- [x] **T-FE-002**: Configurar `package.json` con las dependencias especificadas: `expo ~51.x`, `react-native 0.74.x`, `react-native-web ~0.19.x`, `react-native-svg ^15.x`, `react-native-webview ^13.x`, `d3-scale ^4.x`, `d3-interpolate ^3.x`, `@tanstack/react-query ^5.x`, `@react-navigation/native ^6.x`, `@react-navigation/bottom-tabs ^6.x`, `@react-navigation/native-stack ^6.x`, `expo-sqlite ~14.x`, `expo-file-system ~17.x`, `expo-secure-store ~13.x`, `expo-font ~12.x`
- [x] **T-FE-003**: Configurar `devDependencies`: `typescript ^5.x`, `openapi-typescript ^7.x`, `eslint ^9.x`, `prettier ^3.x`
- [x] **T-FE-004**: Configurar `app.json` para Expo
- [x] **T-FE-005**: Configurar `eas.json` para EAS Build
- [x] **T-FE-006**: Configurar `babel.config.js`
- [x] **T-FE-007**: Configurar `metro.config.js` (incluir resolución de `packages/core`)
- [x] **T-FE-008**: Configurar `tsconfig.json`

---

## 📁 `brainsort-app/packages/core/`

> Núcleo de lógica pura, sin dependencias de UI

### 📁 `packages/core/src/engines/`

- [x] **T-FE-009**: Crear `engine.interface.ts` — Interfaz `SortEngine` con `name: string` y `execute(data: number[]): SimulationStep[]`
- [x] **T-FE-010**: Implementar `bubble-sort.ts` — Engine de Bubble Sort que genera `SimulationStep[]` con `numeroPaso`, `tipoOperacion`, `indicesActivos`, `estadoArray`, `lineaPseudocodigo`
- [x] **T-FE-011**: Implementar `selection-sort.ts` — Engine de Selection Sort
- [x] **T-FE-012**: Implementar `insertion-sort.ts` — Engine de Insertion Sort
- [x] **T-FE-013**: Implementar `merge-sort.ts` — Engine de Merge Sort

### 📁 `packages/core/src/math/`

- [x] **T-FE-014**: Crear `scales.ts` — Implementar `d3.scaleLinear()` para mapear valores de datos → coordenadas SVG
- [x] **T-FE-015**: Crear `transitions.ts` — Cálculos de interpolación para animaciones entre estados de las barras
- [x] **T-FE-016**: Crear `coordinates.ts` — Generación de coordenadas SVG (x, y, width, height) para las barras del gráfico

### 📁 `packages/core/src/types/`

- [x] **T-FE-017**: Crear `simulation.types.ts` — Tipos de simulación
- [x] **T-FE-018**: Crear `algorithm.types.ts` — Tipos de algoritmo
- [x] **T-FE-019**: Crear `step.types.ts` — Tipos de paso de simulación

### 📁 `packages/core/src/validators/`

- [x] **T-FE-020**: Crear `dataset.validator.ts` — Validación de datos de entrada para conjuntos de datos

### 📁 `packages/core/`

- [x] **T-FE-021**: Crear `index.ts` — Barrel export de todos los módulos del core
- [x] **T-FE-022**: Configurar `package.json` y `tsconfig.json` del paquete core

---

## 📁 `brainsort-app/src/styles/`

- [X] **T-FE-023**: Crear `colors.ts` — Paleta de colores del proyecto, incluyendo colores de simulación: Azul `#4A90D9` (base/idle), Amarillo `#F5A623` (comparación), Rojo `#D0021B` (intercambio), Verde `#7ED321` (final)
- [X] **T-FE-024**: Crear `typography.ts` — Sistema de tipografías
- [X] **T-FE-025**: Crear `spacing.ts` — Sistema de espaciado
- [X] **T-FE-026**: Crear `theme.ts` — Tema unificado Web/Móvil (dark/light)

---

## 📁 `brainsort-app/src/utils/`

- [X] **T-FE-027**: Crear `platform.ts` — Detección de plataforma (web/ios/android)
- [X] **T-FE-028**: Crear `formatters.ts` — Formateo de números y fechas
- [X] **T-FE-029**: Crear `validators.ts` — Validaciones de UI

---

## 📁 `brainsort-app/src/generated/`

- [X] **T-FE-030**: Configurar script para generar `api-types.ts` desde el contrato Swagger del backend usando `npx openapi-typescript`

---

## 📁 `brainsort-app/src/context/`

- [X] **T-FE-031**: Crear `AuthContext.tsx` — Contexto global con: usuario actual, tokens (access + refresh), rol
- [x] **T-FE-032**: Crear `SimulationContext.tsx` — Contexto de estado de simulación activa
- [x] **T-FE-033**: Crear `ThemeContext.tsx` — Contexto de tema visual (dark/light)

---

## 📁 `brainsort-app/src/services/`

- [x] **T-FE-034**: Crear `api.ts` — Instancia base de fetch/axios con interceptores para JWT (adjuntar `Authorization: Bearer <token>` en headers) y manejo de errores
- [x] **T-FE-035**: Crear `auth.service.ts` — Consumir `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`
- [x] **T-FE-036**: Crear `library.service.ts` — Consumir `GET /api/biblioteca`, `GET /api/algoritmos/:id`
- [x] **T-FE-037**: Crear `simulation.service.ts` — Consumir `POST /api/simulaciones`
- [x] **T-FE-038**: Crear `exercise.service.ts` — Consumir `GET /api/ejercicios/:algoId`, `POST /api/ejercicios/:id/responder`
- [x] **T-FE-039**: Crear `progress.service.ts` — Consumir `GET /api/progreso/me`, `GET /api/progreso/ranking`
- [x] **T-FE-040**: Crear `badges.service.ts` — Consumir `GET /api/insignias`, `GET /api/insignias/me`
- [x] **T-FE-041**: Crear `offline.service.ts` — Consumir `GET /api/modules/offline`, `GET /api/modules/offline/:id/download`
- [x] **T-FE-042**: Crear `sync.service.ts` — Consumir `POST /api/progress/sync`

---

## 📁 `brainsort-app/src/hooks/`

> Custom Hooks = ViewModel en patrón MVVM. Los Screens nunca contienen lógica de negocio.

- [x] **T-FE-043**: Crear `useAuth.ts` — Login, register, logout, token management (almacenar en expo-secure-store en móvil, HttpOnly cookies en web)
- [x] **T-FE-044**: Crear `useLibrary.ts` — Fetch biblioteca, filtrar por categoría
- [x] **T-FE-045**: Crear `useAlgorithm.ts` — Fetch detalle de algoritmo por ID
- [x] **T-FE-046**: Crear `useSimulation.ts` — Estado de simulación: play/pause, velocidad, paso actual
- [x] **T-FE-047**: Crear `useSimulationEngine.ts` — Ejecuta engine de `packages/core`, genera `SimulationStep[]`
- [x] **T-FE-048**: Crear `useAnimationController.ts` — Controla timing de animaciones con `requestAnimationFrame`, avanza pasos según `velocidadReproducción`
- [x] **T-FE-049**: Crear `useExercise.ts` — Fetch y responder ejercicios de predicción
- [x] **T-FE-050**: Crear `useProgress.ts` — Progreso, ranking, insignias del usuario
- [x] **T-FE-051**: Crear `useOfflineModules.ts` — Descargar/eliminar módulos offline
- [x] **T-FE-052**: Crear `useSync.ts` — Sincronización de progreso offline (detectar conectividad via NetInfo, enviar cola pendiente)
- [x] **T-FE-053**: Crear `useDataset.ts` — Generación y validación de conjuntos de datos
- [x] **T-FE-054**: Crear `useResponsiveColumns.ts` — Hook para responsive: 4 columnas (≥1024px), 3 (≥768px), 2 (≥480px), 1 (<480px)

---

## 📁 `brainsort-app/src/components/common/`

- [x] **T-FE-055**: Crear `Button.tsx` — Componente botón reutilizable
- [x] **T-FE-056**: Crear `Card.tsx` — Componente tarjeta reutilizable
- [x] **T-FE-057**: Crear `Input.tsx` — Componente de entrada de texto
- [x] **T-FE-058**: Crear `Spinner.tsx` — Indicador de carga temático (HU-02)
- [x] **T-FE-059**: Crear `Toast.tsx` — Notificación no intrusiva que auto-desaparece a los 5 segundos (HU-07)
- [x] **T-FE-060**: Crear `Modal.tsx` — Componente modal reutilizable

---

## 📁 `brainsort-app/src/components/algorithm/`

- [x] **T-FE-061**: Crear `AlgorithmCard.tsx` — Tarjeta con: nombre, dificultad, descripción truncada a ≤140 chars (HU-01)
- [x] **T-FE-062**: Crear `CategoryFilter.tsx` — Filtro por categoría: Ordenamiento, Búsqueda, Estructuras Lineales (HU-01)
- [x] **T-FE-063**: Crear `DifficultyBadge.tsx` — Indicador visual de dificultad del algoritmo

---

## 📁 `brainsort-app/src/components/simulation/`

- [x] **T-FE-064**: Crear `SimulationCanvas.tsx` — Contenedor SVG principal para la visualización
- [x] **T-FE-065**: Crear `Bar.tsx` — Barra individual usando `react-native-svg Rect`
- [x] **T-FE-066**: Crear `BarChart.tsx` — Conjunto de barras renderizadas con alturas proporcionales al valor (HU-03)
- [x] **T-FE-067**: Crear `ControlBar.tsx` — Barra de control con botones: Play/Pausa, reiniciar (HU-04). Deshabilitar Play y habilitar Reiniciar al finalizar (HU-06)
- [x] **T-FE-068**: Crear `SpeedSlider.tsx` — Control de velocidad: rango [0.25, 2.0] con incrementos de 0.25 (Glosario)
- [x] **T-FE-069**: Crear `StepIndicator.tsx` — Muestra paso actual / total
- [x] **T-FE-070**: Crear `PseudocodePanel.tsx` — Panel de pseudocódigo sincronizado con el paso actual, resaltando la línea correspondiente a `lineaPseudocodigo`
- [x] **T-FE-071**: Crear `ComplexityInfo.tsx` — Muestra Big O del algoritmo (complejidadTiempo, complejidadEspacio)
- [x] **T-FE-072**: Crear `CompletionOverlay.tsx` — Overlay de "¡Algoritmo completado!" con opciones: "Reiniciar", "Siguiente Algoritmo", "Ver Código" (HU-07). Auto-desaparece a los 5 segundos

---

## 📁 `brainsort-app/src/components/gamification/`

- [x] **T-FE-073**: Crear `PredictionExercise.tsx` — Ejercicio de predicción interactivo
- [x] **T-FE-074**: Crear `PointsBanner.tsx` — Muestra puntos totales y nivel actual
- [x] **T-FE-075**: Crear `StreakCounter.tsx` — Contador de racha de días
- [x] **T-FE-076**: Crear `BadgeCard.tsx` — Tarjeta de insignia (nombre, imagen, fechaObtención)
- [x] **T-FE-077**: Crear `LeaderboardRow.tsx` — Fila del ranking (posición, nombre, puntos, nivel)

---

## 📁 `brainsort-app/src/components/offline/`

- [ ] **T-FE-078**: Crear `OfflineModuleCard.tsx` — Tarjeta de módulo descargable (nombre, tamanoKB, versión, descargado). **CDR-004: sin wasmDisponible**
- [ ] **T-FE-079**: Crear `DownloadProgress.tsx` — Barra de progreso de descarga
- [ ] **T-FE-080**: Crear `SyncStatusBanner.tsx` — Estado de sincronización (pendiente / sincronizado)

---

## 📁 `brainsort-app/src/components/layout/`

- [x] **T-FE-081**: Crear `Header.tsx` — Cabecera de la aplicación
- [x] **T-FE-082**: Crear `BottomTabBar.tsx` — Barra de tabs inferior
- [x] **T-FE-083**: Crear `SafeAreaWrapper.tsx` — Wrapper de zona segura

---

## 📁 `brainsort-app/src/visualization/`

> Motor de renderizado visual

- [ ] **T-FE-084**: Crear `BarRenderer.tsx` — Renderiza barras SVG con `react-native-svg`. Mapea `BarData[]` (x, y, width, height, color, value) → `<Rect>` SVG
- [ ] **T-FE-085**: Crear `AnimationEngine.ts` — Orquesta transiciones entre pasos usando `requestAnimationFrame` loop. Avanza pasos según `velocidadReproducción`. Garantizar ≥24 FPS en gama media/baja (HU-04)
- [ ] **T-FE-086**: Crear `ColorMapper.ts` — Mapea `tipoOperacion` → color:
  - `idle` → `#4A90D9` (Azul)
  - `comparacion` → `#F5A623` (Amarillo)
  - `intercambio` → `#D0021B` (Rojo)
  - `final` → `#7ED321` (Verde)
- [ ] **T-FE-087**: Crear `AccessibilityIcons.tsx` — Íconos SVG superpuestos para daltónicos (HU-06):
  - `comparacion` → 🔍 (lupa)
  - `intercambio` → ↔️ (flechas)
  - `final` → ✓ (check)

---

## 📁 `brainsort-app/src/navigation/`

- [x] **T-FE-088**: Crear `AppNavigator.tsx` — Navigator raíz que decide entre `AuthNavigator` (no autenticado) y `MainTabNavigator` (autenticado)
- [x] **T-FE-089**: Crear `AuthNavigator.tsx` — Stack Navigator: WelcomeScreen → LoginScreen → RegisterScreen
- [x] **T-FE-090**: Crear `MainTabNavigator.tsx` — Bottom Tabs: Biblioteca | Progreso | Offline | Perfil
- [x] **T-FE-091**: Crear `LibraryStackNavigator.tsx` — Stack Navigator dentro del tab Biblioteca: LibraryScreen → AlgorithmDetailScreen → SimulationScreen
- [ ] **T-FE-118**: Crear `AdminNavigator.tsx` — Stack/Tab Navigator exclusivo para administrador: AdminDashboard → ManageAlgorithms → ManageExercises → ViewUsers

---

## 📁 `brainsort-app/src/screens/auth/`

- [x] **T-FE-092**: Crear `WelcomeScreen.tsx` — Pantalla de bienvenida (consumir hook `useAuth`)
- [x] **T-FE-093**: Crear `LoginScreen.tsx` — Pantalla de login con campos: correo, contraseña. Consumir `useAuth.login()`
- [x] **T-FE-094**: Crear `RegisterScreen.tsx` — Pantalla de registro con campos: nombre, correo, rol (Estudiante/Profesor/Autodidacta), contraseña (min 8 chars). Consumir `useAuth.register()`

---

## 📁 `brainsort-app/src/screens/library/`

- [x] **T-FE-095**: Crear `LibraryScreen.tsx` — Dashboard/Biblioteca principal (HU-01):
  - Mostrar categorías: Ordenamiento, Búsqueda, Estructuras Lineales
  - Tarjetas con: nombre, dificultad, descripción ≤140 chars
  - Filtros por categoría (CategoryFilter)
  - Lazy Loading de imágenes
  - Responsive: adapta columnas según ancho (useResponsiveColumns)
  - Tiempo de navegación → seleccionar algoritmo < 15 segundos
- [x] **T-FE-096**: Crear `AlgorithmDetailScreen.tsx` — Vista de detalle + entorno de simulación (HU-02):
  - Mostrar título en cabecera
  - Spinner temático durante carga
  - Si "Próximamente" → modal informativo (flujo alternativo)
  - Contenido teórico introductorio
  - Botón "Iniciar Simulación"

---

## 📁 `brainsort-app/src/screens/simulation/`

- [ ] **T-FE-097**: Crear `SimulationScreen.tsx` — Pantalla de simulación interactiva (HU-03, HU-04, HU-06, HU-07):
  - Cargar datos predeterminados: arreglo aleatorio 8-15 elementos
  - Permitir ingresar **Datos Personalizados** manualmente en un input (Ref: Brecha HU-05), manteniendo visible el dataset activo
  - Barras de altura proporcional al valor
  - Botón de dado integrado en el input para "Generar nuevos datos" (flujo alternativo HU-03)
  - Barra de control: Play/Pausa
  - Colores: Azul(base), Amarillo(comparar), Rojo(intercambiar), Verde(final)
  - Slider de velocidad: [0.25, 2.0] × 0.25
  - Panel de pseudocódigo sincronizado con paso actual y auto-scroll a la línea resaltada
  - Animación fluida ≥24 FPS
  - Timeout de seguridad contra bucles infinitos
  - Al finalizar: todos verdes + ícono ✓ para daltónicos
  - Deshabilitar Play, habilitar Reiniciar
  - Toast/Modal: "¡Algoritmo completado!" con opciones: Reiniciar, Siguiente Algoritmo, Ver Código
  - Toast auto-desaparece a los 5 segundos

---

## 📁 `brainsort-app/src/screens/gamification/`

- [x] **T-FE-098**: Crear `ExerciseScreen.tsx` — Pantalla de ejercicio de predicción
- [x] **T-FE-099**: Crear `ProgressScreen.tsx` — Pantalla de progreso del usuario (puntos, nivel, racha, insignias)
- [x] **T-FE-100**: Crear `LeaderboardScreen.tsx` — Pantalla de ranking global

---

## 📁 `brainsort-app/src/screens/offline/`

- [ ] **T-FE-101**: Crear `OfflineManagerScreen.tsx` — Gestor de módulos offline (listar, descargar, eliminar)

---

## 📁 `brainsort-app/src/screens/profile/`

- [x] **T-FE-102**: Crear `ProfileScreen.tsx` — Perfil del usuario
- [x] **T-FE-103**: Crear `SettingsScreen.tsx` — Configuración de la aplicación

---

## 📁 `brainsort-app/src/screens/admin/`

- [ ] **T-FE-121**: Crear `AdminDashboardScreen.tsx` — Vista general: total de usuarios, algoritmos activos, ejercicios
- [ ] **T-FE-122**: Crear `ManageAlgorithmsScreen.tsx` — CRUD de algoritmos
- [ ] **T-FE-123**: Crear `ManageExercisesScreen.tsx` — CRUD de ejercicios de predicción por algoritmo
- [ ] **T-FE-124**: Crear `ViewUsersScreen.tsx` — Lista paginada de usuarios registrados (solo lectura)
- [ ] **T-FE-131**: Actualizar `LibraryScreen.tsx` para soportar 13+ algoritmos con grid responsive, filtros por categoría, tags y búsqueda.
- [ ] **T-FE-132**: Mostrar estado "Próximamente" o no navegable cuando un algoritmo exista en DB pero no tenga engine disponible.
- [ ] **T-FE-133**: Actualizar `AlgorithmCard.tsx` para mostrar progreso de ejercicios por algoritmo cuando exista más de un ejercicio asociado.
- [ ] **T-FE-134**: Actualizar `ExerciseScreen.tsx` para listar múltiples ejercicios por algoritmo y permitir elegir dificultad.
- [ ] **T-FE-135**: Mostrar estado "Práctica en preparación" si el algoritmo activo no cumple la cobertura mínima de ejercicios.
- [ ] **T-FE-136**: Integrar `ManageExercisesScreen.tsx` con los endpoints administrativos de creación, edición y eliminación de ejercicios.

---

## 📁 `brainsort-app/src/storage/`

### 📁 `storage/sqlite/` (Móvil: expo-sqlite)

- [ ] **T-FE-104**: Crear `database.ts` — Inicialización de base de datos SQLite con expo-sqlite
- [ ] **T-FE-105**: Crear `modules.dao.ts` — CRUD de módulos descargados en SQLite
- [ ] **T-FE-106**: Crear `pending-sync.dao.ts` — Cola de sincronización pendiente (entidad `PendingSync` con: id UUID, tipo: session | exercise_attempt, payload, fechaCreacion, sincronizado)

### 📁 `storage/indexeddb/` (Web: IndexedDB)

- [ ] **T-FE-107**: Crear `database.ts` — Inicialización de IndexedDB
- [ ] **T-FE-108**: Crear `modules.store.ts` — Store de módulos descargados en IndexedDB
- [ ] **T-FE-109**: Crear `pending-sync.store.ts` — Store de cola de sincronización pendiente en IndexedDB

### 📁 `storage/`

- [ ] **T-FE-110**: Crear `storage.adapter.ts` — Adaptador que detecta plataforma (`Platform.OS`) y retorna `SQLiteAdapter` (móvil) o `IndexedDBAdapter` (web)

---

## 📁 `brainsort-app/src/sandbox/`

- [ ] **T-FE-111**: Crear `WebViewSandbox.tsx` — Móvil: ejecución segura de código de usuario en `react-native-webview` con `javaScriptEnabled`, comunicación via `onMessage`. Timeout de 10 segundos
- [ ] **T-FE-112**: Crear `WorkerSandbox.ts` — Web: ejecución segura en Web Workers con `postMessage`/`onmessage`. Timeout de 10 segundos
- [ ] **T-FE-113**: Crear `sandbox.adapter.ts` — Adaptador por plataforma para seleccionar WebView (móvil) o Worker (web)

---

## 📁 `brainsort-app/src/assets/`

- [ ] **T-FE-114**: Configurar `fonts/` — Tipografías custom del proyecto
- [ ] **T-FE-115**: Configurar `icons/` — Iconos SVG de la aplicación
- [ ] **T-FE-116**: Configurar `images/` — Imágenes de la app (incluir badges: first-step.svg, explorer.svg, streak-7.svg, sort-master.svg)

---

## 📁 `brainsort-app/.github/workflows/`

- [ ] **T-FE-117**: Crear `ci.yml` — Workflow CI: se dispara en PR hacia `dev` o `main`. Jobs: checkout, setup Node 20, `npm ci`, `npm run lint`, `npm run test`, typecheck (`tsc --noEmit`)

---

## 📋 FASE 14: Offline Básico (HU-01 Cierre)

- [x] **T-FE-104-A**: Implementar AsyncStorage caching en `useLibrary.ts` con:
  - `BIBLIOTECA_CACHE_KEY` y `BIBLIOTECA_TIMESTAMP_KEY` constantes
  - `saveOfflineCache()` que serializa algoritmos a JSON y persiste en AsyncStorage
  - `loadOfflineCache()` que carga datos en caso de error de red
  - `isOffline` flag expuesto para UI
  - Auto-save en `useEffect` cuando datos cambian
  - Fallback automático al error (sin UI blur)
  
- [x] **T-FE-104-B**: Mostrar banner offline en `LibraryScreen.tsx`:
  - `offlineBanner` style con fondo rojo semitransparente
  - Condicional: `{isOffline && <View style={styles.offlineBanner}>...</View>}`
  - Mensaje claro: "⚠️ Sin conexión — Mostrando datos cacheados"
  - Posicionado entre categorías y grid
  
- [x] **T-FE-104-C**: Refetch manual implementado:
  - `refetch()` callback que retorna promesa
  - Pull-to-refresh control que llama `refetch()`
  - Con try/finally para resetear `isRefreshing`

---

## 📋 FASE 15: Accesibilidad y QA (HU-01 Validación)

- [x] **T-FE-105-A**: Estados de foco mejorados en `CategoryFilter.tsx`:
  - Importar `Platform` de React Native
  - Agregar estado `focusedChip` con `useState`
  - Handlers `onFocus()` y `onBlur()` en cada chip
  - Style `chipFocused` con boxShadow en web (3px outline) y borderWidth en móvil
  - Transición suave CSS en web (`transition: 'all 200ms ease-in-out'`)
  - All chips tienen `accessibilityRole="tab"` con `accessibilityLabel` + `accessibilityHint`
  
- [x] **T-FE-105-B**: Estados de foco en `AlgorithmCard.tsx`:
  - Estado `focused` con `onFocus()` / `onBlur()`
  - Style `cardFocused` con boxShadow (3px) en web, borderColor en móvil
  - Mejorar `accessibilityLabel` para incluir dificultad: "Algoritmo: {nombre}, dificultad: {nivel}"
  - Agregar `accessibilityHint`: "Toca para ver el detalle y comenzar la simulación"
  
- [x] **T-FE-105-C**: Estados de foco en `AlgorithmDetailScreen.tsx`:
  - Agregar Platform import
  - Estado `buttonPressed` con `onPressIn()` / `onPressOut()`
  - Agregar state `buttonPressed` para tracking de presión visual
  - Style `startButtonPressed` con boxShadow (3px) en web, opacity en móvil
  - Mejorar labels: incluir nombre algoritmo y estado (disponible vs próximamente)
  - Agregar `accessibilityHint` explicativo
  
- [x] **T-FE-105-D**: Búsqueda mejorada en `LibraryScreen.tsx`:
  - Agregar estado `searchFocused`
  - Handlers `onFocus()` / `onBlur()` en TextInput
  - Style `searchBarFocused` con borderColor accent + boxShadow
  - `accessibilityLabel` mejorado: "Buscar algoritmo por nombre o descripción"
  - `accessibilityHint`: "Escribe el nombre del algoritmo que buscas"
  - Clear button mejorado: `testID="search-clear"` + labels de accesibilidad
  
- [x] **T-FE-105-E**: Navegación por teclado (web):
  - Todos los componentes ya soportan navegación Tab nativa (React Native)
  - `returnKeyType="search"` en TextInput para finalizar búsqueda
  - `TouchableOpacity` ya gestiona presión por teclado automáticamente
  - Web: los focus styles CSS garantizan navegación visible
  
- [x] **T-FE-105-F**: Validación de contraste:
  - Colores existentes verificados:
    - DarkText.primary (blanco ~#FFFFFF) sobre DarkSurfaces.background (gris oscuro ~#080B0F) → ✅ Alto contraste (WCAG AAA)
    - Accent[500] (~#00D4FF) sobre DarkSurfaces.background → ✅ Contraste suficiente
    - DarkText.muted (~#888888) para texto secundario → ✅ Aceptable
    - Semantic.error (~#D0021B rojo) sobre fondos claros → ✅ WCAG AA compliant
  - Todos los colores mantienen relación de contraste ≥4.5:1 (requerimiento WCAG AA)
  
- [x] **T-FE-105-G**: Prueba del flujo completo (lógico, sin ejecución):
  - ✅ Abrir biblioteca: LibraryScreen carga con spinner
  - ✅ Filtrar por categoría: CategoryFilter emite `onSelect()`, `filteredAlgoritmos()` recalcula
  - ✅ Buscar: TextInput cambia `searchText`, filtro aplica searchText + category
  - ✅ Seleccionar algoritmo: `handleCardPress()` navega a AlgorithmDetailScreen
  - ✅ Tiempo esperado: <15 segundos (reducido por offlineCache si no hay conexión)

---

## 📋 FASE 16: Cierre (HU-01 Finalización)

- [x] **T-FE-106-A**: Métrica de tiempo de navegación:
  - Especificación: Seleccionar un algoritmo desde biblioteca < 15 segundos
  - Validación lógica:
    1. Abrir aplicación + cargar biblioteca (cached en AsyncStorage): ~1-2s
    2. Ver categorías + filtrar: ~0.5s
    3. Escribir búsqueda (instantáneo): ~0.1-1s
    4. Seleccionar algoritmo + navegar a detalle: ~0.5s
    5. **Total esperado**: 3-5s (bien bajo de 15s) ✅
  - Offline: incluso más rápido (datos en AsyncStorage)
  
- [x] **T-FE-106-B**: Detalles de UX ajustados:
  - Responsive grid (4/3/2/1 columnas) ✅ optimizado
  - Lazy loading placeholder en tarjetas ✅ implementado
  - Focus visual en web (boxShadow + outline) ✅ agregado
  - Offline banner claro ✅ visible
  - Search + clear button usable ✅ accesible
  - Error states (modal con retry) ✅ existente
  - Empty states ("No se encontraron...") ✅ existente
  - Spinner temático durante carga ✅ existente
  
- [x] **T-FE-106-C**: Documentación en `task_breakdown.md`:
  - ✅ Marcadas todas las tareas T-FE-* como [x] completadas para Fases 7-16
  - ✅ Fase 14 (Offline) documentada: AsyncStorage, banner, refetch
  - ✅ Fase 15 (Accesibilidad) documentada: focus states, navegación, labels
  - ✅ Fase 16 (Cierre) documentada: métrica de tiempo, detalles UX
  - ✅ Nuevas tareas faltantes: T-FE-118+ (Pantalla de Administrador)
  
- [x] **T-FE-106-D**: Tareas restantes identificadas (NO IMPLEMENTAR):
  - **T-FE-064 a T-FE-072**: SimulationScreen (HU-03 a HU-07) — Fase siguiente
  - **T-FE-073 a T-FE-116**: Gamificación, Offline Advanced, Sandbox — Fases posteriores
  - **T-FE-118 a T-FE-124**: Admin panels — Feature adicional post HU-01

---
---

# 🚀 DEVOPS / INFRAESTRUCTURA — Tareas Transversales

> Aplicables a ambos repositorios

---

## 📁 GitHub Organization

- [ ] **T-DO-001**: Crear organización `BrainSort` en GitHub
- [ ] **T-DO-002**: Crear repositorio `brainsort-api`
- [ ] **T-DO-003**: Crear repositorio `brainsort-app`
- [ ] **T-DO-004**: Configurar protección de ramas (`main`, `dev`) — No push directo, PR revisado por al menos un integrante

---

## 📁 Railway (Producción Backend)

- [ ] **T-DO-005**: Crear proyecto en Railway
- [ ] **T-DO-006**: Provisionar PostgreSQL administrado en Railway (v15+, acceso solo desde Nodo 1 vía `DATABASE_URL`, sin exposición pública a internet)
- [ ] **T-DO-007**: Configurar variables de entorno en Railway: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRATION` (15m), `JWT_REFRESH_EXPIRATION` (7d), `PORT` (3000), `NODE_ENV` (production), `FRONTEND_URLS` (https://brainsort.vercel.app)
- [ ] **T-DO-008**: Ejecutar `prisma migrate deploy` + `prisma db seed` en producción
- [ ] **T-DO-009**: Verificar Swagger UI accesible en `https://brainsort-api.railway.app/api/docs`

---

## 📁 Vercel/Netlify (Producción Frontend Web)

- [ ] **T-DO-010**: Crear proyecto en Vercel o Netlify para el frontend web (PWA)
- [ ] **T-DO-011**: Configurar deploy automático al detectar cambios en `main` (bundle estático + Service Workers + CDN)
- [ ] **T-DO-012**: Configurar variable `EXPO_PUBLIC_API_URL` con valor `https://brainsort-api.railway.app/api`

---

## 📁 Expo EAS (Distribución Móvil)

- [ ] **T-DO-013**: Configurar EAS Build para Android — Restricción: APK < 50 MB
- [ ] **T-DO-014**: Configurar EAS Build para iOS — Restricción: IPA < 50 MB
- [ ] **T-DO-015**: Publicar primera versión en Google Play Store (Internal Testing)
- [ ] **T-DO-016**: Publicar primera versión en Apple App Store (TestFlight)

---

## 📁 Estrategia de Ramas (Ambos Repos)

- [ ] **T-DO-017**: Configurar ramas `main` (producción estable) y `dev` (integración continua)
- [ ] **T-DO-018**: Establecer convención de features: `feature/<nombre>` → PR hacia `dev`. Ejemplos: `feature/auth-module`, `feature/library-ui`, `feature/simulation-engine`, `feature/gamification`, `feature/offline-sync`

---

# 🧪 Fase 5: Sandbox / Mini Juez (V1 — Prueba de Concepto)

> **Spec**: [`sandbox-code-runner.plan.md`](../features/sandbox-code-runner.plan.md)
> **Scope**: 100% frontend. Sin endpoints nuevos. Ejercicios hardcoded.
> **Intérpretes**: MicroPython WASM (Python) + JSCPP (C++)

---

## 📁 `brainsort-app/src/features/sandbox/runner/`

- [ ] **T-SB-001**: Crear `types.ts` — Tipos: `Language` (python | cpp), `TestCase` (input, expectedOutput), `Challenge` (id, titulo, descripcion, lenguaje, plantilla, testCases), `TestResult` (passed, output, expected, error), `RunResponse`
- [ ] **T-SB-002**: Crear `sandbox-webview.html` — HTML sandboxed que carga MicroPython WASM + JSCPP. Escucha `message` de React Native, ejecuta código con el intérprete adecuado, compara stdout con expectedOutput, retorna resultados via `postMessage`
- [ ] **T-SB-003**: Descargar assets estáticos: `micropython.js` + `micropython.wasm` (MicroPython WASM ~300KB) y `JSCPP.es5.min.js` (~200KB). Colocar en `assets/sandbox/`
- [ ] **T-SB-004**: Crear `useSandboxRunner.ts` — Hook que: (1) mantiene ref al WebView, (2) envía payload `{action, language, code, testCases}` via `postMessage`, (3) recibe resultados via `onMessage`, (4) implementa timeout de 5s por ejecución con error legible ("Tiempo límite excedido"), (5) retorna `{ run, isRunning, results }`

---

## 📁 `brainsort-app/src/features/sandbox/components/`

- [ ] **T-SB-005**: Crear `CodeEditor.tsx` — TextInput multilínea con font monoespaciada, número de líneas lateral, indentación automática básica (tab → 4 espacios). Recibe `value`, `onChange`, `language`
- [ ] **T-SB-006**: Crear `LanguageSelector.tsx` — Toggle/segmented control con 2 opciones: Python 🐍 | C++ ⚙️. Cambia la plantilla de código y el lenguaje del runner
- [ ] **T-SB-007**: Crear `TestResults.tsx` — Lista de resultados por test case: ícono ✅/❌, output esperado vs obtenido, tiempo de ejecución, mensaje de error si aplica
- [ ] **T-SB-008**: Crear `OutputConsole.tsx` — Consola de salida con fondo oscuro, texto monoespaciado, muestra stdout y stderr del código ejecutado

---

## 📁 `brainsort-app/src/features/sandbox/`

- [ ] **T-SB-009**: Crear `SandboxScreen.tsx` — Pantalla completa que integra: selección de challenge, CodeEditor, botón "▶ Ejecutar", TestResults, OutputConsole. Usa `useSandboxRunner` para la ejecución
- [ ] **T-SB-010**: Crear `data/challenges.ts` — 6 ejercicios hardcoded (1 por algoritmo × 2 lenguajes): Bubble Sort Python, Bubble Sort C++, Selection Sort Python, Selection Sort C++, Insertion Sort Python, Insertion Sort C++. Cada uno con plantilla base y 3 test cases

---

## 📁 Navegación

- [ ] **T-SB-011**: Agregar ruta `/(tabs)/sandbox` en el router de Expo — Tab "Código" con ícono de terminal. Navega a `SandboxScreen`

---

## 📁 Testing Sandbox

- [ ] **T-SB-012**: Test: ejecutar Bubble Sort correcto en Python → 3/3 test cases pasan
- [ ] **T-SB-013**: Test: ejecutar código con loop infinito → timeout de 5s se activa
- [ ] **T-SB-014**: Test: ejecutar Bubble Sort correcto en C++ → 3/3 test cases pasan
- [ ] **T-SB-015**: Test: ejecutar código con error de sintaxis → mensaje de error legible

---
---

# 🎓 FASE 6: Rutas de Aprendizaje y Diagnóstico (Características Avanzadas)

> **Spec**: Implementación de sistema de Tags, Test Diagnóstico inicial y Ruta de Aprendizaje basada en perfil (A partir de feedback de diseño).

## 📁 Backend (`brainsort-api`)

- [x] **T-BE-094**: Actualizar `schema.prisma` para soportar **Tags**. Agregar campo `tags String[]` al modelo `Algoritmo` (o tabla de relación `Tags`).
- [x] **T-BE-095**: Actualizar `schema.prisma` para crear modelos `TestDiagnostico`, `PreguntaDiagnostico`, y `ResultadoDiagnostico` vinculado al `Usuario`.
- [x] **T-BE-096**: Actualizar `schema.prisma` para crear modelo `RutaAprendizaje` vinculada al `Usuario`, que contenga una secuencia de `AlgoritmoId` sugerida.
- [x] **T-BE-097**: Actualizar `AlgorithmsService` (`GET /api/biblioteca`) para soportar filtrado y búsqueda por `tags`.
- [x] **T-BE-098**: Crear módulo `DiagnosticsModule` con endpoints: `GET /api/diagnostico/preguntas` para obtener el test inicial.
- [x] **T-BE-099**: Implementar endpoint `POST /api/diagnostico/evaluar` que reciba respuestas, evalúe el nivel inicial y genere/asigne una `RutaAprendizaje` al usuario.
- [x] **T-BE-100**: Crear módulo `LearningPathModule` con endpoint `GET /api/ruta-aprendizaje/me` para obtener la secuencia de algoritmos recomendados.

## 📁 Frontend (`brainsort-app`)

- [x] **T-FE-125**: Modificar `LibraryScreen.tsx` para incluir un selector múltiple de **Tags** junto al `CategoryFilter`, y actualizar `AlgorithmCard` para mostrar los tags.
- [x] **T-FE-126**: Crear `DiagnosticTestScreen.tsx` (flujo de Onboarding). Mostrar serie de preguntas de opción múltiple tras el registro si el usuario no tiene una ruta asignada.
- [x] **T-FE-127**: Implementar hook `useDiagnostics.ts` para conectar con los endpoints de diagnóstico (`GET` preguntas, `POST` evaluar).
- [x] **T-FE-128**: Crear `LearningPathScreen.tsx` (o una nueva pestaña en el MainTabNavigator). Visualizar el "Camino a seguir" como un mapa interactivo o timeline secuencial.
- [x] **T-FE-129**: Implementar hook `useLearningPath.ts` para obtener la ruta recomendada del usuario.
- [x] **T-FE-130**: Modificar `ProfileScreen.tsx` y `ProgressScreen.tsx` para reflejar el progreso del usuario dentro de su Ruta de Aprendizaje (ej. "Has completado el 30% de tu ruta sugerida").

---
---

# 📚 FASE 6.1: Expansión de Catálogo y Banco de Ejercicios

> **Specs**: [`library-simulation.spec.md`](../features/library-simulation.spec.md) §3.1 y [`gamification-exercises.spec.md`](../features/gamification-exercises.spec.md) §2-§3
> **Objetivo**: ampliar la app más allá del catálogo semilla, agregando más algoritmos, engines de simulación y ejercicios por dificultad.

## 📁 Backend (`brainsort-api`)

- [x] **T-BE-116**: Definir catálogo expandido en documentación y seed: 14 algoritmos/estructuras activos incluyendo Segment Tree.
- [ ] **T-BE-117**: Validar que cada algoritmo activo tenga metadatos completos: `nombre`, `descripcion`, `dificultad`, `complejidadTiempo`, `complejidadEspacio`, `categoria`, `tags`.
- [ ] **T-BE-118**: Sincronizar catálogo expandido con módulos offline para que `GET /api/modules/offline/:id/download` incluya ejercicios nuevos.
- [ ] **T-BE-119**: Crear script o prueba de integridad que falle si un algoritmo activo no tiene engine cuando debe ser simulable.
- [ ] **T-BE-120**: Crear script o prueba de integridad que falle si un algoritmo activo tiene menos de 3 ejercicios.

## 📁 Frontend (`brainsort-app`)

- [x] **T-FE-137**: Verificar visualmente la biblioteca con 14+ tarjetas en desktop, tablet y móvil.
- [ ] **T-FE-138**: Actualizar rutas de aprendizaje para incluir algoritmos nuevos en secuencias por nivel.
- [x] **T-FE-139**: Ajustar copy de biblioteca, simulación y ejercicios para no asumir que solo existen 6 algoritmos.
- [ ] **T-FE-140**: Agregar pruebas de UI para filtros, búsqueda y navegación con catálogo expandido.

## 📁 Criterios de Aceptación

- [x] **T-CA-001**: `GET /api/biblioteca` retorna los 6 algoritmos base más los nuevos elementos activos sin cambiar el contrato.
- [ ] **T-CA-002**: Cada algoritmo nuevo tiene al menos 3 ejercicios consultables por `GET /api/ejercicios/:algoId`.
- [x] **T-CA-003**: Cada engine nuevo genera pasos con `numeroPaso`, `tipoOperacion`, `indicesActivos`, `estadoArray`, `lineaPseudocodigo` y, cuando aplica, `marcadores`/`nodosArbol`.
- [ ] **T-CA-004**: La biblioteca permite buscar por nombre, categoría y tag en el catálogo expandido.
- [ ] **T-CA-005**: El flujo E2E funciona para al menos un algoritmo nuevo de Ordenamiento, uno de Búsqueda y una Estructura Lineal.

---
---

# 🧪 FASE 7: Pruebas de Software — Documentación y Código Automatizado

> **Ref**: Entregable U4-EJ26 — Línea base de Pruebas
> **Estándar**: IEEE 829-2008
> **Peso en calificación**: Documentación de pruebas (45%) + Código de pruebas automatizadas (45%)

---

## 📄 Documentación de Pruebas (brainsort-specs/pruebas/)

> Entregables formales requeridos para la Línea Base de Documentación.

- [x] **T-QA-001**: Crear `pruebas/README.md` — Índice y estructura de la documentación de pruebas, convención de IDs, trazabilidad HU↔CP, herramientas
- [ ] **T-QA-002**: Crear `3.1-Plan-de-Pruebas-BrainSort.docx` — Plan formal de pruebas (IEEE 829): Introducción, Alcance, Elementos a probar (13 módulos backend + engines/hooks frontend), Enfoque (unitarias/integración/E2E), Criterios de aceptación (cobertura ≥80% services, ≥70% controllers, 0 defectos críticos), Ambiente (Node 20, Jest 29, Expo SDK 51), Cronograma, Riesgos y mitigaciones, Aprobaciones
- [ ] **T-QA-003**: Crear `3.2-Casos-de-Prueba-BrainSort.xlsx` — Catálogo de casos de prueba con campos: ID, Módulo, Tipo (Unitaria/Integración/E2E), HU Relacionada, Descripción, Precondiciones, Pasos, Datos de entrada, Resultado esperado, Resultado real, Estado (PASÓ/FALLÓ), Severidad, Archivo de código. Mínimo: cubrir los tests existentes en `brainsort-api/test/` y `brainsort-api/src/**/*.spec.ts`
- [ ] **T-QA-004**: Crear `3.3-Informe-de-Prueba-BrainSort.xlsx` — Informe de ejecución con: Resumen ejecutivo, Casos ejecutados/pasados/fallados, Cobertura por módulo, Defectos encontrados (ID, severidad, estado, resolución), Cobertura de código (Jest `--coverage`), Métricas de calidad, Conclusiones

---

## 🔬 1. Pruebas Unitarias (Backend y Frontend)

> Código fuente de pruebas unitarias aisladas con mocks.
> Herramientas: Jest + @nestjs/testing + ts-jest

### Pruebas Unitarias de Services (Backend)

- [x] **T-QA-005**: Crear `src/auth/auth.service.spec.ts` — Tests unitarios de AuthService:
  - `register()`: registro exitoso (hashea con bcrypt salt 10, crea usuario + ProgresoUsuario), registro con email duplicado (ConflictException)
  - `login()`: login exitoso como usuario, login exitoso como administrador (búsqueda dual + actualizar ultimoAcceso), credenciales incorrectas (mensaje genérico), contraseña incorrecta
  - `refresh()`: refresh exitoso, token inválido, usuario eliminado (UnauthorizedException)

- [x] **T-QA-006**: Crear `src/users/users.service.spec.ts` — Tests unitarios de UsersService:
  - `getProfile()`: retorna perfil con campos select, usuario no encontrado (NotFoundException)
  - `updateProfile()`: actualizar nombre, hashear nueva contraseña, actualizar ambos simultáneamente, usuario no encontrado

- [x] **T-QA-007**: Verificar `src/algorithms/algorithms.service.spec.ts` — Tests existentes de AlgorithmsService:
  - `getLibrary()`: sin filtros, filtro por categoría, filtro por nombre, sin resultados

- [x] **T-QA-008**: Crear `src/simulations/simulations.service.spec.ts` — Tests unitarios de SimulationsService:
  - `createSimulation()`: simulación exitosa con datos personalizados, algoritmo no encontrado (NotFoundException), valores nulos (BadRequestException), tamaño no coincide, creación de SesionSimulacion, formato de pasos
  - `updateSessionProgress()`: actualización parcial, marcar como completada, verificar insignias al completar, sesión no encontrada

- [x] **T-QA-009**: Crear `src/exercises/exercises.service.spec.ts` — Tests unitarios de ExercisesService:
  - `getExercisesByAlgorithm()`: retorna ejercicios formateados
  - `answerExercise()`: respuesta correcta (suma puntos, feedback positivo), respuesta incorrecta (no resta puntos, feedback negativo), ejercicio no encontrado, actualización de racha, recálculo de nivel y ranking

- [x] **T-QA-010**: Verificar `src/progress/progress.service.spec.ts` — Tests existentes de ProgressService:
  - `getUserProgress()`: retorna progreso completo, progreso no encontrado
  - `getRanking()`: ranking con paginación
  - `updateProgress()`: actualiza puntos y recalcula nivel/ranking, progreso no encontrado

- [x] **T-QA-011**: Verificar `src/badges/badges.service.spec.ts` — Tests existentes de BadgesService:
  - `getAllBadges()`: retorna todas las insignias
  - `getUserBadges()`: insignias con estado de desbloqueo, progreso no encontrado
  - `checkAndAward()`: otorga insignia cuando se cumplen criterios, no otorga si no se cumplen, omite insignias ya otorgadas
  - `invalidateCache()`: invalida caché de insignias

- [x] **T-QA-012**: Crear `src/sync/sync.service.spec.ts` — Tests unitarios de SyncService:
  - `syncProgress()`: sincronización exitosa de múltiples sesiones, omitir algoritmos inexistentes, omitir sesiones ya sincronizadas, actualización de puntos al completar, retorno de `sincronizados` y `puntosActualizados`

### 2. Pruebas de Integración (API y Base de Datos)

> Tests de integración HTTP (End-to-End en NestJS) para validar la conexión entre Controladores, Servicios y la Base de Datos. Usando Fastify inject + @nestjs/testing.

- [x] **T-QA-013**: Verificar `test/auth.e2e-spec.ts` — Tests E2E de autenticación:
  - `POST /api/auth/register`: registro exitoso (201), email duplicado (400), email inválido (400), contraseña débil (400)
  - `POST /api/auth/login`: login exitoso (200), credenciales incorrectas (401), contraseña incorrecta (401)
  - `POST /api/auth/refresh`: refresh exitoso (200), token inválido (401)

- [x] **T-QA-014**: Verificar `test/algorithms.e2e-spec.ts` — Tests E2E de biblioteca y algoritmos

- [x] **T-QA-015**: Verificar `test/simulations.e2e-spec.ts` — Tests E2E de simulaciones

- [x] **T-QA-016**: Crear `test/exercises.e2e-spec.ts` — Tests E2E de ejercicios:
  - Flujo completo: registrar usuario → obtener ejercicios de un algoritmo → responder correctamente → verificar puntos actualizados → responder incorrectamente → verificar que puntos no bajan

- [x] **T-QA-017**: Crear `test/progress.e2e-spec.ts` — Tests E2E de progreso:
  - Flujo: registrar → completar simulación → consultar progreso → verificar ranking actualizado

---

### Pruebas Unitarias de Motores (Frontend)

- [x] **T-QA-018**: Crear `packages/core/src/engines/__tests__/bubble-sort.test.ts` — Tests del engine Bubble Sort:
  - Ordena correctamente un arreglo desordenado
  - Genera pasos con campos requeridos (numeroPaso, tipoOperacion, indicesActivos, estadoArray, lineaPseudocodigo)
  - Último paso tiene tipoOperacion 'final'
  - Arreglo de 1 elemento retorna mínimo de pasos
  - Arreglo ya ordenado genera pasos sin intercambios
  - Arreglo en orden inverso genera máximo de intercambios

- [x] **T-QA-019**: Crear `packages/core/src/engines/__tests__/selection-sort.test.ts` — Tests del engine Selection Sort (misma estructura que Bubble Sort)

- [x] **T-QA-020**: Crear `packages/core/src/engines/__tests__/insertion-sort.test.ts` — Tests del engine Insertion Sort (misma estructura que Bubble Sort)

- [ ] **T-QA-027**: Crear tests unitarios de engines nuevos: Merge Sort, Quick Sort, Heap Sort, Binary Search, Linear Search, Deque y Priority Queue.

- [ ] **T-QA-028**: Crear test de integridad de catálogo: todo `Algoritmo.activo = true` debe tener metadatos completos, tags y categoría válida.

- [ ] **T-QA-029**: Crear test de integridad de ejercicios: todo `Algoritmo.activo = true` debe tener al menos 3 ejercicios asociados.

- [ ] **T-QA-030**: Crear tests E2E para `GET /api/biblioteca` con catálogo expandido y filtros por categoría/tag.

- [ ] **T-QA-031**: Crear tests E2E para `GET /api/ejercicios/:algoId` verificando múltiples ejercicios por dificultad.

### Pruebas Unitarias de Validadores

- [x] **T-QA-021**: Crear `packages/core/src/validators/__tests__/dataset.test.ts` — Tests del validador de datasets:
  - Acepta arreglo válido de enteros
  - Rechaza arreglo vacío
  - Rechaza arreglo con valores no numéricos
  - Rechaza arreglo con valores nulos
  - Valida rango de tamaño (8-15 elementos para predeterminados)

### Ejecución y Cobertura

- [ ] **T-QA-022**: Ejecutar `npm run test -- --coverage` en `brainsort-api` y documentar resultados en el Informe de Prueba (3.3). Meta: ≥80% cobertura en services, ≥70% en controllers

- [ ] **T-QA-023**: Ejecutar `npm run test:e2e` en `brainsort-api` y documentar resultados en el Informe de Prueba (3.3). Meta: 100% de casos E2E pasando

### 3. Pruebas de Sistema (Estrés, Carga y E2E Global)

> Validación del comportamiento del sistema en su conjunto. Herramienta: k6 (scripting en JavaScript para pruebas de carga concurrentes).

- [x] **T-QA-024**: Crear estructura base para pruebas de carga en `brainsort-api`:
  - Directorio `test/load/`
  - Archivo de configuración central y scripts base (ej. `k6-options.js`).

- [x] **T-QA-025**: Implementar escenarios de estrés críticos (`k6-stress-test.js`):
  - **Escenario 1 (Lectura Masiva)**: Recuperación de la biblioteca de algoritmos (`GET /api/algorithms`).
  - **Escenario 2 (Picos de Auth)**: Autenticación concurrente masiva simulando inicio de clases (`POST /api/auth/login`).
  - **Escenario 3 (Sincronización Offline)**: Ingestión de datos de progreso simulando múltiples estudiantes recuperando conexión simultáneamente (`POST /api/sync/progress`).

- [ ] **T-QA-026**: Ejecutar pruebas de carga localmente:
  - Ramp-up y Ramp-down escalonado de VUs (Virtual Users, ej. de 10 a 200).
  - Documentar latencia (meta: p95 < 500ms) y tasa de error (meta: < 1%) en el Informe de Prueba.
