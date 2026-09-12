# Offline & Mobile Technical Plan

## 1. Architectural Impact
This feature adds a significant offline-first layer to the `brainsort-app` repository. The core simulation logic lives in `packages/core` (pure TypeScript, no UI dependencies), enabling local step generation without network calls. Storage and caching strategies differ per platform (Web vs Mobile).

### Storage Architecture
| Platform | Primary Storage | Cache Strategy | Module Storage |
|---|---|---|---|
| **Web (PWA)** | IndexedDB | Service Workers (Workbox) | IndexedDB |
| **iOS** | expo-sqlite | NSURLCache | Local filesystem |
| **Android** | expo-sqlite | OkHttp Cache | Local filesystem + optional WASM |

## 2. API Design (Offline Domain)

**Get Available Offline Modules:**
```json
// GET /api/modules/offline
// Response -> 200 OK
[
  {
    "algoritmoId": "uuid-bubble-sort",
    "nombre": "Bubble Sort",
    "tamanoKB": 12,
    "version": "1.0.0",
    "descargado": false
  }
]
```

**Download Module Assets (Direct JSON):**
```json
// GET /api/modules/offline/:id/download
// Response -> 200 OK
{
  "algoritmoId": "uuid-bubble",
  "version": "1.0.0",
  "meta": {
    "nombre": "Bubble Sort",
    "descripcion": "Algoritmo de ordenamiento...",
    "complejidadTiempo": "O(n²)",
    "complejidadEspacio": "O(1)",
    "categoria": "Ordenamiento"
  },
  "pseudocode": [
    { "line": 1, "text": "PARA i = 0 HASTA n-1", "indent": 0 }
  ],
  "ejercicios": [
    {
      "id": "uuid-ej-1",
      "pregunta": "Dado el arreglo [5, 2, 8, 1]...",
      "respuestaCorrecta": "[2, 5, 1, 8]",
      "dificultad": "Facil",
      "feedbackPositivo": "¡Correcto!",
      "feedbackNegativo": "Incorrecto."
    }
  ]
}
```

**Sync Progress (batch upload on reconnect):**
```json
// POST /api/progress/sync
{
  "sesiones": [
    {
      "algoritmoId": "uuid",
      "fechaInicio": "2026-04-06T10:00:00Z",
      "fechaFin": "2026-04-06T10:15:00Z",
      "pasosCompletados": 45
    }
  ]
}
// Response -> 200 OK
{
  "sincronizados": 1,
  "puntosActualizados": 5
}
```

## 3. Data Models
- **OfflineModule** (client-side only, not in PostgreSQL):
  - `algoritmoId`: UUID
  - `version`: String
  - `datosAlgoritmo`: JSON (pseudocode, complexity, metadata, ejercicios)
  - `fechaDescarga`: Date
  - `tamanoBytes`: Integer

- **PendingSync** (client-side queue):
  - `id`: UUID (local)
  - `tipo`: String (session | exercise_attempt)
  - `payload`: JSON
  - `fechaCreacion`: Date
  - `sincronizado`: Boolean

## 4. Third-Party Integrations

**Documentadas en la Arquitectura:**
- **Service Workers**: Para PWA caching en Web (según Doc. Arquitectura §2.4.2).
- **expo-sqlite**: SQLite database para persistencia offline en móvil (según Doc. Arquitectura §2.4.3).
- **expo-file-system**: Acceso al sistema de archivos para módulos WASM en móvil (según Doc. Arquitectura §2.4.3).
- **Expo EAS Build**: Pipeline CI/CD para builds móviles y actualizaciones OTA (según Doc. Arquitectura §2.4.3).
- **TanStack Query**: Caché asíncrona y reintentos automáticos para sincronización (según Doc. Arquitectura §Vista de Datos).

**⚠️ Propuestas de extensión (NO en documentación original):**
- **Workbox**: Tooling específico para Service Workers en PWA.
- **expo-secure-store**: Almacenamiento seguro de tokens en móvil.

## 5. WASM Strategy
> **Resuelto por Phase 5 Sandbox Plan**
- WASM ya **no** se usa para los módulos de simulación (eso usa `packages/core`).
- El uso de WASM está **confinado** al Sandbox/Mini-Juez como MicroPython compilado (assets estáticos) y JSCPP.
- **Android & iOS**: Funciona en ambos. iOS soporta WASM en Safari/WKWebView sin problemas a partir de iOS 15, rompiendo la restricción previamente documentada.
- **Web**: Funciona usando Service Workers y sandboxes estándar.

## 6. Security & Validation

**Documentadas en la Arquitectura:**
- Código de usuario aislado en `react-native-webview` (móvil) y Web Workers (web) — según Doc. Arquitectura §2.4.4.
- Validación estricta de datos mediante DTO Pattern en NestJS — según Doc. Arquitectura §2.4.4.

**⚠️ Propuestas de extensión (NO en documentación original):**
- Offline progress data is cryptographically signed client-side to prevent tampering before sync.
- expo-sqlite databases encrypted on-device.

---
*Note: This document explains "How" the feature relies on our stack. See the `.spec.md` for "What" the feature is.*
