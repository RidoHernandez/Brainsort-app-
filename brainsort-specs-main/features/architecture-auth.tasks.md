# Tareas de Implementación: Architecture & Auth

## Backend Tasks
- [ ] Implementar el endpoint `POST /api/auth/register` en `controllers/`.
- [ ] Implementar el endpoint `POST /api/auth/login` en `controllers/`.
- [ ] Implementar middleware `verifyToken` para validar JWT.
- [ ] Implementar middleware `isAdmin` para control de acceso basado en roles (RBAC).
- [ ] Implementar lógica de Refresh Token (7 días) y Access Token (15 minutos).
- [ ] Implementar bloqueo temporal por multiples intentos fallidos de login (mejora futura fuera de la linea base U4-EJ26).
- [ ] Validaciones de entrada (correo formato válido, contraseña mínimo seguro).
- [ ] Configurar hashing con `bcrypt` (salt >= 10) antes de inserción en DB.
- [ ] Configurar CORS para whitelist del dominio `brainsort-app`.
- [ ] Pruebas unitarias para registro, login, refresh token y middlewares.

## Frontend Tasks
- [ ] Crear la solicitud Axios/Fetch para `POST /api/auth/register`.
- [ ] Crear la solicitud Axios/Fetch para `POST /api/auth/login`.
- [ ] Desarrollar el Componente Visual de Registro (nombre, correo, contraseña).
- [ ] Desarrollar el Componente Visual de Login (correo, contraseña).
- [ ] Implementar almacenamiento seguro de tokens (HttpOnly cookies o localStorage con short lifespan).
- [ ] Implementar flujo de renovación silenciosa con Refresh Token ante `401 Unauthorized`.
- [ ] Manejar el estado de autenticación global (contexto/store).
- [ ] Implementar restricción de elementos UI por rol (Admin ve "Manage Algorithms").
- [ ] Manejar errores: `409 Conflict` (email duplicado), `401 Unauthorized`, bloqueo temporal.
- [ ] Confirmar compatibilidad y color coding con `constitution.md`.

## Integration
- [ ] Conectar ambos entornos y verificar flujo de trabajo (End-to-End).
- [ ] Verificar flujo completo: Registro → Login → Dashboard con token válido.
- [ ] Verificar que roles restringen acceso correctamente (estudiante vs administrador).
