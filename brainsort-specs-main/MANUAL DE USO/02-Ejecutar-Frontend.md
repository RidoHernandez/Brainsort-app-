# Manual de Uso - Ejecutar Frontend (brainsort-app)

Este documento describe el proceso detallado para ejecutar el frontend de BrainSort en entorno de desarrollo.

## Requisitos Previos

- Node.js >= v20.x LTS
- npm v10.x+
- Expo CLI (instalado globalmente o via npx)
- Git

## Requisitos Adicionales

- Backend ejecutándose en `http://localhost:3000` (ver manual 01-Ejecutar-Backend.md)
- Docker Desktop con PostgreSQL corriendo (para el backend)

## Proceso de Ejecución del Frontend

### Paso 1: Navegar al directorio del frontend

```bash
cd brainsort-app
```

### Paso 2: Instalar dependencias (si es necesario)

```bash
npm install
```

**Nota:** Es posible que veas advertencias sobre paquetes desactualizados. Esto es normal en desarrollo y puede ignorarse o corregirse ejecutando `npm audit fix`.

### Paso 3: Configurar variables de entorno

El archivo `.env` debe estar configurado con la URL del backend:

```env
API_URL=http://localhost:3000
```

### Paso 4: Verificar que el backend esté corriendo

Antes de ejecutar el frontend, asegúrate de que el backend esté ejecutándose:

```bash
netstat -an | findstr :3000
```

Deberías ver:
```
TCP    0.0.0.0:3000           0.0.0.0:0              LISTENING
```

Si el backend no está corriendo, sigue el manual `01-Ejecutar-Backend.md`.

### Paso 5: Ejecutar el frontend en modo web

Para desarrollo local en navegador:

```bash
npm run web
```

Este comando:
- Inicia Expo en modo web
- Inicia Metro Bundler
- Abre el servidor en `http://localhost:8081`

### Paso 6: Abrir el frontend en el navegador

Una vez que Expo se haya iniciado, abre tu navegador en:

```
http://localhost:8081
```

**Nota:** Expo puede tardar unos segundos en iniciar completamente. Verás el mensaje "Waiting on http://localhost:8081" mientras se inicializa Metro Bundler.

### Paso 7: Verificar que el frontend esté funcionando

Deberías ver la aplicación BrainSort cargándose en el navegador.

## Modos de Ejecución Alternativos

### Ejecutar en modo Android (requiere emulador o dispositivo)

```bash
npm run android
```

### Ejecutar en modo iOS (requiere Mac y Xcode)

```bash
npm run ios
```

### Ejecutar con Expo Go (dispositivo físico)

1. Instala la app Expo Go en tu dispositivo móvil
2. Ejecuta:

```bash
npm start
```

3. Escanea el código QR desde la app Expo Go

## Estructura del Proyecto

```
brainsort-app/
├── src/                    # Código fuente
│   ├── components/       # Componentes React
│   ├── screens/          # Pantallas de la app
│   ├── navigation/       # Configuración de navegación
│   ├── hooks/            # Custom hooks
│   ├── services/         # Servicios de API
│   └── generated/        # Tipos generados desde API
├── packages/             # Paquetes del monorepo
│   └── core/            # Lógica de algoritmos (D3.js)
├── App.tsx              # Componente raíz
├── app.json             # Configuración de Expo
└── package.json          # Dependencias
```

## Scripts Disponibles

```bash
npm start              # Inicia Expo (modo interactivo)
npm run web            # Inicia Expo en modo web
npm run android         # Inicia Expo en modo Android
npm run ios             # Inicia Expo en modo iOS
npm run lint            # Ejecuta ESLint
npm run typecheck       # Verifica tipos TypeScript
```

## Generación de Tipos desde la API

Para generar automáticamente los tipos TypeScript desde la documentación Swagger del backend:

```bash
# Desde API local
npm run generate:api-types:local

# Desde API en producción
npm run generate:api-types
```

Esto genera el archivo `src/generated/api-types.ts` con las interfaces TypeScript correspondientes a los endpoints del backend.

## Solución de Problemas Comunes

### Error: "Port 8081 already in use"

**Causa:** Otra instancia de Expo está corriendo en el puerto 8081.

**Solución:** Detén la otra instancia o usa un puerto diferente:
```bash
npx expo start --web --port 8082
```

### Error: "Cannot connect to backend"

**Causa:** El backend no está corriendo o está en un puerto diferente.

**Solución:** 
1. Verifica que el backend esté corriendo: `netstat -an | findstr :3000`
2. Verifica que la variable `API_URL` en `.env` sea correcta
3. Revisa la consola del navegador para más detalles del error

### Error: "Metro Bundler stuck"

**Causa:** Metro Bundler puede bloquearse si hay problemas de caché o dependencias.

**Solución:** Limpia la caché de Metro:
```bash
npx expo start --web --clear
```

### Advertencia sobre versiones de paquetes

**Causa:** Algunos paquetes tienen versiones diferentes a las esperadas por Expo.

**Solución:** Estas advertencias pueden ignorarse en desarrollo. Para corregirlas, actualiza los paquetes:
```bash
npm install expo@latest
npm install react-native-web@latest
```

### Error: "Module not found"

**Causa:** Dependencias faltantes o problemas con el monorepo.

**Solución:** Reinstala las dependencias:
```bash
rm -rf node_modules
npm install
```

## Depuración

### Ver logs en consola

Los logs de la aplicación aparecerán en la consola donde se ejecutó `npm run web`.

### Depuración en navegador

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Console" para ver logs y errores
3. Usa la pestaña "Network" para ver las peticiones a la API

### React DevTools

Instala la extensión React DevTools en tu navegador para inspeccionar componentes y estado.

## Hot Reload

El frontend tiene hot reload habilitado. Cuando hagas cambios en el código, la aplicación se recargará automáticamente.

Si hot reload no funciona:
1. Presiona `r` en la terminal de Expo para recargar
2. Presiona `d` para abrir el menú de desarrollo
3. Presiona `Shift + R` para recargar completamente

## Detener el Frontend

Para detener el frontend:
- Presiona `Ctrl+C` en la terminal donde está corriendo

## Resumen de Comandos

```bash
# 1. Navegar al directorio
cd brainsort-app

# 2. Instalar dependencias
npm install

# 3. Verificar que el backend esté corriendo
# (en otra terminal)
cd brainsort-api
npm run start:dev

# 4. Ejecutar frontend
cd brainsort-app
npm run web

# 5. Abrir navegador
# http://localhost:8081
```

## Referencias

- [Especificaciones del Frontend](../plan-de-implementacion/02-frontend-app.md)
- [Documentación de Expo](https://docs.expo.dev/)
- [React Native Navigation](https://reactnavigation.org/)
