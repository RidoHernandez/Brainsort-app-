# Acceso Administrativo y Enrutamiento — Especificación Técnica

> **Fuente de verdad**: `BrainSort-Modelo_del_Dominio.docx`, `architecture-auth.spec.md`, `architecture-auth.plan.md`
> **Resuelve**: `tareas-faltantes.md` §5 (Gestión de Autenticación del Administrador)
> **Estado**: ✅ Definido — Pendiente aprobación del equipo

---

## 1. Contexto y Problema

### Situación Actual
- El modelo de datos define `Administrador` como entidad **separada** de `Usuario` (tabla `administradores` vs `usuarios`).
- El `AuthModule` en `01-backend-api.md` solo describe login que busca por `correo` en tabla `Usuario`.
- No existe flujo de redirección para administradores.
- El admin tiene campos propios: `credencialesAdmin`, `ultimoAcceso`.

### Decisión de Diseño
El administrador usará la **misma pantalla de Login** que el usuario estándar para mantener consistencia visual. La diferenciación ocurre en el **backend** y en la **redirección post-login** en el frontend.

---

## 2. Decisiones Arquitectónicas

### 2.1 Endpoint Único de Login

> **Decisión**: El admin usa el **mismo endpoint** `POST /api/auth/login`. No se crea un endpoint separado `/api/auth/admin/login`.

**Justificación**:
- Mantener una sola pantalla de login (consistencia UX).
- No revelar a posibles atacantes que existe una ruta de admin separada.
- Simplificar la lógica del frontend.

### 2.2 Estrategia de Búsqueda Dual

El `auth.service.login()` ejecuta una **búsqueda secuencial** en la base de datos local:

```
1. Buscar correo en tabla `usuarios`
2. Si NO se encuentra → Buscar correo en tabla `administradores`
3. Si NO se encuentra en ninguna → 401 Unauthorized
```

### 2.3 Payload del JWT con Discriminador de Tipo

El JWT incluye un campo `tipo` que diferencia entre Usuario y Administrador:

| Campo JWT | Usuario | Administrador |
|---|---|---|
| `sub` | `uuid` del usuario | `uuid` del administrador |
| `correo` | correo | correo |
| `tipo` | `"usuario"` | `"administrador"` |
| `rol` | `"Estudiante"` / `"Profesor"` / `"Autodidacta"` | `"Administrador"` |
| `credenciales` | *(no aplica)* | `"SUPER_ADMIN"` |

### 2.4 No Existe Relación Usuario ↔ Administrador

> **Decisión**: Un Administrador **NO** tiene un registro en la tabla `Usuario`. Son entidades completamente separadas según el Modelo del Dominio.

**Consecuencia**: El administrador no tiene `ProgresoUsuario`, no acumula XP, no aparece en el ranking.

---

## 3. Flujo de Login y Redirección

### 3.1 Diagrama de Flujo (Texto)

```
┌──────────────────────────────────────────────────────────────────┐
│                    PANTALLA DE LOGIN                             │
│                (LoginScreen.tsx — Compartida)                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  [correo]     ____________________________               │    │
│  │  [contraseña] ____________________________               │    │
│  │               [ Iniciar Sesión ]                          │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
              POST /api/auth/login
              { correo, contrasena }
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (auth.service)                        │
│                                                                  │
│  1. buscar correo en tabla `usuarios`                            │
│     ├── encontrado → verificar contraseña (bcrypt.compare)       │
│     │   ├── correcta → generar JWT con tipo="usuario"            │
│     │   └── incorrecta → 401 Unauthorized                        │
│     │                                                            │
│     └── NO encontrado                                            │
│         ↓                                                        │
│  2. buscar correo en tabla `administradores`                     │
│     ├── encontrado → verificar contraseña (bcrypt.compare)       │
│     │   ├── correcta → actualizar ultimoAcceso                   │
│     │   │              generar JWT con tipo="administrador"       │
│     │   └── incorrecta → 401 Unauthorized                        │
│     │                                                            │
│     └── NO encontrado → 401 Unauthorized                         │
│         (mensaje genérico: "Credenciales incorrectas",           │
│          NUNCA revelar "correo no encontrado" vs "pass incorrec")│
└────────────────────────┬─────────────────────────────────────────┘
                         │
       ┌─────────────────┴──────────────────┐
       │                                    │
       ▼                                    ▼
  tipo="usuario"                     tipo="administrador"
       │                                    │
       ▼                                    ▼
┌─────────────────────┐          ┌──────────────────────────┐
│  FRONTEND           │          │  FRONTEND                │
│                     │          │                          │
│  Guardar tokens     │          │  Guardar tokens          │
│  Navegar a:         │          │  Navegar a:              │
│  MainTabNavigator   │          │  AdminNavigator          │
│  (Dashboard/        │          │  (Panel de Admin)        │
│   Biblioteca)       │          │                          │
└─────────────────────┘          └──────────────────────────┘
```

### 3.2 Flujo Detallado Paso a Paso

| Paso | Acción | Responsable |
|---:|---|---|
| 1 | Usuario o admin ingresa `correo` y `contraseña` en `LoginScreen.tsx` | Frontend |
| 2 | Frontend envía `POST /api/auth/login { correo, contrasena }` | Frontend |
| 3 | Backend busca `correo` en tabla `usuarios` | Backend |
| 4a | **Si encuentra usuario**: verifica contraseña con `bcrypt.compare()` | Backend |
| 4b | **Si NO encuentra usuario**: busca `correo` en tabla `administradores` | Backend |
| 5 | **Si encuentra admin**: verifica contraseña, actualiza `ultimoAcceso` | Backend |
| 6 | Genera JWT con `tipo` correspondiente (`"usuario"` o `"administrador"`) | Backend |
| 7 | Retorna `{ token, refreshToken, usuario: { id, nombre, correo, rol, tipo } }` | Backend |
| 8 | Frontend almacena tokens en storage seguro (expo-secure-store / HttpOnly cookie) | Frontend |
| 9 | Frontend lee `tipo` del response (o decodifica JWT) | Frontend |
| 10a | **Si `tipo === "usuario"`**: navegar a `MainTabNavigator` (Dashboard/Biblioteca) | Frontend |
| 10b | **Si `tipo === "administrador"`**: navegar a `AdminNavigator` (Panel de Admin) | Frontend |

---

## 4. Contrato API — Login Actualizado

### POST `/api/auth/login`
**Acceso**: Público

**Request:**
```json
{
  "correo": "admin@brainsort.edu",
  "contrasena": "admin123"
}
```

**Response 200 — Usuario estándar:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "xXxXxXxXx...",
    "usuario": {
      "id": "uuid-123",
      "nombre": "Juan Pérez",
      "correo": "juan@mail.com",
      "rol": "Estudiante",
      "tipo": "usuario"
    }
  }
}
```

**Response 200 — Administrador:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "xXxXxXxXx...",
    "usuario": {
      "id": "uuid-admin-1",
      "nombre": "Admin BrainSort",
      "correo": "admin@brainsort.edu",
      "rol": "Administrador",
      "tipo": "administrador"
    }
  }
}
```

> **Campo nuevo `tipo`**: Se añade `tipo: "usuario" | "administrador"` al response de login para que el frontend pueda tomar la decisión de redirección sin decodificar el JWT.

**Errores:**
| Código | Causa |
|---|---|
| 401 | Credenciales incorrectas (mensaje genérico, sin revelar si falla el correo o la contraseña) |
| 401 | Credenciales invalidas con mensaje generico |
| 429 | Mejora futura: bloqueo temporal por multiples intentos fallidos si se incorpora rate limiting |

---

## 5. Lógica de Redirección en el Frontend

### 5.1 AppNavigator — Flujo de Decisión

```
AppNavigator.tsx
  │
  ├── ¿Tiene tokens válidos?
  │   ├── NO → AuthNavigator (Welcome → Login → Register)
  │   │
  │   └── SÍ → Leer "tipo" del contexto de auth
  │       ├── tipo === "usuario" → MainTabNavigator
  │       │   (Tabs: Biblioteca | Progreso | Offline | Perfil)
  │       │
  │       └── tipo === "administrador" → AdminNavigator
  │           (Tabs/Stack: Dashboard Admin | Gestión Algoritmos |
  │            Gestión Ejercicios | Ver Usuarios)
```

### 5.2 Hook useAuth — Cambios Requeridos

El hook `useAuth.ts` debe:
1. Almacenar `tipo` junto con los tokens y datos del usuario.
2. Exponer una propiedad `isAdmin: boolean` derivada de `tipo === "administrador"`.
3. En `login()`, parsear el `tipo` del response y almacenarlo en el contexto.
4. En `logout()`, limpiar `tipo` y redirigir a `AuthNavigator`.

### 5.3 Guard de Navegación

| Navegador | Condición de Acceso | Si Falla |
|---|---|---|
| `AuthNavigator` | No autenticado | Redirigir a MainTab o Admin |
| `MainTabNavigator` | Autenticado + `tipo === "usuario"` | Redirigir a Login |
| `AdminNavigator` | Autenticado + `tipo === "administrador"` | Redirigir a Login |

---

## 6. Interfaz de Administración

### 6.1 Pantallas del AdminNavigator

| Pantalla | Descripción | Endpoint Consumido |
|---|---|---|
| `AdminDashboardScreen` | Vista general: total de usuarios, algoritmos activos, ejercicios | Consultas agregadas |
| `ManageAlgorithmsScreen` | CRUD de algoritmos (listar, crear, editar, eliminar) | `GET/POST/PUT/DELETE /api/algoritmos` |
| `ManageExercisesScreen` | CRUD de ejercicios de predicción por algoritmo | Endpoint de gestión de ejercicios (por definir) |
| `ViewUsersScreen` | Lista de usuarios registrados (solo lectura) | `GET /api/admin/users` (por definir) |

> ⚠️ **Nota**: Las pantallas de administración son **nuevas** y no están definidas en el task breakdown actual. Deben agregarse como tareas adicionales.

### 6.2 Guards del Backend para Rutas Admin

El middleware `roles.guard.ts` + `@Roles('Administrador')` debe:
1. Verificar que el JWT contiene `tipo: "administrador"`.
2. Verificar que el `sub` (UUID) existe en tabla `administradores`.
3. Si falla cualquiera → `403 Forbidden`.

---

## 7. Seguridad

### 7.1 Principios

| Principio | Implementación |
|---|---|
| **Mensaje genérico en error de login** | Siempre retornar "Credenciales incorrectas", nunca "Correo no encontrado" ni "Contraseña incorrecta" |
| **No revelar la existencia de rutas admin** | La pantalla de login es idéntica. No hay botón "Login como Admin" |
| **Bloqueo por fuerza bruta** | Mejora recomendada. La linea base actual responde `401 Unauthorized` con mensaje generico; el bloqueo 429 requiere un guard de rate limiting no incluido en U4-EJ26. |
| **JWT con tipo** | El campo `tipo` en el JWT permite validar en el guard sin consultar la DB en cada request |
| **Último acceso** | Se registra `ultimoAcceso` del admin para trazabilidad/auditabilidad |

### 7.2 Servidor LOCAL

Dado que el sistema se diseña para servidor local:
- Si se implementa rate limiting en una iteracion futura, un Map en memoria es suficiente para desarrollo local; Redis solo seria necesario en despliegue horizontal.
- Los tokens JWT tienen la misma configuración: access 15min, refresh 7 días.
- CORS se configura para `localhost:8081` (Expo dev).

---

## 8. Impacto en Otros Módulos

### 8.1 Archivos a Modificar (SPECS, no código)

| Archivo | Cambio |
|---|---|
| `architecture-auth.spec.md` | Añadir sección sobre login de admin y redirección |
| `architecture-auth.plan.md` | Actualizar API response con campo `tipo` |
| `04-contratos-api.md` | Actualizar contrato de `POST /api/auth/login` con campo `tipo` |
| `task_breakdown.md` | Agregar tareas de `AdminNavigator` y pantallas admin |
| `tareas-faltantes.md` §5 | Marcar como ✅ resuelto |

### 8.2 Nuevas Tareas de Implementación

| ID | Tarea | Prioridad |
|---|---|---|
| T-BE-091 | Modificar `auth.service.login()` para búsqueda dual (usuarios → administradores) | 🔴 Alta |
| T-BE-092 | Añadir campo `tipo` al payload JWT y al response de login | 🔴 Alta |
| T-BE-093 | Actualizar `jwt.strategy.ts` para soportar `tipo` en el payload | 🔴 Alta |
| T-BE-094 | Actualizar `roles.guard.ts` para verificar `tipo: "administrador"` | 🔴 Alta |
| T-FE-118 | Crear `AdminNavigator.tsx` con stack de pantallas admin | 🔴 Alta |
| T-FE-119 | Modificar `AppNavigator.tsx` para redirección por `tipo` | 🔴 Alta |
| T-FE-120 | Actualizar `useAuth.ts` para almacenar y exponer `tipo` | 🔴 Alta |
| T-FE-121 | Crear `AdminDashboardScreen.tsx` | 🟡 Media |
| T-FE-122 | Crear `ManageAlgorithmsScreen.tsx` (CRUD) | 🟡 Media |
| T-FE-123 | Crear `ManageExercisesScreen.tsx` (CRUD) | 🟡 Media |
| T-FE-124 | Crear `ViewUsersScreen.tsx` (solo lectura) | 🟢 Baja |

---

## 9. Decisiones Abiertas

- [ ] **Endpoint de gestión de ejercicios**: ¿Se crea `POST/PUT/DELETE /api/ejercicios` para que el admin pueda crear/editar/eliminar ejercicios? Actualmente solo existe `GET` y `POST .../responder`. **Propuesta: sí, con `@Roles('Administrador')`.**
- [ ] **Endpoint de listado de usuarios**: ¿Se crea `GET /api/admin/users`? Actualmente no existe. **Propuesta: sí, paginado, solo lectura.**
- [ ] **¿Puede existir un "Admin + Usuario"?**: Según el modelo actual, son entidades separadas. **Decisión actual: NO, son mutuamente exclusivos.**
