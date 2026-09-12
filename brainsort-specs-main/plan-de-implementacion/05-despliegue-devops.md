# 05 — Despliegue, CI/CD e Infraestructura

> **Fuente de verdad**: `BrainSort-Documento_Arquitectura_Software.docx` §2.4, §4.4
> **Filosofía**: DevOps con Agile-on-both-sides

---

## 1. Topología de Despliegue

```
┌──────────────────────────────────────────────────────────────────────┐
│                    INTERNET                                          │
│                                                                      │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────────────────────┐ │
│  │ Nodo 4      │   │ Nodo 3      │   │ Nodo 1                    │ │
│  │ Dispositivos│   │ Frontend Web│   │ Backend API               │ │
│  │ Móviles     │   │ (PWA)       │   │                           │ │
│  │             │   │             │   │ Railway (PaaS)            │ │
│  │ Android/iOS │   │ Vercel o    │   │ Docker Container          │ │
│  │ Expo EAS    │   │ Netlify     │   │ NestJS + Fastify          │ │
│  │ Build       │   │             │   │ Puerto 3000               │ │
│  │             │   │ Bundle      │   │ 512MB RAM / 0.5 vCPU      │ │
│  │ SQLite +    │   │ estático +  │   │                           │ │
│  │ WebView     │   │ Service     │   │    ┌─────────────────┐    │ │
│  │ sandbox     │   │ Workers +   ├───┤    │ Nodo 2          │    │ │
│  │             │   │ CDN         │   │    │ PostgreSQL v15+ │    │ │
│  └──────┬──────┘   └──────┬──────┘   │    │ Administrado    │    │ │
│         │                  │          │    │ (Railway PG)    │    │ │
│         │    REST/HTTPS    │          │    │                 │    │ │
│         └──────────────────┴──────────┘    │ Acceso solo     │    │ │
│                                            │ desde Nodo 1    │    │ │
│                                            │ vía DATABASE_URL│    │ │
│                                            └─────────────────┘    │ │
│                                                                    │ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Nodos de Despliegue (Según Doc. Arquitectura §4.4)

### Nodo 1 — Backend API (`brainsort-api`)
| Propiedad | Valor |
|---|---|
| **Plataforma** | Railway (Cloud PaaS) |
| **Contenedor** | Docker (Linux Debian slim) |
| **Runtime** | Node.js v20.x LTS |
| **Framework** | NestJS + Fastify |
| **Puerto** | 3000 |
| **Recursos mínimos** | 512 MB RAM / 0.5 vCPU |
| **Escalabilidad** | Vertical (aumentar RAM/CPU según demanda) |

### Nodo 2 — Base de Datos
| Propiedad | Valor |
|---|---|
| **Motor** | PostgreSQL v15+ |
| **Proveedor** | Railway PostgreSQL (administrado) |
| **Acceso** | Solo desde Nodo 1 vía `DATABASE_URL` |
| **Exposición** | Sin acceso público a internet |
| **ORM** | Prisma ORM (única capa de acceso) |
| **Respaldos** | Automáticos por la plataforma PaaS |

### Nodo 3 — Frontend Web (PWA)
| Propiedad | Valor |
|---|---|
| **Plataforma** | Vercel o Netlify |
| **Tipo** | Bundle estático (client-side rendering) |
| **Características** | Service Workers activos, CDN global |
| **Offline** | IndexedDB para persistencia local |
| **Deploy** | Automático al detectar cambios en `main` |

### Nodo 4 — Dispositivos Móviles
| Propiedad | Android | iOS |
|---|---|---|
| **Build** | Expo EAS Build | Expo EAS Build |
| **Distribución** | Google Play Store | Apple App Store |
| **APK/IPA** | < 50 MB | < 50 MB |
| **Sandbox** | react-native-webview + WASM | react-native-webview (solo JS/TS) |
| **Persistencia** | expo-sqlite + expo-file-system | expo-sqlite |
| **WASM** | ✅ Descarga opcional (20-50 MB/módulo) | ❌ Excluido (restricciones Apple) |

---

## 3. Dockerfile (`brainsort-api`)

```dockerfile
# Dockerfile
FROM node:20-slim AS base
WORKDIR /app

# Instalar dependencias
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Build
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Producción
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Docker Compose (Desarrollo Local)
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://brainsort:brainsort@db:5432/brainsort
      JWT_SECRET: dev-secret
      NODE_ENV: development
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run start:dev

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: brainsort
      POSTGRES_PASSWORD: brainsort
      POSTGRES_DB: brainsort
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 4. CI/CD con GitHub Actions

### Workflow 1 — CI (Integración Continua)
**Se dispara en**: Todo PR hacia `dev` o `main`.
**Si cualquier paso falla, el PR queda bloqueado.**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [dev, main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: brainsort_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npx prisma generate

      # Verificación de formato y reglas
      - run: npm run lint

      # Pruebas unitarias
      - run: npm run test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/brainsort_test

      # Verificar que TypeScript compila sin errores
      - run: npm run build
```

### Workflow 2 — CD (Entrega Continua)
**Se dispara en**: Merge exitoso a `main`.

```yaml
# .github/workflows/cd.yml
name: CD

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Build de imagen Docker con tag de versión
      - name: Build Docker image
        run: docker build -t brainsort-api:${{ github.sha }} .

      # Push al registry de Railway
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: brainsort-api

      # Ejecutar migraciones post-deploy
      - name: Run Prisma migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      # Notificación
      - name: Notify deployment
        run: echo "✅ Deployed brainsort-api @ ${{ github.sha }}"
```

### Workflow para Frontend (`brainsort-app`)
Vercel/Netlify gestionan su propio pipeline automáticamente al detectar cambios en `main`. No se requiere workflow adicional de GitHub Actions.

Para compilaciones móviles:
```bash
# Android build
eas build --platform android --profile production

# iOS build
eas build --platform ios --profile production

# Submit a stores
eas submit --platform android
eas submit --platform ios
```

---

## 5. Estrategia de Ramas

```
main ─────────────────────────────────────── (Producción estable)
  │
  └── dev ────────────────────────────────── (Integración continua)
       │
       ├── feature/auth-module ────────── PR → dev
       ├── feature/library-ui ─────────── PR → dev
       ├── feature/simulation-engine ──── PR → dev
       ├── feature/gamification ────────── PR → dev
       └── feature/offline-sync ────────── PR → dev
```

**Reglas**:
- Features en ramas `feature/<nombre>`.
- **Hooks Locales**: Validación de nomenclatura obligatoria de ramas e invocación del linter mediante `Husky` (pre-commit script).
- PR **revisado por al menos un integrante** antes de merge a `dev`.
- `dev` se merge a `main` cuando se acumulan features estables.
- Protección de ramas en `main` y `dev` (no push directo).

---

## 6. Variables de Entorno por Ambiente

### brainsort-api

| Variable | Dev | Producción |
|---|---|---|
| `DATABASE_URL` | `postgresql://brainsort:brainsort@localhost:5432/brainsort` | `postgresql://...@railway.app/brainsort` |
| `JWT_SECRET` | `dev-secret` | Secret de Railway |
| `JWT_EXPIRATION` | `15m` | `15m` |
| `JWT_REFRESH_EXPIRATION` | `7d` | `7d` |
| `PORT` | `3000` | `3000` |
| `NODE_ENV` | `development` | `production` |
| `FRONTEND_URLS` | `http://localhost:8081` | `https://brainsort.vercel.app` |

### brainsort-app

| Variable | Dev | Producción |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://localhost:3000/api` | `https://brainsort-api.railway.app/api` |

---

## 7. Seguridad en Producción (Según Doc. Arquitectura §2.4.4)

| Aspecto | Implementación |
|---|---|
| **Sandboxing** | Código de usuario en `react-native-webview` (móvil) / Web Workers (web). Nunca en hilo principal. |
| **DTO Validation** | Todo input al backend validado por `class-validator` (NestJS DTO Pattern). |
| **CORS** | Backend whitelist solo dominios de `brainsort-app`. |
| **HTTPS** | Obligatorio en producción. Railway provee certificados SSL automáticos. |
| **DB Access** | Solo desde Nodo 1 vía `DATABASE_URL`. Sin exposición pública. |
| **Tokens** | Access token 15min + refresh token 7 días. HttpOnly cookies preferido en web. |
| **Contraseñas** | BCrypt con salt rounds = 10. Nunca en texto plano. |

---

## 8. Monitorización y Observabilidad

> ⚠️ **Propuesta de extensión** — No detallado explícitamente en la documentación original, pero mencionado como "Monitorización y Retroalimentación Continua" en la filosofía DevOps.

| Herramienta | Propósito |
|---|---|
| Railway Metrics | CPU, RAM, Network del contenedor |
| Prisma Metrics | Query performance, connection pool |
| Swagger UI (`/api/docs`) | Documentación viva de la API |
| Console logs (structured) | NestJS Logger para troubleshooting |

---

## 9. Checklist de Primer Despliegue

- [ ] Crear organización `BrainSort` en GitHub
- [ ] Crear repositorio `brainsort-api`
- [ ] Crear repositorio `brainsort-app`
- [ ] Configurar protección de ramas (`main`, `dev`)
- [ ] Crear proyecto en Railway
- [ ] Provisionar PostgreSQL administrado en Railway
- [ ] Configurar variables de entorno en Railway
- [ ] Ejecutar `prisma migrate deploy` + `prisma db seed`
- [ ] Verificar Swagger UI en `https://brainsort-api.railway.app/api/docs`
- [ ] Crear proyecto en Vercel/Netlify para el frontend web
- [ ] Configurar `EXPO_PUBLIC_API_URL` para producción
- [ ] Ejecutar `eas build` para Android e iOS
- [ ] Publicar primera versión en Google Play Store (Internal Testing)
- [ ] Publicar primera versión en Apple App Store (TestFlight)
