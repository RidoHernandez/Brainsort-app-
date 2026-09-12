# Architecture & Auth Specification

> **Fuente de verdad**: `BrainSort-Documento_Arquitectura_Software.docx`, `BrainSort-Modelo_del_Dominio.docx`, `BrainSort-Glosario.docx`

## 1. Context & Motivation
BrainSort requiere una base segura que soporte distintos roles de Usuario (Estudiante, Profesor, Autodidacta) y un Administrador de sistema separado. Se necesita una arquitectura que separe presentación de lógica (Frontend vs Backend) y un sistema de autenticación stateless. La arquitectura documentada define React Native + Expo como frontend multiplataforma, NestJS + Fastify como backend API, y PostgreSQL + Prisma ORM como capa de datos.

## 2. User Experience (UX)
- Los usuarios se registran con `nombre`, `correo`, `rol` y `contraseña`.
- Los roles de Usuario son: **Estudiante, Profesor/Docente, Autodidacta** (según Modelo del Dominio y Glosario).
- El Administrador es un rol separado con `credencialesAdmin` y `últimoAcceso` (según Modelo del Dominio).
- **Visitante/Invitado**: Según el Glosario, "Si es invitado, solo puede visualizar; no modificar datos del sistema". Esto corresponde a un usuario no autenticado que navega la app sin registrarse — no es un rol formal en la base de datos.
- Los administradores gestionan la Biblioteca de Algoritmos: agregar nuevos algoritmos, modificar visualizaciones, corregir descripciones teóricas y actualizar ejercicios de predicción (según Glosario).
- Login exitoso redirige al Dashboard/Biblioteca principal.
- Roles restringen elementos de UI (Admins ven "Gestionar Algoritmos").

## 3. Core Requirements
**In-Scope:**
- **Architecture (según Doc. Arquitectura)**: Aplicación móvil multiplataforma con React Native + Expo. Backend NestJS + Fastify. PostgreSQL + Prisma ORM. Patrón MVVM con Custom Hooks. API REST documentada con Swagger (OpenAPI).
- **Repositorios**: Frontend (`brainsort-app`) y Backend (`brainsort-api`) — según Brainsort-Repositorios.txt.
- **Authentication**: JWT con access tokens de corta duración y refresh tokens.
- **Roles de Usuario**: Estudiante, Profesor/Docente, Autodidacta (según documentación).
- **Rol de Administrador**: Entidad separada con credencialesAdmin y últimoAcceso.
- **Security**: BCrypt hashing, HTTPS, DTO Pattern para validación y mensajes genéricos ante credenciales inválidas. El rate limiting queda como mejora recomendada si se incorpora un guard dedicado.
- **Sandboxing**: Código de usuario aislado en `react-native-webview` (móvil) y Web Workers (web) — según Doc. Arquitectura.
- **Sincronización**: TanStack Query para caché asíncrona y reintentos automáticos.

**Out-of-Scope:**
- OAuth2 (Google, GitHub logins).
- Sesiones colaborativas en tiempo real (WebSockets).

## 4. Edge Cases & Error Handling
- JWT inválido → `401 Unauthorized`, el cliente intenta usar Refresh Token o fuerza relogin.
- Intentos fallidos de login → `401 Unauthorized` con mensaje genérico. Bloqueo temporal por múltiples intentos queda fuera de la línea base implementada actual.
- Registro con correo existente → `409 Conflict`.
