# Tareas de Implementación: Offline & Mobile

## Backend Tasks
- [ ] Implementar el endpoint `GET /api/modules/offline` en `controllers/` (lista módulos disponibles para descarga).
- [ ] Implementar el endpoint `GET /api/modules/offline/:id/download` en `controllers/` (genera signed URLs para S3).
- [ ] Implementar el endpoint `POST /api/progress/sync` en `controllers/` (sincronización batch de progreso offline).
- [ ] Configurar infraestructura propia del proyecto para alojar assets de algoritmos y módulos WASM (según Doc. Arquitectura).
- [ ] Implementar generación de signed URLs con expiración de 1 hora (`@aws-sdk/s3-request-presigner`).
- [ ] Implementar verificación de integridad (SHA-256 checksum) para módulos descargados.
- [ ] Pruebas unitarias para endpoints de módulos offline y sincronización.

## Frontend Tasks (Web - PWA)
- [ ] Configurar Service Workers con Workbox para caching de assets estáticos y datos de algoritmos.
- [ ] Implementar almacenamiento de módulos offline en IndexedDB.
- [ ] Desarrollar el Componente de Offline Manager (lista de módulos, indicador de descarga, almacenamiento usado).
- [ ] Implementar detección de conectividad y cola de sincronización (PendingSync).
- [ ] Verificar fallback de WASM a JavaScript cuando `WebAssembly` no está disponible.
- [ ] Configurar el manifest PWA para instalación como app nativa.

## Frontend Tasks (Mobile - React Native + Expo)
- [ ] Configurar expo-sqlite para persistencia offline.
- [ ] Configurar expo-file-system para almacenamiento de módulos WASM (Android only).
- [ ] Configurar expo-secure-store para almacenamiento seguro de tokens.
- [ ] Implementar Offline Manager adaptado a UI móvil (descarga selectiva, progreso, espacio disponible).
- [ ] Implementar sincronización automática al recuperar conectividad.
- [ ] Configurar Expo EAS Build para CI/CD (iOS + Android).
- [ ] Configurar OTA updates via Expo.
- [ ] Verificar constraint de APK < 50 MB.

## Integration
- [ ] Conectar ambos entornos y verificar flujo de trabajo (End-to-End).
- [ ] Verificar flujo: descargar módulo → desconectar internet → simular algoritmo → reconectar → sincronizar progreso.
- [ ] Verificar que WASM se excluye correctamente del build de iOS.
- [ ] Verificar que el fallback JS funciona cuando WASM no está disponible.
