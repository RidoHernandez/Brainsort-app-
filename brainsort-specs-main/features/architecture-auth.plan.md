# Architecture & Auth Technical Plan

> **Fuente de verdad**: `BrainSort-Modelo_del_Dominio.docx`, `BrainSort-Documento_Arquitectura_Software.docx`, `Brainsort-Repositorios.txt`

## 1. Architectural Impact
El sistema se ejecuta como dos servicios independientes:
- `brainsort-app`: Frontend SPA — https://github.com/BrainSort/brainsort-app
- `brainsort-api`: Backend REST API — https://github.com/BrainSort/brainsort-api

## 2. API Design (Auth Domain)
```json
// POST /api/auth/register
{
  "nombre": "Juan",
  "correo": "estudiante@mail.com",
  "rol": "Estudiante",
  "contrasena": "secret"
}

// POST /api/auth/login
{
  "correo": "estudiante@mail.com",
  "contrasena": "secret"
}

// Response -> 200 OK
{
  "token": "eyJhbGciOi...",
  "refreshToken": "xXxXx",
  "usuario": { "id": "uuid", "nombre": "Juan", "rol": "Estudiante" }
}
```

## 3. Data Models (Según Modelo del Dominio)
- **Usuario**: `nombre`, `correo` (Unique), `rol` (Estudiante/Profesor/Autodidacta), `contraseña` (BCrypt).
- **Administrador**: `credencialesAdmin`, `últimoAcceso` (Timestamp) — entidad separada que gestiona Algoritmos.

## 4. Security & Validation
- **Middleware**: `verifyToken` y `isAdmin` para control de acceso.
- **Passwords**: `bcrypt.hash(password, 10)` antes de inserción en DB.
- **Storage**: Preferiblemente `HttpOnly` cookies para mitigar XSS.
- **CORS**: `brainsort-api` debe listar en whitelist el dominio de `brainsort-app`.
- **Login de Administrador**: Al autenticarse un admin, actualizar `últimoAcceso` con timestamp actual.
