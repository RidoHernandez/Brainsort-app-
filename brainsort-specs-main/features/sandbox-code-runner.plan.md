# Sandbox / Mini Juez Local — Plan de Implementación

> **Feature**: Ejecución local de código Python y C++ para ejercicios algorítmicos
> **Versión**: V1 (versión simple / prueba de concepto)
> **Profundización**: V2 (juez completo con más test cases, editor avanzado, etc.)
> **Plataformas**: Android ✅ | iOS ✅ | Web ✅

---

## 1. Concepto

El estudiante escribe código (Python o C++) para resolver un ejercicio algorítmico. El código se ejecuta **localmente** en el dispositivo (sin servidor) dentro de un WebView sandboxed. El resultado se compara con la salida esperada para determinar si es correcto.

```
┌─ React Native ────────────────────────────────────┐
│                                                    │
│  ┌──────────────┐     postMessage(código)         │
│  │  CodeEditor  │ ──────────────────────┐         │
│  │  (TextInput  │                       ▼         │
│  │   con syntax │    ┌─────────────────────────┐  │
│  │   highlight) │    │  WebView (sandboxed)    │  │
│  └──────────────┘    │                         │  │
│                      │  Python: MicroPython    │  │
│  ┌──────────────┐    │          WASM (~300KB)  │  │
│  │  Resultado   │    │                         │  │
│  │  ✅ 3/3 pass │ ◄──│  C++: JSCPP (~200KB)   │  │
│  │  📊 Output   │    │       (intérprete JS)   │  │
│  └──────────────┘    └─────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 2. Intérpretes Elegidos (V1)

| Lenguaje | Intérprete | Tipo | Tamaño | Justificación |
|---|---|---|---|---|
| **Python** | MicroPython WASM | WebAssembly | ~300 KB | Soporta listas, loops, dicts, funciones — suficiente para algorítmica. 37x más liviano que Pyodide |
| **C++** | JSCPP | JavaScript puro | ~200 KB | Intérprete C++ escrito en JS — NO necesita WASM. Soporta: `iostream`, `vector`, `algorithm`, loops, funciones. Ideal para ejercicios simples |

### ¿Por qué NO Pyodide?
Pyodide (CPython completo) pesa ~11 MB. Para V1 con ejercicios algorítmicos simples, MicroPython cubre todo lo necesario. Pyodide se puede evaluar para V2 si se necesitan ejercicios más avanzados.

### ¿Por qué JSCPP para C++ y no Emscripten+Clang?
Compilar Clang a WASM produciría un binario de ~100MB+. JSCPP es un intérprete ligero (~200KB) que soporta el subset de C++ necesario para algoritmos (arrays, loops, funciones, iostream). Limitación: no soporta templates avanzados ni STL completa — aceptable para V1.

---

## 3. Arquitectura

### 3.1 Componentes (Frontend — `brainsort-app`)

```
src/
├── features/
│   └── sandbox/
│       ├── SandboxScreen.tsx          # Pantalla principal del mini juez
│       ├── components/
│       │   ├── CodeEditor.tsx         # Editor de código con syntax highlighting básico
│       │   ├── LanguageSelector.tsx   # Toggle Python / C++
│       │   ├── TestResults.tsx        # Lista de test cases con ✅/❌
│       │   └── OutputConsole.tsx      # stdout del código ejecutado
│       ├── runner/
│       │   ├── sandbox-webview.html   # HTML que carga los intérpretes
│       │   ├── useSandboxRunner.ts    # Hook: envía código al WebView, recibe resultado
│       │   └── types.ts              # Tipos: TestCase, RunResult, Language
│       └── data/
│           └── challenges.ts          # Ejercicios hardcoded para V1
```

### 3.2 Sin Backend

El sandbox V1 es **100% frontend**. No hay endpoints nuevos en `brainsort-api`. Los ejercicios de código están hardcoded en `challenges.ts`. En V2 se podrán servir desde la API.

### 3.3 Flujo de Datos

```
1. Usuario selecciona ejercicio → SandboxScreen carga challenge de challenges.ts
2. Usuario escribe código en CodeEditor
3. Usuario presiona "Ejecutar" → useSandboxRunner.ts envía via postMessage:
   { action: "run", language: "python", code: "...", testCases: [...] }
4. WebView recibe el mensaje → ejecuta código con el intérprete adecuado
5. Para cada testCase:
   a. Prepara el input (lo inyecta como stdin o argumento)
   b. Ejecuta el código con timeout (5s)
   c. Captura stdout
   d. Compara stdout.trim() === expectedOutput.trim()
6. WebView retorna via postMessage:
   { results: [{ passed: true, output: "[1,2,5,8]", expected: "[1,2,5,8]", timeMs: 12 }] }
7. TestResults.tsx muestra ✅/❌ por cada test case
```

---

## 4. Detalle del WebView Sandbox

### 4.1 `sandbox-webview.html`

```html
<!DOCTYPE html>
<html>
<head>
  <!-- MicroPython WASM -->
  <script src="micropython.js"></script>
  <!-- JSCPP (C++ interpreter) -->
  <script src="JSCPP.es5.min.js"></script>
</head>
<body>
<script>
  // Escuchar mensajes de React Native
  window.addEventListener('message', async (event) => {
    const { action, language, code, testCases } = JSON.parse(event.data);
    
    if (action === 'run') {
      const results = [];
      
      for (const tc of testCases) {
        try {
          const output = await executeCode(language, code, tc.input);
          results.push({
            passed: output.trim() === tc.expectedOutput.trim(),
            output: output.trim(),
            expected: tc.expectedOutput.trim(),
            error: null,
          });
        } catch (err) {
          results.push({
            passed: false,
            output: null,
            expected: tc.expectedOutput.trim(),
            error: err.message,
          });
        }
      }
      
      // Retornar resultados a React Native
      window.ReactNativeWebView.postMessage(JSON.stringify({ results }));
    }
  });

  async function executeCode(language, code, input) {
    if (language === 'python') {
      return runMicroPython(code, input);
    } else if (language === 'cpp') {
      return runJSCPP(code, input);
    }
  }

  function runMicroPython(code, input) {
    // MicroPython: capturar stdout
    let output = '';
    const mp = await loadMicroPython({
      stdout: (text) => { output += text; },
      stdin: () => input,
    });
    mp.runPython(code);
    return output;
  }

  function runJSCPP(code, input) {
    // JSCPP: ejecutar C++ con stdin simulado
    let output = '';
    JSCPP.run(code, input, {
      stdio: {
        write: (text) => { output += text; },
      },
    });
    return output;
  }
</script>
</body>
</html>
```

### 4.2 Timeout de Seguridad

Cada ejecución tiene un **timeout de 5 segundos**. Si el código del usuario tiene un loop infinito, el WebView mata la ejecución y retorna error.

```typescript
// useSandboxRunner.ts
const TIMEOUT_MS = 5000;

const runWithTimeout = (webViewRef, payload) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Tiempo límite excedido (5s). ¿Tienes un bucle infinito?'));
    }, TIMEOUT_MS);

    // onMessage del WebView resuelve la promesa
    onResultReceived = (result) => {
      clearTimeout(timer);
      resolve(result);
    };

    webViewRef.current.postMessage(JSON.stringify(payload));
  });
};
```

---

## 5. Ejercicios V1 (Hardcoded)

Mínimo para probar: **1 ejercicio por lenguaje por algoritmo** (6 total: 3 algoritmos × 2 lenguajes).

### Ejemplo: Bubble Sort — Python

```typescript
// challenges.ts
export const challenges: Challenge[] = [
  {
    id: 'bubble-sort-python',
    titulo: 'Implementa Bubble Sort',
    descripcion: 'Escribe una función bubble_sort(arr) que ordene el arreglo de menor a mayor.',
    lenguaje: 'python',
    algoritmoId: null, // Se puede vincular después
    plantilla: `def bubble_sort(arr):
    # Tu código aquí
    pass

# No modifiques estas líneas
datos = list(map(int, input().split()))
print(bubble_sort(datos))`,
    testCases: [
      { input: '5 2 8 1', expectedOutput: '[1, 2, 5, 8]' },
      { input: '1', expectedOutput: '[1]' },
      { input: '3 1 2', expectedOutput: '[1, 2, 3]' },
    ],
  },
];
```

### Ejemplo: Bubble Sort — C++

```typescript
{
  id: 'bubble-sort-cpp',
  titulo: 'Implementa Bubble Sort',
  descripcion: 'Escribe una función que ordene un arreglo usando Bubble Sort.',
  lenguaje: 'cpp',
  plantilla: `#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    // Tu código aquí
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    bubbleSort(arr);
    for (int i = 0; i < n; i++) cout << arr[i] << (i < n-1 ? " " : "");
    cout << endl;
    return 0;
}`,
  testCases: [
    { input: '4\n5 2 8 1', expectedOutput: '1 2 5 8' },
    { input: '1\n1', expectedOutput: '1' },
    { input: '3\n3 1 2', expectedOutput: '1 2 3' },
  ],
}
```

---

## 6. Tipos TypeScript

```typescript
// types.ts
export type Language = 'python' | 'cpp';

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Challenge {
  id: string;
  titulo: string;
  descripcion: string;
  lenguaje: Language;
  algoritmoId: string | null;
  plantilla: string;      // Código base que ve el usuario
  testCases: TestCase[];
}

export interface TestResult {
  passed: boolean;
  output: string | null;
  expected: string;
  error: string | null;
  timeMs?: number;
}

export interface RunResponse {
  results: TestResult[];
  allPassed: boolean;
}
```

---

## 7. Integración con Gamificación

En V1, los ejercicios de código son **independientes** del sistema de XP. No generan puntos ni afectan el progreso. Son una prueba de concepto.

En V2:
- Se vincularán con `algoritmoId`
- Se agregarán como nuevo tipo de ejercicio al sistema de puntos
- Resolver un challenge dará XP (ej: 50 XP por challenge completado)

---

## 8. Dependencias Nuevas (Frontend)

| Paquete | Versión | Propósito |
|---|---|---|
| `react-native-webview` | `^13.x` | WebView para ejecutar los intérpretes |
| (asset) `micropython.js` + `micropython.wasm` | Latest | Intérprete Python en WASM |
| (asset) `JSCPP.es5.min.js` | `^2.x` | Intérprete C++ en JS |

> **Nota**: MicroPython y JSCPP se cargan como assets estáticos dentro del HTML del WebView, no como dependencias npm.

---

## 9. Limitaciones de V1

| Limitación | Se resuelve en V2 |
|---|---|
| Ejercicios hardcoded (no vienen de la API) | Endpoint `GET /api/challenges/:algoId` |
| Sin XP por completar challenges | Integración con `ExercisesModule` |
| Editor básico (TextInput sin autocomplete) | Editor con syntax highlighting completo (Monaco/CodeMirror adaptado) |
| Sin historial de intentos | Tabla `IntentoChallenge` en DB |
| JSCPP no soporta STL completa | Evaluar alternativas C++ más robustas |
| MicroPython sin stdlib completa | Evaluar migración a Pyodide |

---

## 10. Plataformas

| Plataforma | Python | C++ | Notas |
|---|---|---|---|
| **Android** | ✅ MicroPython WASM | ✅ JSCPP (JS) | WebView V8 soporta WASM nativamente |
| **iOS** | ✅ MicroPython WASM | ✅ JSCPP (JS) | WKWebView soporta WebAssembly. No descarga código nativo — corre en el sandbox del WebView |
| **Web** | ✅ MicroPython WASM | ✅ JSCPP (JS) | Ambos corren en el navegador directamente |

> **Corrección vs. doc original**: La doc dice "iOS excluido para WASM". En realidad, WKWebView sí soporta `WebAssembly`. La restricción de Apple aplica a JIT de código nativo descargado, no a WASM interpretado dentro de un WebView. V1 probará esto y se documentará.
