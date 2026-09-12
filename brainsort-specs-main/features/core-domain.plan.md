# Core Domain Mapping & Plan

> **Fuente de verdad**: `BrainSort-Modelo_del_Dominio.docx` y `BrainSort-Modelo_del_Dominio.uml`

## 1. Architectural Impact
El dominio central describe los modelos de datos fundacionales tal y como fueron diseñados en el Modelo del Dominio oficial del proyecto. Cambios aquí afectan la capa física de base de datos.

## 2. Clases Conceptuales Identificadas (Según Documentación)

### BrainSort (Sistema)
- `versiónActual`: String

### Usuario
- `nombre`: String
- `correo`: String (Único)
- `rol`: String — Valores posibles: **Estudiante, Profesor, Autodidacta**
- `contraseña`: String (BCrypt hashed)

### Administrador
- `credencialesAdmin`: String
- `últimoAcceso`: Timestamp

### BibliotecaDeAlgoritmos
- `categorías`: String[] (Lista de categorías disponibles)
- `totalAlgoritmos`: Integer

### Algoritmo
- `nombre`: String (Único)
- `descripción`: Text
- `complejidadTiempo`: String (Notación Big O, ej: "O(n²)")
- `complejidadEspacio`: String (Notación Big O, ej: "O(1)")
- `pseudocódigo`: Text
- `categoría`: String

### Simulación
- `velocidadReproducción`: Float
- `estadoActual`: String — Valores: **Pausa, Play**
- `pasoActual`: Integer

### ConjuntoDeDatos
- `valores`: Array/Lista (arreglo numérico)
- `tipoOrigen`: String — Valores: **Predeterminado, Personalizado**
- `tamaño`: Integer

### EjercicioPredicción
- `pregunta`: Text
- `respuestaCorrecta`: String
- `dificultad`: String
- `feedbackPositivo`: Text
- `feedbackNegativo`: Text

### ProgresoUsuario
- `puntosTotales`: Integer
- `nivelActual`: Integer
- `rachaDías`: Integer
- `posiciónRanking`: Integer

### Insignia
- `nombre`: String
- `descripción`: Text
- `imagen`: String (URL/ruta)
- `criterioDesbloqueo`: String
- `fechaObtención`: DateTime

## 3. Asociaciones (Según Documentación)

| Origen | Relación | Destino | Multiplicidad |
|---|---|---|---|
| Usuario | utiliza | BrainSort | *:1 |
| BrainSort | mantiene | BibliotecaDeAlgoritmos | 1:1 |
| BibliotecaDeAlgoritmos | contiene | Algoritmo | 1:* |
| Usuario | visualiza | Simulación | 1:1 |
| Algoritmo | tiene descrita | Simulación | 1:1 |
| Simulación | opera sobre | ConjuntoDeDatos | 1:1..* |
| Usuario | completa | EjercicioPredicción | 1:1 |
| EjercicioPredicción | asociado a | Algoritmo | *:1 |
| Usuario | tiene | ProgresoUsuario | 1:1 |
| ProgresoUsuario | registra | Insignia | 1:0..* |
| Administrador | gestiona | Algoritmo | 1:* |

## 4. Reglas de Negocio (Derivadas de la Documentación)
- Los `valores` del ConjuntoDeDatos deben cumplir el formato esperado por el algoritmo (números enteros, sin caracteres no válidos) — según Glosario.
- La `velocidadReproducción` debe ser en múltiplos de 0.25 en el rango **[0.25, 2.0]** — según Glosario.
- El `tipoOrigen` del ConjuntoDeDatos es estrictamente **Predeterminado** o **Personalizado** — según Glosario y Modelo del Dominio.
- El `estadoActual` de la Simulación es **Pausa** o **Play** — según Modelo del Dominio.
- Las contraseñas deben almacenarse cifradas (bcrypt).
- Los roles del Usuario son **Estudiante, Profesor, Autodidacta** — según Modelo del Dominio y Glosario.
- El Administrador tiene un rol separado dedicado a gestionar contenido — según Glosario.

## 5. Contratos de Operación (Según BrainSort-Contratos.docx)
- **CO1 - getLibrary()**: Crea instancia de BibliotecaDeAlgoritmos con lista de algoritmos y descripciones, tarjetas por algoritmo, y rutas de aprendizaje. (Ref: HU-01)
- **CO2 - getAlgoritmo()**: Crea instancia del algoritmo seleccionado y asocia avance con la cuenta actual. (Ref: HU-02)
- **CO3 - getSimulation()**: Crea instancia de simulación perteneciente al algoritmo y asocia avance en la simulación con la cuenta actual. (Ref: HU-03)
