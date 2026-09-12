# 01 — Backend API (`brainsort-api`)

> **Repositorio**: https://github.com/BrainSort/brainsort-api
> **Framework**: NestJS sobre Node.js con adaptador Fastify
> **Base de datos**: PostgreSQL v15+ con Prisma ORM
> **Lenguaje**: TypeScript

---

## 1. Estructura de Carpetas (Según Doc. Arquitectura §4.3)

```
brainsort-api/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # Lint, test, build en cada PR
│       └── cd.yml                  # Build Docker + deploy a Railway
├── prisma/
│   ├── schema.prisma               # Modelos de datos (ver 03-base-de-datos.md)
│   ├── migrations/                  # Historial de migraciones
│   └── seed.ts                      # Datos iniciales (algoritmos, ejercicios)
├── src/
│   ├── main.ts                      # Bootstrap: NestFactory + Fastify + Swagger
│   ├── app.module.ts                # Módulo raíz (importa todos los módulos)
│   │
│   ├── auth/                        # AuthModule
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts       # POST /auth/register, POST /auth/login
│   │   ├── auth.service.ts          # Lógica: bcrypt, JWT, refresh tokens
│   │   ├── dto/
│   │   │   ├── register.dto.ts      # { nombre, correo, rol, contrasena }
│   │   │   └── login.dto.ts         # { correo, contrasena }
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts    # Verificar token en cada request protegido
│   │   │   └── roles.guard.ts       # RBAC: @Roles('Administrador')
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts      # Passport JWT strategy
│   │   └── decorators/
│   │       └── roles.decorator.ts   # @Roles() custom decorator
│   │
│   ├── users/                       # UsersModule
│   │   ├── users.module.ts
│   │   ├── users.controller.ts      # GET /users/me, PATCH /users/me
│   │   ├── users.service.ts         # Consulta y actualización de perfiles
│   │   └── dto/
│   │       └── update-user.dto.ts
│   │
│   ├── algorithms/                  # AlgorithmsModule
│   │   ├── algorithms.module.ts
│   │   ├── algorithms.controller.ts # GET /biblioteca, GET /algoritmos/:id
│   │   ├── algorithms.service.ts    # Consulta de biblioteca, detalle y filtros
│   │   └── dto/
│   │       ├── create-algorithm.dto.ts   # Solo Administrador
│   │       └── algorithm-response.dto.ts
│   │
│   ├── simulations/                 # SimulationsModule
│   │   ├── simulations.module.ts
│   │   ├── simulations.controller.ts    # POST /simulaciones
│   │   ├── simulations.service.ts       # Genera pasos del algoritmo
│   │   ├── engines/                     # Lógica de cada algoritmo
│   │   │   ├── bubble-sort.engine.ts
│   │   │   ├── selection-sort.engine.ts
│   │   │   ├── insertion-sort.engine.ts
│   │   │   └── engine.interface.ts      # Interfaz común para todos
│   │   └── dto/
│   │       ├── create-simulation.dto.ts
│   │       └── simulation-step.dto.ts
│   │
│   ├── exercises/                   # ExercisesModule
│   │   ├── exercises.module.ts
│   │   ├── exercises.controller.ts  # GET /ejercicios/:algoId, POST /ejercicios/:id/responder
│   │   ├── exercises.service.ts     # Evalúa respuestas, calcula puntos
│   │   └── dto/
│   │       ├── answer-exercise.dto.ts
│   │       └── exercise-result.dto.ts
│   │
│   ├── progress/                    # ProgressModule
│   │   ├── progress.module.ts
│   │   ├── progress.controller.ts   # GET /progreso/me, GET /ranking
│   │   ├── progress.service.ts      # Actualiza puntos, niveles, rachas
│   │   └── dto/
│   │       └── progress-response.dto.ts
│   │
│   ├── badges/                      # BadgesModule
│   │   ├── badges.module.ts
│   │   ├── badges.controller.ts     # GET /insignias, GET /insignias/me
│   │   ├── badges.service.ts        # Verifica criterios de desbloqueo
│   │   └── dto/
│   │       └── badge-response.dto.ts
│   │
│   ├── offline/                     # OfflineModule
│   │   ├── offline.module.ts
│   │   ├── offline.controller.ts    # GET /modules/offline, GET /modules/offline/:id/download
│   │   ├── offline.service.ts       # Genera URLs de descarga
│   │   └── dto/
│   │       └── offline-module.dto.ts
│   │
│   ├── sync/                        # SyncModule
│   │   ├── sync.module.ts
│   │   ├── sync.controller.ts       # POST /progress/sync
│   │   ├── sync.service.ts          # Sincronización batch de progreso offline
│   │   └── dto/
│   │       └── sync-progress.dto.ts
│   │
│   ├── prisma/                      # PrismaModule (compartido)
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts        # Instancia centralizada de PrismaClient
│   │
│   └── common/                      # Utilidades compartidas
│       ├── filters/
│       │   └── http-exception.filter.ts
│       ├── interceptors/
│       │   └── transform.interceptor.ts   # Formato estándar de respuesta
│       └── pipes/
│           └── validation.pipe.ts         # DTO validation con class-validator
│
├── test/                             # Tests e2e
│   ├── auth.e2e-spec.ts
│   ├── algorithms.e2e-spec.ts
│   └── simulations.e2e-spec.ts
│
├── Dockerfile                        # Containerización para producción
├── docker-compose.yml                # Dev: API + PostgreSQL local
├── .env                              # Variables de entorno (DATABASE_URL, JWT_SECRET)
├── .env.example                      # Template sin valores sensibles
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## 2. Módulos NestJS — Detalle de Responsabilidades

### 2.1 AuthModule
**Responsabilidad**: Registro, login, gestión de tokens JWT y control de acceso por roles.

| Endpoint | Método | Acceso | Descripción | Contrato |
|---|---|---|---|---|
| `/api/auth/register` | POST | Público | Registra nuevo usuario | CO2 (parcial) |
| `/api/auth/login` | POST | Público | Autentica y retorna JWT | — |
| `/api/auth/refresh` | POST | Autenticado | Renueva access token | — |

**Lógica interna**:
- `register()`: Valida unicidad de `correo`, hashea contraseña con `bcrypt.hash(password, 10)`, crea Usuario y ProgresoUsuario (con valores default: puntosTotales=0, nivelActual=1, rachaDías=0).
- `login()`: Busca por `correo`, compara con `bcrypt.compare()`, genera `accessToken` (15min) y `refreshToken` (7 días).
- Si es Administrador: actualizar `últimoAcceso` con timestamp actual al autenticarse.

**DTOs**:
```typescript
// register.dto.ts
export class RegisterDto {
  @IsString() nombre: string;
  @IsEmail() correo: string;
  @IsEnum(['Estudiante', 'Profesor', 'Autodidacta']) rol: string;
  @IsString() @MinLength(8) contrasena: string;
}
```

### 2.2 UsersModule
**Responsabilidad**: Consulta y actualización del perfil del usuario autenticado.

| Endpoint | Método | Acceso | Descripción |
|---|---|---|---|
| `/api/users/me` | GET | Autenticado | Obtiene perfil del usuario actual |
| `/api/users/me` | PATCH | Autenticado | Actualiza nombre o contraseña |

### 2.3 AlgorithmsModule
**Responsabilidad**: Consulta del catálogo de algoritmos y detalle. Implementa **CO1 - getLibrary()** y **CO2 - getAlgoritmo()** en la línea base actual.

| Endpoint | Método | Acceso | Descripción | Contrato |
|---|---|---|---|---|
| `/api/biblioteca` | GET | Público/Autenticado | Lista completa de algoritmos por categoría | CO1 |
| `/api/algoritmos/:id` | GET | Autenticado | Detalle del algoritmo con pseudocódigo | CO2 |
| `/api/algoritmos` | POST | Administrador | Crear nuevo algoritmo | Extensión planificada; no implementada en U4-EJ26 |
| `/api/algoritmos/:id` | PUT | Administrador | Actualizar algoritmo existente | Extensión planificada; no implementada en U4-EJ26 |
| `/api/algoritmos/:id` | DELETE | Administrador | Eliminar algoritmo | Extensión planificada; no implementada en U4-EJ26 |

**Lógica CO1 - getLibrary()**:
1. Consultar todos los algoritmos agrupados por `categoría`.
2. Retornar: `categorías[]`, `totalAlgoritmos`, `algoritmos[]` (cada uno con nombre, descripción corta ≤140 chars, dificultad, complejidadTiempo, complejidadEspacio, categoría).
3. Para cada algoritmo crear una "tarjeta" con información resumida (incluye dificultad para indicador visual HU-01).

**Lógica CO2 - getAlgoritmo()**:
1. Obtener algoritmo por ID con pseudocódigo completo.
2. Crear/actualizar registro de ProgresoUsuario para asociar avance con cuenta actual.

### 2.4 SimulationsModule
**Responsabilidad**: Genera los pasos de ejecución de un algoritmo sobre un conjunto de datos. Implementa **CO3 - getSimulation()**.

| Endpoint | Método | Acceso | Descripción | Contrato |
|---|---|---|---|---|
| `/api/simulaciones` | POST | Autenticado | Genera simulación con pasos | CO3 |

**Lógica CO3 - getSimulation()**:
1. Recibir `algoritmoId` y `conjuntoDeDatos` (valores, tipoOrigen, tamaño).
2. Validar datos: sin caracteres no válidos, sin valores nulos, tamaño coherente.
3. Si `tipoOrigen === "Predeterminado"`: generar arreglo aleatorio de 8-15 elementos (no pre-ordenado).
4. Ejecutar el engine del algoritmo correspondiente paso a paso.
5. Por cada paso registrar: `numeroPaso`, `tipoOperacion` (comparacion/intercambio/insercion), `indicesActivos`, `estadoArray`, `lineaPseudocodigo`.
6. Retornar simulación completa con todos los pasos.
7. Asociar avance de simulación con la cuenta del usuario.

**Engines** (carpeta `engines/`) — Patrón **Engine + contenido en DB** (ver `cambios-en-documentacion/CHANGELOG.md` CDR-009 y CDR-010):

> Cada engine define metadatos operativos y lógica de ejecución. El texto del pseudocódigo y la configuración visual viven en DB para permitir correcciones de contenido sin redeploy. El engine solo emite `lineaPseudocodigo` y datos de paso.

```typescript
// engine.interface.ts
export interface AlgorithmDefinition {
  meta: {
    nombre: string;
    descripcion: string;
    complejidadTiempo: string;
    complejidadEspacio: string;
    categoria: string;
  };
  execute(data: number[]): SimulationStep[];
}

export interface SimulationMarker {
  index: number;
  label: string;
  role: string;
  color: string;
}

export interface SimulationTreeNode {
  index: number;
  value: number | null;
  level: number;
  position: number;
  label?: string;
}

export interface SimulationStep {
  numeroPaso: number;
  tipoOperacion: 'comparacion' | 'intercambio' | 'insercion' | 'final';
  indicesActivos: number[];
  estadoArray: number[];
  lineaPseudocodigo: number;  // Referencia al número en Algoritmo.pseudocodigo
  marcadores?: SimulationMarker[];
  nodosArbol?: SimulationTreeNode[];
}
```

```typescript
// engines/registry.ts — Registro centralizado de todos los engines
import { BubbleSort } from './bubble-sort.engine';
import { SelectionSort } from './selection-sort.engine';
import { InsertionSort } from './insertion-sort.engine';
import { MergeSort, QuickSort, HeapSort, BinarySearch, LinearSearch, Deque, PriorityQueue, SegmentTree } from './advanced-engines';

const ENGINES: Record<string, AlgorithmDefinition> = {
  'Bubble Sort': BubbleSort,
  'Selection Sort': SelectionSort,
  'Insertion Sort': InsertionSort,
  'Merge Sort': MergeSort,
  'Quick Sort': QuickSort,
  'Heap Sort': HeapSort,
  'Binary Search': BinarySearch,
  'Linear Search': LinearSearch,
  Deque,
  'Priority Queue': PriorityQueue,
  'Segment Tree': SegmentTree,
};

export function getEngine(nombre: string): AlgorithmDefinition {
  const engine = ENGINES[nombre];
  if (!engine) throw new NotFoundException(`Engine "${nombre}" no registrado`);
  return engine;
}
```

Cada engine implementa `AlgorithmDefinition`. **Timeout de seguridad**: si un engine excede 10 segundos, abortar con error (según HU-06). La respuesta de simulación incluye `pseudocode[]` normalizado desde `Algoritmo.pseudocodigo` en DB y puede incluir `marcadores[]`/`nodosArbol[]` derivados de `Algoritmo.visualizacion` o del engine.

### 2.5 ExercisesModule
**Responsabilidad**: CRUD y evaluación de ejercicios de predicción.

| Endpoint | Método | Acceso | Descripción |
|---|---|---|---|
| `/api/ejercicios/:algoId` | GET | Autenticado | Lista ejercicios de un algoritmo |
| `/api/ejercicios/:id/responder` | POST | Autenticado | Evalúa respuesta del usuario |

**Lógica de evaluación**:
1. Comparar `respuesta` del usuario con `respuestaCorrecta`.
2. Si correcto: retornar `feedbackPositivo`, sumar puntos al ProgresoUsuario.
3. Si incorrecto: retornar `feedbackNegativo`, no restar puntos.
4. Actualizar `rachaDías` si es la primera actividad del día.
5. Recalcular `posiciónRanking`.

### 2.6 ProgressModule
**Responsabilidad**: Consulta de progreso, ranking y estadísticas.

| Endpoint | Método | Acceso | Descripción |
|---|---|---|---|
| `/api/progreso/me` | GET | Autenticado | Progreso del usuario actual |
| `/api/progreso/ranking` | GET | Autenticado | Top N del leaderboard |

### 2.7 BadgesModule
**Responsabilidad**: Gestión de insignias y verificación de criterios.

| Endpoint | Método | Acceso | Descripción |
|---|---|---|---|
| `/api/insignias` | GET | Autenticado | Todas las insignias disponibles |
| `/api/insignias/me` | GET | Autenticado | Insignias desbloqueadas por el usuario |

### 2.8 OfflineModule + SyncModule
**Responsabilidad**: Servir módulos para descarga offline y sincronizar progreso.

| Endpoint | Método | Acceso | Descripción |
|---|---|---|---|
| `/api/modules/offline` | GET | Autenticado | Lista módulos disponibles para descarga |
| `/api/modules/offline/:id/download` | GET | Autenticado | URL de descarga del módulo |
| `/api/progress/sync` | POST | Autenticado | Sincronización batch de progreso offline |

### 2.9 PrismaModule (Compartido)
**Responsabilidad**: Proveer instancia centralizada de `PrismaService` a todos los módulos.

```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

---

## 3. Configuración de `main.ts`

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Prefix global
  app.setGlobalPrefix('api');

  // Validación DTO global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS — whitelist brainsort-app
  app.enableCors({
    origin: [
      'http://localhost:8081',         // Expo dev
      'https://brainsort.vercel.app',  // Producción Web
    ],
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('BrainSort API')
    .setDescription('API REST para la plataforma educativa BrainSort')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
```

---

## 4. Dependencias Principales (`package.json`)

```json
{
  "dependencies": {
    "@nestjs/common": "^10.x",
    "@nestjs/core": "^10.x",
    "@nestjs/platform-fastify": "^10.x",
    "@nestjs/swagger": "^7.x",
    "@nestjs/jwt": "^10.x",
    "@nestjs/passport": "^10.x",
    "@prisma/client": "^5.x",
    "bcrypt": "^5.x",
    "class-validator": "^0.14.x",
    "class-transformer": "^0.5.x",
    "passport": "^0.7.x",
    "passport-jwt": "^4.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "@nestjs/testing": "^10.x",
    "typescript": "^5.x",
    "eslint": "^8.57.0",
    "prettier": "^3.x"
  }
}
```

---

## 5. Variables de Entorno

```env
# .env.example
DATABASE_URL="postgresql://user:password@localhost:5432/brainsort?schema=public"
JWT_SECRET="your-jwt-secret-here"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3000
NODE_ENV="development"
FRONTEND_URLS="http://localhost:8081,https://brainsort.vercel.app"
```

---

## 6. Testing Strategy

- **Unit tests**: Cada service aislado con mocks de PrismaService.
- **E2E tests**: Endpoints probados con `@nestjs/testing` + base de datos de test.
- **Coverage mínimo**: 80% en services, 70% en controllers.
- **CI**: `npm run test` ejecutado automáticamente en cada PR (GitHub Actions).
