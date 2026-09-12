# BrainSort Core & Domain

> **Fuente de verdad**: `BrainSort-Product_Vision_Board.pdf`, `BrainSort-Modelo_del_Dominio.docx`, `BrainSort-Glosario.docx`

## 1. Context & Motivation
BrainSort es una aplicación educativa para la visualización y aprendizaje de algoritmos. Los estudiantes enfrentan dificultades para comprender el funcionamiento interno de los algoritmos a través de métodos estáticos (papel, código). BrainSort lo resuelve visualmente mediante simulaciones interactivas, ejercicios de predicción y un sistema de gamificación.

## 2. User Experience (UX)
La plataforma gira en torno a estos flujos de usuario primarios:
- **Explorar (Biblioteca)**: Navegar por un catálogo de algoritmos agrupados por categoría con tarjetas que muestran nombre, dificultad y descripción corta.
- **Aprender (Simulación)**: Observar un algoritmo ordenar datos paso a paso con feedback descriptivo, pseudocódigo resaltado y controles de velocidad.
- **Practicar (Ejercicios)**: Predecir el siguiente paso del algoritmo durante la simulación. Feedback inmediato con indicadores visuales.
- **Progresar (Gamificación)**: Acumular puntos, desbloquear insignias, mantener rachas de días consecutivos y subir en el ranking.

## 3. Core Requirements

**In-Scope (Según Documentación):**
- 10 clases conceptuales del dominio: BrainSort, Usuario, Administrador, BibliotecaDeAlgoritmos, Algoritmo, Simulación, ConjuntoDeDatos, EjercicioPredicción, ProgresoUsuario, Insignia.
- Roles de usuario: **Estudiante, Profesor/Docente, Autodidacta** (según Glosario y Modelo del Dominio).
- Rol de Administrador separado para gestión de contenido.
- Simulación visual interactiva con controles de reproducción (Play/Pausa) y velocidad ajustable (0.25x a 2.0x en incrementos de 0.25).
- Datos de entrada: Predeterminados (generados automáticamente, 8-15 elementos) y Personalizados (ingresados por el usuario).
- Ejercicios de predicción durante la simulación, evaluados automáticamente.
- Sistema de progreso con puntos, niveles, rachas y ranking.
- Sistema de insignias como recompensa.

**Out-of-Scope:**
- Algoritmos de búsqueda (A*, Dijkstra) en esta versión.
- Sistema de pagos o suscripciones.
- Competencias multijugador en tiempo real.

## 4. Glossary & Domain Definitions (Según BrainSort-Glosario.docx)

| Término | Definición | Alias | Reglas de Validación |
|---|---|---|---|
| **Algoritmo** | Conjunto de pasos lógicos y finitos que permiten resolver un problema o ejecutar una tarea específica. | Procedimiento, Método | Debe existir en la base de datos de algoritmos disponibles. |
| **Simulación** | Representación animada e interactiva del comportamiento interno de un algoritmo sobre un conjunto de datos. | Visualización, Animación | Debe cargarse correctamente antes de iniciar la animación. |
| **Usuario** | Actor principal que utiliza la plataforma para visualizar algoritmos y aprender su funcionamiento. | Estudiante, Visitante, Docente | Si es invitado, solo puede visualizar; no modificar datos del sistema. |
| **Biblioteca de Algoritmos** | Módulo del sistema que almacena y categoriza los algoritmos disponibles para visualización. | Catálogo | Debe contener al menos un algoritmo activo. |
| **Profesor/Docente** | Actor académico que utiliza la aplicación como herramienta de apoyo didáctico en sus clases. | Docente | — |
| **Datos de Entrada** | Conjunto de valores numéricos o estructurados sobre los cuales se ejecuta el algoritmo. | Input, Dataset | Deben cumplir el formato esperado por el algoritmo (ej. números enteros, sin caracteres no válidos). |
| **Datos Predeterminados** | Conjunto de valores cargados automáticamente por el sistema al iniciar la simulación. | Datos iniciales | Validados automáticamente por el sistema. |
| **Datos Personalizados** | Datos proporcionados por el usuario para ejecutar la simulación con valores específicos. | Datos del Usuario | Formato debe coincidir con el tipo requerido. Error si hay valores nulos. |
| **Interfaz de Simulación** | Pantalla donde se representa gráficamente la ejecución del algoritmo. | Panel de visualización | Debe cargarse completamente antes de permitir interacción. |
| **Control de Reproducción** | Elemento de interfaz que permite iniciar, pausar o reiniciar la simulación. | Botón Reproducir/Pausa | No debe estar activo si la simulación no ha sido cargada. |
| **Control de Velocidad** | Permite ajustar la rapidez con que se ejecuta la animación. | Velocidad de Simulación | Deben ser múltiplos de 0.25 en el rango [0.25, 2.0]. |
| **Ejercicio de Predicción** | Actividad interactiva que permite al usuario anticipar el siguiente paso del algoritmo. | Prueba de Comprensión | La respuesta se evalúa automáticamente. |
| **Integración de Teoría** | Módulo que muestra el pseudocódigo y la complejidad del algoritmo mientras se ejecuta la simulación. | Panel Teórico | Debe sincronizarse con el paso actual de la simulación. |
| **Administrador de sistema** | Responsable de gestionar contenido y configuración de la aplicación. | Admin | No utiliza el sistema para aprender. Debe garantizar calidad del contenido educativo. |
| **Error de Carga** | Falla al intentar inicializar la simulación o cargar datos predefinidos. | Fallo de Inicialización | Muestra mensaje claro y opciones de recuperación. |
| **Error en Visualización** | Interrupción o inconsistencia durante la ejecución de la animación. | Animación Congelada | Debe permitir reiniciar o reportar el fallo. |
| **Mensaje de Estado** | Notificación textual que informa al usuario sobre el progreso o errores. | Alerta, Pop-up | Debe ser claro, no técnico y contextual. |
| **Reporte de Error** | Registro generado cuando un usuario notifica un fallo en la visualización. | Log de Error | Debe contener descripción no vacía. |
| **Soporte Técnico** | Entidad encargada de recibir reportes de error y resolver incidencias. | — | Solo accesible por administradores. |
| **Complejidad Computacional** | Medida asimptótica que indica la eficiencia del algoritmo. | — | Valor debe corresponder al algoritmo cargado. |

---
*Nota: Este documento define "Qué" es el sistema. Para detalles de implementación técnica, ver `core-domain.plan.md`.*
