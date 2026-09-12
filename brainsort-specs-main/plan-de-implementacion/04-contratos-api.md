# 04 — Contratos de API REST

> **Puente entre repositorios**: `brainsort-app` ↔ `brainsort-api`
> **Protocolo**: HTTPS / API REST JSON
> **Documentación**: Swagger (OpenAPI) generado automáticamente por NestJS
> **Sincronización de tipos**: `openapi-typescript` genera `src/generated/api-types.ts` en el frontend

---

## Convenciones Globales

### Formato de respuesta estándar
```typescript
// Éxito (200, 201)
{
  "data": { ... },
  "message": "Operación exitosa"
}

// Error (400, 401, 403, 404, 500)
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request"
}
```

### Headers requeridos
```http
Content-Type: application/json
Authorization: Bearer <accessToken>  // En endpoints protegidos
```

### Prefijo global
Todos los endpoints usan el prefijo `/api`.

---

## 1. Auth Module (`/api/auth`)

### POST `/api/auth/register`
**Acceso**: Público
**Contrato**: Crea nuevo Usuario + ProgresoUsuario (CO2 parcial)

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@mail.com",
  "rol": "Estudiante",
  "contrasena": "miPassword123"
}
```

**Validaciones (DTO):**
| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Requerido, min 2 chars |
| `correo` | string | Requerido, formato email, único |
| `rol` | enum | `Estudiante` \| `Profesor` \| `Autodidacta` |
| `contrasena` | string | Requerido, min 8 chars |

**Response 201:**
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

**Errores:**
| Código | Causa |
|---|---|
| 409 | `correo` ya registrado |
| 400 | Validación de DTO falló |

---

### POST `/api/auth/login`
**Acceso**: Público

**Request:**
```json
{
  "correo": "juan@mail.com",
  "contrasena": "miPassword123"
}
```

**Response 200:**
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

**Errores:**
| Código | Causa |
|---|---|
| 401 | Credenciales incorrectas |

---

### POST `/api/auth/refresh`
**Acceso**: Autenticado (refreshToken)

**Request:**
```json
{
  "refreshToken": "xXxXxXxXx..."
}
```

**Response 200:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "nuevoRefreshToken..."
  }
}
```

---

## 2. Users Module (`/api/users`)

### GET `/api/users/me`
**Acceso**: Autenticado

**Response 200:**
```json
{
  "data": {
    "id": "uuid-123",
    "nombre": "Juan Pérez",
    "correo": "juan@mail.com",
    "rol": "Estudiante",
    "createdAt": "2026-04-06T10:00:00Z"
  }
}
```

### PATCH `/api/users/me`
**Acceso**: Autenticado

**Request (parcial):**
```json
{
  "nombre": "Juan P. Actualizado"
}
```

---

## 3. Algorithms Module (`/api/biblioteca`, `/api/algoritmos`)

### GET `/api/biblioteca` — CO1: getLibrary()
**Acceso**: Público o Autenticado
**Contrato**: CO1 — Obtener Biblioteca de Algoritmos

**Response 200:**
```json
{
  "data": {
    "categorias": ["Ordenamiento", "Busqueda", "EstructurasLineales", "EstructurasArboles"],
    "totalAlgoritmos": 14,
    "algoritmos": [
      {
        "id": "uuid-bubble",
        "nombre": "Bubble Sort",
        "descripcion": "Algoritmo de ordenamiento que compara elementos adyacentes...",
        "dificultad": "Facil",
        "complejidadTiempo": "O(n²)",
        "complejidadEspacio": "O(1)",
        "categoria": "Ordenamiento"
      }
    ]
  }
}
```

**Frontend**: La `descripcion` se trunca a ≤140 chars en la tarjeta (HU-01). La `dificultad` se muestra como indicador visual (estrellas o colores).

---

### GET `/api/algoritmos/:id` — CO2: getAlgoritmo()
**Acceso**: Público o autenticado
**Contrato**: CO2 — Obtener entorno de aprendizaje del algoritmo

**Response 200:**
```json
{
  "data": {
    "id": "uuid-bubble",
    "nombre": "Bubble Sort",
    "descripcion": "Algoritmo de ordenamiento que compara elementos adyacentes e intercambia si están desordenados. Recorre el arreglo múltiples veces...",
    "dificultad": "Facil",
    "complejidadTiempo": "O(n²)",
    "complejidadEspacio": "O(1)",
    "categoria": "Ordenamiento",
    "pseudocode": [
      { "line": 1, "text": "PARA i = 0 HASTA n-1", "indent": 0 },
      { "line": 2, "text": "PARA j = 0 HASTA n-i-1", "indent": 1 },
      { "line": 3, "text": "SI arreglo[j] > arreglo[j+1]", "indent": 2 },
      { "line": 4, "text": "INTERCAMBIAR(arreglo[j], arreglo[j+1])", "indent": 3 }
    ]
  }
}
```

> **Nota de implementación actual**: `GET /api/algoritmos/:id` normaliza el `pseudocodigo` persistido en la DB (`numero/codigo`) al contrato consumido por el frontend (`line/text/indent`). El módulo offline usa la misma forma `line/text/indent`.

**Efecto secundario**: Este endpoint de detalle no crea sesión. La sesión se registra al crear una simulación en `POST /api/simulaciones`.

---

### POST `/api/algoritmos` (Extensión administrativa planificada)
**Acceso**: Administrador

**Request:**
```json
{
  "nombre": "Merge Sort",
  "descripcion": "Algoritmo divide y vencerás que divide el arreglo por mitades...",
  "dificultad": "Medio",
  "complejidadTiempo": "O(n log n)",
  "complejidadEspacio": "O(n)",
  "categoria": "Ordenamiento"
}
```

> **Estado U4-EJ26**: No forma parte de los endpoints implementados en la línea base actual. La API verificada expone `GET /api/biblioteca` y `GET /api/algoritmos/:id`.

---

## 4. Simulations Module (`/api/simulaciones`)

### POST `/api/simulaciones` — CO3: getSimulation()
**Acceso**: Autenticado
**Contrato**: CO3 — Obtener simulación del algoritmo

**Request:**
```json
{
  "algoritmoId": "uuid-bubble",
  "conjuntoDeDatos": {
    "valores": [5, 2, 8, 1, 9, 3],
    "tipoOrigen": "Personalizado",
    "tamano": 6
  }
}
```

**Validaciones (DTO):**
| Campo | Tipo | Reglas |
|---|---|---|
| `algoritmoId` | UUID | Requerido, debe existir en DB |
| `conjuntoDeDatos.valores` | number[] | Requerido, solo enteros, sin nulls |
| `conjuntoDeDatos.tipoOrigen` | enum | `Predeterminado` \| `Personalizado` |
| `conjuntoDeDatos.tamano` | number | Debe coincidir con `valores.length` |

Si `tipoOrigen === "Predeterminado"`: el backend genera arreglo aleatorio de 8-15 elementos (no pre-ordenado). Se ignora `valores` del request.

**Response 200:**
```json
{
  "data": {
    "simulacion": {
      "velocidadReproduccion": 1.0,
      "estadoActual": "Pausa",
      "pasoActual": 0
    },
    "pseudocode": [
      { "line": 1, "text": "MergeSort(arreglo, L, R)", "indent": 0 },
      { "line": 2, "text": "Si L == R: retornar", "indent": 1 },
      { "line": 3, "text": "M = piso((L + R) / 2)", "indent": 1 },
      { "line": 4, "text": "MergeSort(arreglo, L, M)", "indent": 1 },
      { "line": 5, "text": "MergeSort(arreglo, M + 1, R)", "indent": 1 },
      { "line": 6, "text": "Merge(arreglo, L, M, R)", "indent": 1 },
      { "line": 7, "text": "izq = copia de arreglo[L..M]", "indent": 2 },
      { "line": 8, "text": "der = copia de arreglo[M+1..R]", "indent": 2 },
      { "line": 9, "text": "i = 0; j = 0; k = L", "indent": 2 },
      { "line": 10, "text": "Mientras i < tam(izq) y j < tam(der)", "indent": 2 },
      { "line": 11, "text": "Si izq[i] <= der[j]: arreglo[k] = izq[i]; i++", "indent": 3 },
      { "line": 12, "text": "Si no: arreglo[k] = der[j]; j++", "indent": 3 },
      { "line": 13, "text": "k++", "indent": 3 },
      { "line": 14, "text": "Copiar sobrantes de izq o der al arreglo", "indent": 2 }
    ],
    "totalPasos": 12,
    "pasos": [
      {
        "numeroPaso": 1,
        "tipoOperacion": "comparacion",
        "indicesActivos": [0, 1],
        "estadoArray": [5, 2, 8, 1, 9, 3],
        "lineaPseudocodigo": 3,
        "marcadores": [
          { "index": 0, "label": "j", "role": "activo", "color": "#F5A623" },
          { "index": 1, "label": "j+1", "role": "activo", "color": "#F5A623" }
        ]
      },
      {
        "numeroPaso": 2,
        "tipoOperacion": "intercambio",
        "indicesActivos": [0, 1],
        "estadoArray": [2, 5, 8, 1, 9, 3],
        "lineaPseudocodigo": 4
      }
    ]
  }
}
```

**Campos opcionales de `pasos[]`:**

| Campo | Tipo | Uso |
|---|---|---|
| `marcadores` | `{ index, label, role, color }[]` | Etiquetas y colores derivados de `Algoritmo.visualizacion`; permite mostrar variables sobre barras y estados de recursión en espera. |
| `nodosArbol` | `{ index, value, level, position, label }[]` | Layout explícito para árboles. Segment Tree lo usa para evitar inferir nodos desde un arreglo plano. |

**Ejemplo Segment Tree:**

```json
{
  "numeroPaso": 24,
  "tipoOperacion": "final",
  "indicesActivos": [0],
  "estadoArray": [11, 3, 8, 2, 1, 5, 3],
  "lineaPseudocodigo": 7,
  "nodosArbol": [
    { "index": 0, "value": 11, "level": 0, "position": 0, "label": "[0,3]" },
    { "index": 1, "value": 3, "level": 1, "position": 0, "label": "[0,1]" },
    { "index": 2, "value": 8, "level": 1, "position": 1, "label": "[2,3]" }
  ]
}
```

**Tipos de operación:**
| tipoOperacion | Color Frontend | Ícono Accesibilidad |
|---|---|---|
| `comparacion` | Amarillo (#F5A623) | 🔍 |
| `intercambio` | Rojo (#D0021B) | ↔️ |
| `insercion` | Rojo (#D0021B) | ⬇️ |
| `final` | Verde (#7ED321) | ✓ |

**Errores:**
| Código | Causa |
|---|---|
| 404 | `algoritmoId` no existe |
| 400 | Datos de entrada inválidos (caracteres no numéricos, valores nulos) |
| 408 | Timeout — el engine tardó >10 segundos (bucle infinito) |

---

## 5. Exercises Module (`/api/ejercicios`)

### GET `/api/ejercicios/:algoritmoId`
**Acceso**: Autenticado

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid-ej-1",
      "tipo": "OrdenarBarras",
      "pregunta": "Dado el arreglo [5, 2, 8, 1], ¿cuál es el resultado después de la primera pasada completa de Bubble Sort?",
      "dificultad": "Facil",
      "algoritmoId": "uuid-bubble",
      "opciones": null,
      "contenido": {
        "inicial": [5, 2, 8, 1],
        "pasoObjetivo": "Primer intercambio",
        "objetivo": [2, 5, 8, 1]
      }
    }
  ]
}
```

Los tipos soportados por la seed expandida son `CompletarPseudocodigo`, `OrdenarBarras` y `PrediccionTexto`. No se deben sembrar preguntas 100% abiertas sin datos de evaluación automática.

### POST `/api/ejercicios/:id/responder`
**Acceso**: Autenticado

**Request:**
```json
{
  "respuesta": "[2, 5, 1, 8]"
}
```

**Response 200 (correcto):**
```json
{
  "data": {
    "correcto": true,
    "feedback": "¡Correcto! Bubble Sort mueve el elemento mayor al final en cada pasada.",
    "feedbackPositivo": "¡Correcto! Bubble Sort mueve el elemento mayor al final en cada pasada.",
    "puntosGanados": 10,
    "puntosTotales": 350,
    "rachaDias": 4,
    "posicionRanking": 12,
    "nivelActual": 3
  }
}
```

**Response 200 (incorrecto):**
```json
{
  "data": {
    "correcto": false,
    "feedback": "Incorrecto. Recuerda que Bubble Sort compara elementos adyacentes y los intercambia si están desordenados.",
    "feedbackNegativo": "Incorrecto. Recuerda que Bubble Sort compara elementos adyacentes y los intercambia si están desordenados.",
    "puntosGanados": 0,
    "puntosTotales": 340,
    "rachaDias": 4,
    "posicionRanking": 12,
    "nivelActual": 2
  }
}
```

---

## 6. Progress Module (`/api/progreso`)

### GET `/api/progreso/me`
**Acceso**: Autenticado

**Response 200:**
```json
{
  "data": {
    "puntosTotales": 350,
    "nivelActual": 5,
    "rachaDias": 12,
    "posicionRanking": 3,
    "ultimaActividad": "2026-04-06T15:30:00Z",
    "insignias": [
      { "nombre": "Primer Paso", "imagen": "/badges/first-step.svg", "fechaObtencion": "2026-03-15T10:00:00Z" },
      { "nombre": "Racha de 7", "imagen": "/badges/streak-7.svg", "fechaObtencion": "2026-04-01T08:00:00Z" }
    ],
    "simulacionesCompletadas": 8,
    "ejerciciosCorrectos": 15,
    "ejerciciosTotales": 20
  }
}
```

### GET `/api/progreso/ranking`
**Acceso**: Autenticado

**Query params:** `?limit=20&offset=0`

**Response 200:**
```json
{
  "data": {
    "ranking": [
      { "posicion": 1, "nombre": "María López", "puntosTotales": 1200, "nivelActual": 10 },
      { "posicion": 2, "nombre": "Carlos Ruiz", "puntosTotales": 980, "nivelActual": 8 },
      { "posicion": 3, "nombre": "Juan Pérez", "puntosTotales": 350, "nivelActual": 5 }
    ],
    "total": 45
  }
}
```

---

## 7. Badges Module (`/api/insignias`)

### GET `/api/insignias`
**Acceso**: Autenticado
**Response**: Lista de todas las insignias disponibles en el sistema.

### GET `/api/insignias/me`
**Acceso**: Autenticado
**Response**: Insignias desbloqueadas por el usuario actual con `fechaObtencion`.

---

## 8. Offline Module (`/api/modules`)

> **CDR-004**: Sin bucket externo. El backend genera el JSON del módulo directamente desde el engine registrado.

### GET `/api/modules/offline`
**Acceso**: Autenticado

**Response 200:**
```json
{
  "data": [
    {
      "algoritmoId": "uuid-bubble",
      "nombre": "Bubble Sort",
      "tamanoKB": 12,
      "version": "1.0.0",
      "descargado": false
    }
  ]
}
```

### GET `/api/modules/offline/:id/download`
**Acceso**: Autenticado

> Retorna directamente el contenido del módulo como JSON. El frontend lo guarda en `expo-sqlite` (móvil) o `IndexedDB` (web) para uso sin conexión.

**Response 200:**
```json
{
  "data": {
    "algoritmoId": "uuid-bubble",
    "version": "1.0.0",
    "meta": {
      "id": "uuid-bubble",
      "nombre": "Bubble Sort",
      "descripcion": "Algoritmo de ordenamiento que compara elementos adyacentes...",
      "dificultad": "Facil",
      "complejidadTiempo": "O(n²)",
      "complejidadEspacio": "O(1)",
      "categoria": "Ordenamiento"
    },
    "pseudocode": [
      { "line": 1, "text": "PARA i = 0 HASTA n-1", "indent": 0 },
      { "line": 2, "text": "PARA j = 0 HASTA n-i-1", "indent": 1 },
      { "line": 3, "text": "SI arreglo[j] > arreglo[j+1]", "indent": 2 },
      { "line": 4, "text": "INTERCAMBIAR(arreglo[j], arreglo[j+1])", "indent": 3 }
    ],
    "ejercicios": [
      {
        "id": "uuid-ej-1",
        "pregunta": "Dado el arreglo [5, 2, 8, 1], ¿cuál es el resultado después de la primera pasada?",
        "respuestaCorrecta": "[2, 5, 1, 8]",
        "dificultad": "Facil",
        "feedbackPositivo": "¡Correcto! ...",
        "feedbackNegativo": "Incorrecto. ..."
      }
    ]
  }
}
```

> **Nota**: El engine de ejecución (`execute()`) NO se descarga — vive en `packages/core` del frontend y ya está instalado como parte de la app. Solo se descargan los datos (meta, pseudocódigo, ejercicios) para poder visualizarlos sin conexión.

---

## 9. Sync Module (`/api/progress`)

### POST `/api/progress/sync`
**Acceso**: Autenticado

**Request:**
```json
{
  "sesiones": [
    {
      "algoritmoId": "uuid-bubble",
      "fechaInicio": "2026-04-06T10:00:00Z",
      "fechaFin": "2026-04-06T10:15:00Z",
      "pasosCompletados": 45,
      "completada": true
    }
  ]
}
```

**Response 200:**
```json
{
  "data": {
    "sincronizados": 1,
    "puntosActualizados": 5
  }
}
```

---

## 10. Flujo de Autenticación Completo

```
Frontend                                        Backend
   │                                               │
   ├── POST /api/auth/register ──────────────────►│
   │   { nombre, correo, rol, contrasena }        │
   │                                               │── bcrypt.hash(contrasena)
   │                                               │── INSERT Usuario
   │                                               │── INSERT ProgresoUsuario
   │                                               │── jwt.sign({ userId, rol, tipo: 'usuario' })
   │◄── 201 { token, refreshToken, usuario } ─────│
   │                                               │
   │── Guardar token (expo-secure-store / cookie) │
   │                                               │
   │── GET /api/biblioteca ───────────────────────►│
   │   Authorization: Bearer <token>               │
   │                                               │── jwt.verify(token)
   │                                               │── SELECT * FROM algoritmos
   │◄── 200 { categorias, algoritmos[] } ─────────│
   │                                               │
   │── (token expira después de 15min)            │
   │── POST /api/auth/refresh ────────────────────►│
   │   { refreshToken }                            │
   │◄── 200 { token, refreshToken } ──────────────│
```
