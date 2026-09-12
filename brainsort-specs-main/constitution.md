# Constitution (Project Principles)

This document establishes the non-negotiable principles and conventions for the BrainSort project. AI agents and developers must adhere to these rules when contributing.

> **REGLA FUNDAMENTAL**: La documentación original del proyecto (archivos `.docx`, `.uml`, `.pdf`) es la **fuente de verdad absoluta**. Si existe cualquier contradicción entre estos archivos `.md` y la documentación original, **la documentación original tiene prioridad**.

## 1. Source of Truth (Fuentes de Verdad)
Los siguientes documentos definen las reglas del proyecto. Todo lo que se escriba en las SPECS debe ser un reflejo fiel de ellos:
- `BrainSort-Modelo_del_Dominio.uml` — Entidades, atributos y relaciones.
- `BrainSort-Modelo_del_Dominio.docx` — Descripción del modelo del dominio.
- `BrainSort-Documento_Arquitectura_Software.docx` — Arquitectura y decisiones técnicas.
- `BrainSort-Historias_de_Usuario.docx` — Requisitos funcionales desde la perspectiva del usuario.
- `BrainSort-Contratos.docx` — Contratos de operación del sistema (CO1, CO2, CO3).
- `BrainSort-Glosario.docx` — Definiciones estandarizadas de terminología.
- `BrainSort-Product_Vision_Board.pdf` — Visión del producto.
- `BrainSort-Diagramas/` — Diagramas de contexto, contenedores, componentes, clases, despliegue y secuencia.

## 2. Technical Stack (Según BrainSort-Documento_Arquitectura_Software.docx)

### Tipo de Aplicación y Patrones
- **Aplicación**: Móvil multiplataforma (Android, iOS, Web) desarrollada con **React Native** mediante **Expo**.
- **Patrón Frontend**: MVVM (Model-View-ViewModel) con Custom Hooks como ViewModel.
- **Arquitectura**: Clean Architecture — Lógica de algoritmos aislada en paquete independiente (`packages/core`).
- **Componentes**: Arquitectura Basada en Componentes con flujo unidireccional de datos (React).
- **Comunicación**: Cliente-Servidor mediante API REST documentada con **Swagger (OpenAPI)**.
- **Offline-First**: Persistencia local (SQLite en móvil, IndexedDB + Service Workers en web) para estudio sin conexión.

### Stack Tecnológico
- **Frontend**: React Native + Expo + React Native Web (TypeScript).
- **Backend API**: NestJS sobre Node.js con adaptador **Fastify** — API REST JSON.
- **Database**: PostgreSQL v15+ gestionada exclusivamente por **Prisma ORM**.
- **Authentication**: JWT (JSON Web Tokens) con access tokens y refresh tokens.
- **Motor de Visualización**: Cálculos matemáticos con **D3.js** (`packages/core`), renderizado con **react-native-svg**.
- **Sincronización**: **TanStack Query** para caché asíncrona y reintentos automáticos.
- **Generación de tipos**: **openapi-typescript** para sincronizar interfaces TypeScript desde el contrato Swagger.
- **Sandboxing**: `react-native-webview` (móvil) y Web Workers (web) para ejecución segura de código de usuario.
- **Containerización**: Docker para el backend `brainsort-api`.
- **WASM**: Emscripten SDK para compilar intérpretes C++/Python a WebAssembly (solo Android).

### Repositorios
- Frontend: https://github.com/BrainSort/brainsort-app
- Backend: https://github.com/BrainSort/brainsort-api

### Ambiente de Desarrollo
- **Runtime**: Node.js >=v20.x LTS, npm v10.x+.
- **IDE**: Visual Studio Code v1.8x+.
- **Plugins obligatorios**: ESLint & Prettier, Prisma, OpenAPI (Swagger) Editor, GitHub Copilot.
- **CASE**: PlantUML para diagramas, Prisma Studio para gestión visual de DB.
- **Base de datos local**: PostgreSQL v15+ con Prisma Studio.
- **Compilación WASM**: Emscripten SDK (emsdk) para módulos offline avanzados.

### Ambiente de Producción
- **Backend**: Railway (Cloud PaaS) — Contenedor Docker, NestJS + Fastify, Puerto 3000.
- **DB**: PostgreSQL administrado (Render/Railway), acceso exclusivo desde backend vía `DATABASE_URL`.
- **Frontend Web (PWA)**: Vercel o Netlify — Bundle estático + Service Workers + CDN.
- **Móvil**: Expo EAS Build → Google Play Store (Android) + Apple App Store (iOS).
- **Restricción APK/IPA**: < 50 MB iniciales. Módulos WASM opcionales (20-50 MB c/u, solo Android).

### CI/CD y DevOps
- **Ramas**: `main` (producción), `dev` (integración). Features en `feature/<nombre>`.
- **CI**: GitHub Actions — lint, test, build en cada PR hacia `dev` o `main`.
- **CD**: Build Docker + deploy automático al merge en `main`.
- **Migraciones**: `prisma migrate deploy` automático post-deploy.

## 3. Design & UX Principles
- **Aesthetics First**: BrainSort debe verse premium. Usar colores vibrantes, transiciones suaves y componentes dinámicos.
- **Animations**: Las barras de simulación deben animarse suavemente. Sin re-renders abruptos. Cálculos con D3.js, renderizado con react-native-svg.
- **Color Coding (Simulación)**:
  - Azul: Elemento inactivo / base.
  - Amarillo: Comparando.
  - Rojo: Intercambiando.
  - Verde: Posición final correcta.
  > *Nota: La HU-04 original menciona "rojo para comparar, verde para intercambiar" como ejemplos. El esquema de 4 colores documentado aquí es la extensión oficial aprobada para el proyecto.*
- **Accessibility**: Usar íconos además de colores para feedback (✓ para éxito, ✕ para errores). Feedback claro para daltónicos (según HU-06).
- **Rendimiento**: 24 FPS mínimo en dispositivos de gama media/baja (según HU-04).
- **UI Universal**: Interfaz unificada Web/Móvil. Se comparte 100% de componentes de UI entre plataformas.

## 4. Code Conventions
- **Idioma del dominio**: Usar español para la terminología del dominio tal como aparece en la documentación (ej: `Algoritmo`, `Simulación`, `ProgresoUsuario`, `EjercicioPredicción`).
- **Idioma del código**: Usar inglés para la estructura del código (variables, funciones, componentes).
- Todos los endpoints deben retornar respuestas JSON estándar con códigos HTTP apropiados.
- Las contraseñas nunca se almacenan en texto plano (usar bcrypt).
- Validación estricta de datos en backend mediante **DTO Pattern** de NestJS.
- Protocolo de comunicación: HTTPS con validación estricta.

## 5. Spec-Driven Methodology
- Toda nueva feature debe tener un `.spec.md` (Requisitos) y `.plan.md` (Arquitectura Técnica) antes de generar tareas de implementación.
- Actualizar los documentos de especificación cuando cambien las decisiones arquitectónicas.
- **Nunca inventar campos, entidades o relaciones que no existan en la documentación original**. Si se necesita algo nuevo, documentarlo como "Propuesta de extensión" claramente marcada.
