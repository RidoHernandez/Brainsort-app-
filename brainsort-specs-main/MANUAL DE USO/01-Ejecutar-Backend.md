# Manual de Uso - Ejecutar Backend (brainsort-api)

Este documento describe el proceso detallado para ejecutar el backend de BrainSort en entorno de desarrollo.

## Requisitos Previos

- Node.js >= v20.x LTS
- npm v10.x+
- Docker Desktop (para PostgreSQL en contenedor)
- Git

## Advertencia Crítica: Colisión de Puertos PostgreSQL

**IMPORTANTE:** Antes de ejecutar el backend, asegúrate de que PostgreSQL local NO esté corriendo en el puerto 5432.

### Verificar si PostgreSQL local está corriendo:

```bash
netstat -an | findstr :5432
```

Si ves que el puerto 5432 está en uso por un proceso local de PostgreSQL (no Docker), DEBES detenerlo antes de continuar. Docker y PostgreSQL local usarán el mismo puerto (5432), causando conflictos.

### Cómo detener PostgreSQL local:

**Windows:**
1. Abre el Administrador de tareas
2. Busca procesos de PostgreSQL
3. Termina los procesos relacionados

**Alternativa usando pgAdmin:**
1. Abre pgAdmin
2. Haz clic derecho en el servidor PostgreSQL local
3. Selecciona "Stop Server"

## Proceso de Ejecución del Backend

### Paso 1: Navegar al directorio del backend

```bash
cd brainsort-api
```

### Paso 2: Instalar dependencias (si es necesario)

```bash
npm install
```

### Paso 3: Configurar variables de entorno

El archivo `.env` debe estar configurado con las credenciales de Docker:

```env
DB_USER=brainsort
DB_PASSWORD=brainsort_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brainsort_db
DATABASE_URL=postgresql://brainsort:brainsort_password@localhost:5432/brainsort_db?schema=public
JWT_SECRET=change-this-super-secret
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=3000
NODE_ENV=development
FRONTEND_URLS=http://localhost:8081,https://brainsort.vercel.app
```

### Paso 4: Iniciar Docker Desktop

Asegúrate de que Docker Desktop esté iniciado antes de ejecutar docker-compose.

### Paso 5: Iniciar PostgreSQL en Docker

```bash
docker-compose up -d
```

Este comando:
- Descarga la imagen `postgres:15-alpine` si no existe
- Crea e inicia el contenedor `brainsort_postgres`
- Expone el puerto 5432
- Crea el volumen `brainsort_pgdata` para persistencia de datos

### Paso 6: Verificar que el contenedor esté corriendo

```bash
docker ps
```

Deberías ver algo como:
```
CONTAINER ID   IMAGE                COMMAND                  CREATED        STATUS              PORTS                                         NAMES
7233d8163c50   postgres:15-alpine   "docker-entrypoint.s…"   18 hours ago   Up About a minute   0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp   brainsort_postgres
```

### Paso 7: Crear la base de datos (si no existe)

Si la base de datos `brainsort_db` no existe, puedes crearla usando el script `create-db.js`:

```bash
node create-db.js
```

O manualmente usando pgAdmin:
1. Conéctate al servidor localhost:5432 (usuario: brainsort, contraseña: brainsort_password)
2. Haz clic derecho en "Databases" → "Create" → "Database"
3. Nombre: `brainsort_db`
4. Clic en "Save"

### Paso 8: Ejecutar migraciones de Prisma

```bash
npx prisma migrate dev --name init
```

Este comando:
- Lee el schema de `prisma/schema.prisma`
- Crea las tablas en la base de datos según el modelo del dominio
- Genera el cliente de Prisma

**Nota:** Si el comando tarda mucho (WaitDelay expired), puedes usar:
```bash
npx prisma db push
```

### Paso 9: Ejecutar el backend en modo desarrollo

```bash
npm run start:dev
```

Este comando:
- Inicia NestJS en modo watch
- Recompila automáticamente cuando hay cambios en el código
- Inicia el servidor en el puerto 3000

### Paso 10: Verificar que el backend esté corriendo

Deberías ver algo como:
```
[Nest] 4472  - LOG [NestApplication] Nest application successfully started
```

Verifica que el puerto 3000 esté escuchando:
```bash
netstat -an | findstr :3000
```

Deberías ver:
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING
```

## Endpoints Disponibles

Una vez iniciado, el backend estará disponible en `http://localhost:3000` con los siguientes endpoints:

### Autenticación
- POST `/api/auth/register` - Registro de usuarios
- POST `/api/auth/login` - Inicio de sesión
- POST `/api/auth/refresh` - Renovación de token

### Usuarios
- GET `/api/users/me` - Obtener perfil del usuario actual
- PATCH `/api/users/me` - Actualizar perfil

### Algoritmos
- GET `/api/biblioteca` - Lista completa de algoritmos
- GET `/api/algoritmos/:id` - Detalle de algoritmo

### Simulaciones
- POST `/api/simulaciones` - Generar simulación paso a paso

### Ejercicios
- GET `/api/ejercicios/:algoId` - Lista ejercicios de un algoritmo
- POST `/api/ejercicios/:id/responder` - Evaluar respuesta

### Progreso
- GET `/api/progreso/me` - Progreso del usuario actual
- GET `/api/progreso/ranking` - Tabla de posiciones

### Insignias
- GET `/api/insignias` - Todas las insignias disponibles
- GET `/api/insignias/me` - Insignias desbloqueadas

### Offline
- GET `/api/modules/offline` - Lista módulos disponibles
- GET `/api/modules/offline/:id/download` - Descargar módulo

### Sincronización
- POST `/api/progress/sync` - Sincronizar progreso offline

## Documentación Swagger

La documentación completa de la API está disponible en:
```
http://localhost:3000/api/docs
```

## Solución de Problemas Comunes

### Error: "Port 5432 already in use"

**Causa:** PostgreSQL local está corriendo y usando el puerto 5432.

**Solución:** Detén PostgreSQL local (ver sección "Advertencia Crítica" arriba).

### Error: "Authentication failed against database server"

**Causa:** Las credenciales en `.env` no coinciden con las de Docker.

**Solución:** Verifica que `.env` tenga:
```
DB_USER=brainsort
DB_PASSWORD=brainsort_password
```

### Error: "database brainsort_db does not exist"

**Causa:** La base de datos no ha sido creada.

**Solución:** Ejecuta el script `create-db.js` o créala manualmente en pgAdmin.

### Error: "Nest cannot create the UsersModule instance"

**Causa:** Dependencia circular entre módulos.

**Solución:** Asegúrate de que `UsersModule` y `AuthModule` usen `forwardRef()`:
```typescript
// users.module.ts
imports: [PrismaModule, forwardRef(() => AuthModule)]

// auth.module.ts
imports: [PrismaModule, forwardRef(() => UsersModule)]
```

### Comandos de Prisma expiran (WaitDelay expired)

**Causa:** La base de datos está tardando en responder.

**Solución:** Usa `npx prisma db push` en lugar de `migrate dev`.

## Detener el Backend

Para detener el backend:
- Presiona `Ctrl+C` en la terminal donde está corriendo

## Detener PostgreSQL en Docker

```bash
docker-compose down
```

## Limpiar Todo (Docker + Backend)

```bash
# Detener contenedores
docker-compose down

# Eliminar volúmenes (cuidado: esto borra todos los datos)
docker-compose down -v

# Eliminar imágenes (opcional)
docker rmi postgres:15-alpine
```

## Resumen de Comandos

```bash
# 1. Navegar al directorio
cd brainsort-api

# 2. Instalar dependencias
npm install

# 3. Iniciar Docker Desktop
# (Manual desde el menú de Windows)

# 4. Iniciar PostgreSQL en Docker
docker-compose up -d

# 5. Crear base de datos (si es necesario)
node create-db.js

# 6. Ejecutar migraciones
npx prisma db push

# 7. Iniciar backend
npm run start:dev
```

## Referencias

- [Especificaciones del Backend](../plan-de-implementacion/01-backend-api.md)
- [Modelo del Dominio](../features/core-domain.spec.md)
- [Arquitectura y Auth](../features/architecture-auth.spec.md)
