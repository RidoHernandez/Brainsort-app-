import {
  Prisma,
  PrismaClient,
  CategoriaAlgoritmo,
  DificultadEjercicio,
} from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type ExerciseSeed = {
  algoritmo: string;
  tipo: 'PrediccionTexto' | 'CompletarPseudocodigo' | 'OrdenarBarras';
  pregunta: string;
  respuestaCorrecta: string;
  dificultad: 'Facil' | 'Medio' | 'Dificil';
  feedbackPositivo: string;
  feedbackNegativo: string;
  opciones?: Prisma.InputJsonValue;
  contenido?: Prisma.InputJsonValue;
};

const visualizationRoles = {
  activo: { color: '#F5A623' },
  intercambio: { color: '#E74C3C' },
  insercion: { color: '#00D4FF' },
  esperaRecursion: { label: 'espera', color: '#6B7280' },
};

function visualizationConfig(nombre: string): Prisma.InputJsonValue {
  const configs: Record<string, Prisma.InputJsonValue> = {
    'Bubble Sort': {
      roles: visualizationRoles,
      lineLabels: { 3: ['j', 'j+1'], 4: ['j', 'j+1'] },
    },
    'Selection Sort': {
      roles: visualizationRoles,
      lineLabels: { 4: ['j', 'min'], 6: ['i', 'min'] },
    },
    'Insertion Sort': {
      roles: visualizationRoles,
      lineLabels: { 3: ['j', 'key'], 4: ['key'], 5: ['key'] },
    },
    'Merge Sort': {
      roles: visualizationRoles,
      lineLabels: {
        10: ['izq[i]', 'der[j]'],
        11: ['k'],
        12: ['k'],
        14: ['k'],
      },
      recursion: { waitingRole: 'esperaRecursion', waitingLabel: 'espera' },
    },
    'Quick Sort': {
      roles: visualizationRoles,
      lineLabels: { 2: ['pivotIndex', 'pivot'], 5: ['j', 'pivot'], 6: ['i', 'j'] },
      recursion: { waitingRole: 'esperaRecursion', waitingLabel: 'espera' },
    },
    'Heap Sort': {
      roles: visualizationRoles,
      lineLabels: { 3: ['root', 'fin'], 4: ['root', 'child'], 5: ['root', 'child'] },
    },
    'Binary Search': {
      roles: visualizationRoles,
      lineLabels: { 3: ['low', 'mid', 'high'], 4: ['mid'], 5: ['low', 'mid', 'high'], 6: ['low', 'mid', 'high'] },
    },
    'Linear Search': {
      roles: visualizationRoles,
      lineLabels: { 2: ['i'], 3: ['i'] },
    },
    'Segment Tree': {
      roles: visualizationRoles,
      lineLabels: {
        1: ['nodo'],
        2: ['hoja'],
        3: ['nodo'],
        4: ['izq'],
        5: ['der'],
        6: ['nodo', 'izq', 'der'],
        7: ['nodo'],
      },
      recursion: { waitingRole: 'esperaRecursion', waitingLabel: 'espera' },
    },
  };

  return configs[nombre] ?? {
    roles: visualizationRoles,
    lineLabels: {},
  };
}

async function ensureExercise(seed: ExerciseSeed) {
  const algoritmo = await prisma.algoritmo.findUnique({
    where: { nombre: seed.algoritmo },
  });

  if (!algoritmo) {
    return;
  }

  const existing = await prisma.ejercicioPrediccion.findFirst({
    where: {
      algoritmoId: algoritmo.id,
      pregunta: seed.pregunta,
    },
  });

  const data = {
    tipo: seed.tipo,
    pregunta: seed.pregunta,
    respuestaCorrecta: seed.respuestaCorrecta,
    dificultad: seed.dificultad,
    feedbackPositivo: seed.feedbackPositivo,
    feedbackNegativo: seed.feedbackNegativo,
    opciones: seed.opciones ?? undefined,
    contenido: seed.contenido ?? undefined,
    algoritmo: { connect: { id: algoritmo.id } },
  };

  if (existing) {
    await prisma.ejercicioPrediccion.update({
      where: { id: existing.id },
      data,
    });
    return;
  }

  await prisma.ejercicioPrediccion.create({ data });
}

async function main() {
  // 1. Crear administrador por defecto
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.administrador.upsert({
    where: { correo: 'admin@brainsort.edu' },
    update: {},
    create: {
      nombre: 'Admin BrainSort',
      correo: 'admin@brainsort.edu',
      contrasena: adminPassword,
      credencialesAdmin: 'SUPER_ADMIN',
    },
  });

  // 2. Seed de algoritmos de ordenamiento (CDR-009: pseudocodigo en formato JSON Array)
  const algoritmos = [
    {
      nombre: 'Bubble Sort',
      descripcion: 'Algoritmo de ordenamiento que compara elementos adyacentes e intercambia si están desordenados.',
      dificultad: 'Facil' as const,
      complejidadTiempo: 'O(n²)',
      complejidadEspacio: 'O(1)',
      categoria: 'Ordenamiento' as const,
      pseudocodigo: [
        { numero: 1, codigo: 'Para i = 0 hasta n-2' },
        { numero: 2, codigo: '  Para j = 0 hasta n-i-2' },
        { numero: 3, codigo: '    Si array[j] > array[j+1]' },
        { numero: 4, codigo: '      Intercambiar array[j] y array[j+1]' },
      ],
      tags: ['Básico', 'Lento', 'In-place', 'Estable'],
    },
    {
      nombre: 'Selection Sort',
      descripcion: 'Algoritmo que selecciona el menor elemento y lo coloca en su posición correcta.',
      dificultad: 'Medio' as const,
      complejidadTiempo: 'O(n²)',
      complejidadEspacio: 'O(1)',
      categoria: 'Ordenamiento' as const,
      pseudocodigo: [
        { numero: 1, codigo: 'Para i = 0 hasta n-1' },
        { numero: 2, codigo: '  minIndex = i' },
        { numero: 3, codigo: '  Para j = i+1 hasta n-1' },
        { numero: 4, codigo: '    Si array[j] < array[minIndex]' },
        { numero: 5, codigo: '      minIndex = j' },
        { numero: 6, codigo: '  Intercambiar array[i] con array[minIndex]' },
      ],
      tags: ['Básico', 'In-place', 'Inestable'],
    },
    {
      nombre: 'Insertion Sort',
      descripcion: 'Algoritmo que inserta cada elemento en su posición correcta dentro de la sublista ordenada.',
      dificultad: 'Facil' as const,
      complejidadTiempo: 'O(n²)',
      complejidadEspacio: 'O(1)',
      categoria: 'Ordenamiento' as const,
      pseudocodigo: [
        { numero: 1, codigo: 'Para i = 1 hasta n-1' },
        { numero: 2, codigo: '  key = array[i]' },
        { numero: 3, codigo: '  j = i - 1' },
        { numero: 4, codigo: '  Mientras j >= 0 y array[j] > key' },
        { numero: 5, codigo: '    array[j+1] = array[j]' },
        { numero: 6, codigo: '    j = j - 1' },
        { numero: 7, codigo: '  array[j+1] = key' },
      ],
      tags: ['Básico', 'Eficiente en Casi Ordenados', 'In-place', 'Estable'],
    },
  ];

  for (const algo of algoritmos) {
    const data = { ...algo, visualizacion: visualizationConfig(algo.nombre) };
    await prisma.algoritmo.upsert({
      where: { nombre: algo.nombre },
      update: data,
      create: data,
    });
  }

  // Estructuras Lineales
  const estructurasLineales = [
    {
      nombre: 'Stack',
      descripcion: 'Estructura LIFO (Last In, First Out). El último elemento insertado es el primero en salir. Ideal para manejo de llamadas recursivas, deshacer acciones y evaluación de expresiones.',
      dificultad: 'Facil' as const,
      complejidadTiempo: 'O(1)',
      complejidadEspacio: 'O(n)',
      categoria: 'EstructurasLineales' as const,
      tags: ['LIFO', 'Recursión', 'Fundamental'],
      pseudocodigo: [
        { numero: 1, codigo: 'Estructura Stack:' },
        { numero: 2, codigo: '  push(valor): tope ← tope + 1; pila[tope] ← valor' },
        { numero: 3, codigo: '  peek(): devolver pila[tope]' },
        { numero: 4, codigo: '  isEmpty(): devolver tope == -1' },
        { numero: 5, codigo: '  pop(): guardar pila[tope]; tope ← tope - 1' },
        { numero: 6, codigo: '         devolver valor guardado' },
        { numero: 7, codigo: '  (Stack vacío)' },
      ],
    },
    {
      nombre: 'Queue',
      descripcion: 'Estructura FIFO (First In, First Out). El primer elemento insertado es el primero en salir. Usada en sistemas de colas, BFS y procesamiento por lotes.',
      dificultad: 'Facil' as const,
      complejidadTiempo: 'O(1)',
      complejidadEspacio: 'O(n)',
      categoria: 'EstructurasLineales' as const,
      tags: ['FIFO', 'BFS', 'Fundamental'],
      pseudocodigo: [
        { numero: 1, codigo: 'Estructura Queue:' },
        { numero: 2, codigo: '  enqueue(valor): cola[fin] ← valor; fin ← fin + 1' },
        { numero: 3, codigo: '  front(): devolver cola[inicio]' },
        { numero: 4, codigo: '  isEmpty(): devolver inicio == fin' },
        { numero: 5, codigo: '  dequeue(): guardar cola[inicio]' },
        { numero: 6, codigo: '            inicio ← inicio + 1; devolver guardado' },
        { numero: 7, codigo: '  (Queue vacía)' },
      ],
    },
    {
      nombre: 'Linked List',
      descripcion: 'Estructura lineal donde cada nodo contiene un valor y un puntero al siguiente nodo. Permite inserción y eliminación eficiente en cualquier posición sin necesidad de redimensionar.',
      dificultad: 'Medio' as const,
      complejidadTiempo: 'O(n)',
      complejidadEspacio: 'O(n)',
      categoria: 'EstructurasLineales' as const,
      tags: ['Punteros', 'Dinámico', 'Nodos'],
      pseudocodigo: [
        { numero: 1, codigo: 'Estructura Nodo: valor, siguiente' },
        { numero: 2, codigo: 'insertarAlInicio(valor): nuevoNodo ← Nodo(valor)' },
        { numero: 3, codigo: '  nuevoNodo.siguiente ← cabeza; cabeza ← nuevoNodo' },
        { numero: 4, codigo: 'buscar(valor): actual ← cabeza' },
        { numero: 5, codigo: '  Mientras actual != null:' },
        { numero: 6, codigo: '    Si actual.valor == valor: devolver actual' },
        { numero: 7, codigo: '    actual ← actual.siguiente' },
      ],
    },
  ];

  for (const algo of estructurasLineales) {
    const data = { ...algo, visualizacion: visualizationConfig(algo.nombre) };
    await prisma.algoritmo.upsert({
      where: { nombre: algo.nombre },
      update: data,
      create: data,
    });
  }

  const algoritmosExpandidos = [
    {
      nombre: 'Merge Sort',
      descripcion: 'Algoritmo divide y vencerás que divide el arreglo en mitades, ordena cada mitad y luego las combina.',
      dificultad: 'Medio' as const,
      complejidadTiempo: 'O(n log n)',
      complejidadEspacio: 'O(n)',
      categoria: 'Ordenamiento' as const,
      tags: ['Divide y Vencerás', 'Estable', 'Recursión'],
      pseudocodigo: [
        { numero: 1, codigo: 'MergeSort(arreglo, L, R)' },
        { numero: 2, codigo: '  Si L == R: retornar' },
        { numero: 3, codigo: '  M = piso((L + R) / 2)' },
        { numero: 4, codigo: '  MergeSort(arreglo, L, M)' },
        { numero: 5, codigo: '  MergeSort(arreglo, M + 1, R)' },
        { numero: 6, codigo: '  Merge(arreglo, L, M, R)' },
        { numero: 7, codigo: '    izq = copia de arreglo[L..M]' },
        { numero: 8, codigo: '    der = copia de arreglo[M+1..R]' },
        { numero: 9, codigo: '    i = 0; j = 0; k = L' },
        { numero: 10, codigo: '    Mientras i < tam(izq) y j < tam(der)' },
        { numero: 11, codigo: '      Si izq[i] <= der[j]: arreglo[k] = izq[i]; i++' },
        { numero: 12, codigo: '      Si no: arreglo[k] = der[j]; j++' },
        { numero: 13, codigo: '      k++' },
        { numero: 14, codigo: '    Copiar sobrantes de izq o der al arreglo' },
      ],
    },
    {
      nombre: 'Quick Sort',
      descripcion: 'Algoritmo divide y vencerás que elige un pivote, particiona valores menores y mayores, y ordena recursivamente.',
      dificultad: 'Dificil' as const,
      complejidadTiempo: 'O(n log n)',
      complejidadEspacio: 'O(log n)',
      categoria: 'Ordenamiento' as const,
      tags: ['Divide y Vencerás', 'Pivote', 'In-place'],
      pseudocodigo: [
        { numero: 1, codigo: 'Si low < high' },
        { numero: 2, codigo: '  pivotIndex = particionar(arreglo, low, high)' },
        { numero: 3, codigo: '  QuickSort(arreglo, low, pivotIndex - 1)' },
        { numero: 4, codigo: '  QuickSort(arreglo, pivotIndex + 1, high)' },
      ],
    },
    {
      nombre: 'Heap Sort',
      descripcion: 'Algoritmo que construye un heap binario y extrae repetidamente el máximo para ordenar el arreglo.',
      dificultad: 'Dificil' as const,
      complejidadTiempo: 'O(n log n)',
      complejidadEspacio: 'O(1)',
      categoria: 'Ordenamiento' as const,
      tags: ['Heap', 'In-place', 'Árbol Binario'],
      pseudocodigo: [
        { numero: 1, codigo: 'Construir max-heap' },
        { numero: 2, codigo: 'Para fin = n-1 hasta 1' },
        { numero: 3, codigo: '  Intercambiar arreglo[0] con arreglo[fin]' },
        { numero: 4, codigo: '  heapify(arreglo, 0, fin)' },
      ],
    },
    {
      nombre: 'Binary Search',
      descripcion: 'Búsqueda eficiente sobre arreglos ordenados que descarta la mitad del espacio de búsqueda en cada paso.',
      dificultad: 'Medio' as const,
      complejidadTiempo: 'O(log n)',
      complejidadEspacio: 'O(1)',
      categoria: 'Busqueda' as const,
      tags: ['Búsqueda', 'Ordenado', 'Divide y Vencerás'],
      pseudocodigo: [
        { numero: 1, codigo: 'low = 0; high = n - 1' },
        { numero: 2, codigo: 'Mientras low <= high' },
        { numero: 3, codigo: '  mid = piso((low + high) / 2)' },
        { numero: 4, codigo: '  Si arreglo[mid] == objetivo: devolver mid' },
        { numero: 5, codigo: '  Si arreglo[mid] < objetivo: low = mid + 1' },
        { numero: 6, codigo: '  Si no: high = mid - 1' },
      ],
    },
    {
      nombre: 'Linear Search',
      descripcion: 'Búsqueda secuencial que revisa cada elemento hasta encontrar el objetivo o llegar al final.',
      dificultad: 'Facil' as const,
      complejidadTiempo: 'O(n)',
      complejidadEspacio: 'O(1)',
      categoria: 'Busqueda' as const,
      tags: ['Búsqueda', 'Secuencial', 'Básico'],
      pseudocodigo: [
        { numero: 1, codigo: 'Para i = 0 hasta n - 1' },
        { numero: 2, codigo: '  Si arreglo[i] == objetivo' },
        { numero: 3, codigo: '    devolver i' },
        { numero: 4, codigo: 'devolver -1' },
      ],
    },
    {
      nombre: 'Deque',
      descripcion: 'Cola doble que permite insertar y eliminar elementos tanto al inicio como al final.',
      dificultad: 'Medio' as const,
      complejidadTiempo: 'O(1)',
      complejidadEspacio: 'O(n)',
      categoria: 'EstructurasLineales' as const,
      tags: ['Doble Cola', 'FIFO', 'LIFO Flexible'],
      pseudocodigo: [
        { numero: 1, codigo: 'pushFront(valor): insertar al inicio' },
        { numero: 2, codigo: 'pushBack(valor): insertar al final' },
        { numero: 3, codigo: 'popFront(): remover del inicio' },
        { numero: 4, codigo: 'popBack(): remover del final' },
      ],
    },
    {
      nombre: 'Priority Queue',
      descripcion: 'Estructura donde cada elemento tiene prioridad y se atiende primero el de mayor prioridad.',
      dificultad: 'Dificil' as const,
      complejidadTiempo: 'O(log n)',
      complejidadEspacio: 'O(n)',
      categoria: 'EstructurasLineales' as const,
      tags: ['Prioridad', 'Heap', 'Planificación'],
      pseudocodigo: [
        { numero: 1, codigo: 'insertar(elemento, prioridad)' },
        { numero: 2, codigo: '  subir hasta mantener prioridad' },
        { numero: 3, codigo: 'extraerMax()' },
        { numero: 4, codigo: '  remover raíz y reordenar heap' },
      ],
    },
    {
      nombre: 'Segment Tree',
      descripcion: 'Estructura de árbol que permite responder consultas de rangos y actualizar valores en O(log n). Es útil para sumas, mínimos o máximos sobre intervalos.',
      dificultad: 'Dificil' as const,
      complejidadTiempo: 'Construcción O(n), consulta O(log n), actualización O(log n)',
      complejidadEspacio: 'O(n)',
      categoria: 'EstructurasArboles' as const,
      tags: ['Árbol', 'Rangos', 'Recursión', 'Consultas'],
      pseudocodigo: [
        { numero: 1, codigo: 'build(nodo, inicio, fin)' },
        { numero: 2, codigo: '  Si inicio == fin: tree[nodo] = arreglo[inicio]' },
        { numero: 3, codigo: '  mid = piso((inicio + fin) / 2)' },
        { numero: 4, codigo: '  build(2*nodo, inicio, mid)' },
        { numero: 5, codigo: '  build(2*nodo+1, mid+1, fin)' },
        { numero: 6, codigo: '  tree[nodo] = tree[2*nodo] + tree[2*nodo+1]' },
        { numero: 7, codigo: '  retornar tree[nodo]' },
      ],
    },
  ];

  for (const algo of algoritmosExpandidos) {
    const data = { ...algo, visualizacion: visualizationConfig(algo.nombre) };
    await prisma.algoritmo.upsert({
      where: { nombre: algo.nombre },
      update: data,
      create: data,
    });
  }

  // 3. Seed de ejercicios gamificados: completar pseudocódigo y ordenar barras
  const exerciseSeeds: ExerciseSeed[] = [
    {
      algoritmo: 'Bubble Sort',
      tipo: 'CompletarPseudocodigo',
      pregunta: 'Completa la condición central de Bubble Sort.',
      respuestaCorrecta: 'array[j] > array[j + 1]',
      dificultad: 'Facil',
      opciones: ['array[j] > array[j + 1]', 'array[i] < array[j]', 'j < n', 'array[j] == key'],
      contenido: { antes: 'Si ', despues: ': intercambiar array[j] y array[j + 1]' },
      feedbackPositivo: 'Esa comparación detecta pares adyacentes fuera de orden.',
      feedbackNegativo: 'Bubble Sort solo decide intercambiar al comparar dos vecinos.',
    },
    {
      algoritmo: 'Bubble Sort',
      tipo: 'OrdenarBarras',
      pregunta: 'Ordena las barras como quedan tras el primer intercambio de [5, 2, 8, 1].',
      respuestaCorrecta: JSON.stringify([2, 5, 8, 1]),
      dificultad: 'Facil',
      contenido: { inicial: [5, 2, 8, 1], pasoObjetivo: 'Primer intercambio', objetivo: [2, 5, 8, 1] },
      feedbackPositivo: 'Bien: 5 y 2 se intercambian porque están desordenados.',
      feedbackNegativo: 'El primer par comparado es 5 y 2; solo ese par cambia.',
    },
    {
      algoritmo: 'Selection Sort',
      tipo: 'CompletarPseudocodigo',
      pregunta: 'Completa la línea que actualiza el mínimo encontrado.',
      respuestaCorrecta: 'minIndex = j',
      dificultad: 'Medio',
      opciones: ['minIndex = j', 'j = minIndex', 'array[i] = array[j]', 'i = i + 1'],
      contenido: { antes: 'Si array[j] < array[minIndex]: ', despues: '' },
      feedbackPositivo: 'Exacto: guardas la posición del nuevo mínimo.',
      feedbackNegativo: 'No se intercambia todavía; primero se recuerda dónde está el mínimo.',
    },
    {
      algoritmo: 'Selection Sort',
      tipo: 'OrdenarBarras',
      pregunta: 'Acomoda las barras como quedan después de colocar el mínimo de [4, 7, 1, 3].',
      respuestaCorrecta: JSON.stringify([1, 7, 4, 3]),
      dificultad: 'Medio',
      contenido: { inicial: [4, 7, 1, 3], pasoObjetivo: 'Primer mínimo colocado', objetivo: [1, 7, 4, 3] },
      feedbackPositivo: 'Bien: 1 se intercambia con la primera posición.',
      feedbackNegativo: 'Busca el menor de todo el arreglo y cámbialo por el primer elemento.',
    },
    {
      algoritmo: 'Insertion Sort',
      tipo: 'CompletarPseudocodigo',
      pregunta: 'Completa la condición que desplaza elementos mayores que key.',
      respuestaCorrecta: 'j >= 0 y array[j] > key',
      dificultad: 'Medio',
      opciones: ['j >= 0 y array[j] > key', 'i < n y key > 0', 'array[i] < array[j + 1]', 'j == key'],
      contenido: { antes: 'Mientras ', despues: ': array[j + 1] = array[j]' },
      feedbackPositivo: 'Exacto: desplazas mientras haya elementos mayores a la izquierda.',
      feedbackNegativo: 'La clave es comparar key con la parte izquierda ya ordenada.',
    },
    {
      algoritmo: 'Insertion Sort',
      tipo: 'OrdenarBarras',
      pregunta: 'Acomoda las barras tras insertar el 2 en [1, 3, 4, 2].',
      respuestaCorrecta: JSON.stringify([1, 2, 3, 4]),
      dificultad: 'Medio',
      contenido: { inicial: [1, 3, 4, 2], pasoObjetivo: 'Insertar key = 2', objetivo: [1, 2, 3, 4] },
      feedbackPositivo: 'Bien: 2 se coloca entre 1 y 3.',
      feedbackNegativo: 'Mueve 3 y 4 a la derecha para insertar el 2.',
    },
    {
      algoritmo: 'Binary Search',
      tipo: 'CompletarPseudocodigo',
      pregunta: 'En una búsqueda binaria, ¿cómo se calcula el índice del elemento medio (mid)?',
      respuestaCorrecta: 'piso((low + high) / 2)',
      dificultad: 'Facil',
      opciones: [
        'piso((low + high) / 2)',
        'piso((high - low) / 2)',
        'low + (high / 2)',
        'low + high',
      ],
      contenido: { antes: 'mid = ', despues: '' },
      feedbackPositivo: '¡Excelente! Promediar los límites inferior y superior te da el punto medio del rango actual.',
      feedbackNegativo: 'Recuerda que mid es el promedio de low y high redondeado hacia abajo.',
    },
    {
      algoritmo: 'Binary Search',
      tipo: 'OrdenarBarras',
      pregunta: 'Si low = 0 y high = 6 en la primera iteración, selecciona la barra correspondiente al elemento medio (mid).',
      respuestaCorrecta: '3',
      dificultad: 'Facil',
      contenido: {
        modoSeleccion: true,
        inicial: [10, 20, 30, 40, 50, 60, 70],
        pasoObjetivo: 'Con low=0 y high=6, calcula el índice del elemento medio.',
      },
      feedbackPositivo: '¡Correcto! El índice medio es 3, que corresponde al elemento con valor 40.',
      feedbackNegativo: 'Calcula piso((0 + 6) / 2) para encontrar el índice del elemento medio.',
    },
    {
      algoritmo: 'Binary Search',
      tipo: 'CompletarPseudocodigo',
      pregunta: 'Si el elemento en mid es menor que el objetivo, ¿cómo actualizamos el límite inferior (low)?',
      respuestaCorrecta: 'mid + 1',
      dificultad: 'Medio',
      opciones: ['mid + 1', 'mid', 'mid - 1', 'low + 1'],
      contenido: { antes: 'Si arreglo[mid] < objetivo: low = ', despues: '' },
      feedbackPositivo: '¡Correcto! Descartamos la mitad izquierda (incluyendo mid) y comenzamos la búsqueda desde mid + 1.',
      feedbackNegativo: 'Si el valor del medio es menor al objetivo, sabemos que este debe estar a la derecha de mid. Por lo tanto, movemos low justo después de mid.',
    },
    {
      algoritmo: 'Binary Search',
      tipo: 'OrdenarBarras',
      pregunta: 'Buscamos el número 60 en [10, 20, 30, 40, 50, 60, 70]. Si en el primer paso mid es el índice 3 (valor 40), selecciona la barra que será el nuevo límite inferior (low) en el siguiente paso.',
      respuestaCorrecta: '4',
      dificultad: 'Medio',
      contenido: {
        modoSeleccion: true,
        inicial: [10, 20, 30, 40, 50, 60, 70],
        pasoObjetivo: 'Como 40 < 60, actualizamos low = mid + 1.',
      },
      feedbackPositivo: '¡Correcto! Como 40 < 60, el nuevo low se mueve a mid + 1 (índice 4, valor 50).',
      feedbackNegativo: 'Dado que 40 es menor que 60, el elemento debe estar a la derecha de mid. El nuevo límite inferior (low) debe actualizarse a mid + 1.',
    },
    {
      algoritmo: 'Binary Search',
      tipo: 'CompletarPseudocodigo',
      pregunta: 'Si el elemento en mid es mayor que el objetivo, ¿cómo actualizamos el límite superior (high)?',
      respuestaCorrecta: 'mid - 1',
      dificultad: 'Medio',
      opciones: ['mid - 1', 'mid', 'mid + 1', 'high - 1'],
      contenido: { antes: 'Si no: high = ', despues: '' },
      feedbackPositivo: '¡Correcto! Descartamos la mitad derecha (incluyendo mid) moviendo high a mid - 1.',
      feedbackNegativo: 'Si el valor del medio es mayor al objetivo, este debe estar a la izquierda. Movemos high justo antes de mid.',
    },
    {
      algoritmo: 'Binary Search',
      tipo: 'OrdenarBarras',
      pregunta: 'Buscamos el número 20 en [10, 20, 30, 40, 50, 60, 70]. Si en el primer paso mid es el índice 3 (valor 40), selecciona la barra que será el nuevo límite superior (high) en el siguiente paso.',
      respuestaCorrecta: '2',
      dificultad: 'Medio',
      contenido: {
        modoSeleccion: true,
        inicial: [10, 20, 30, 40, 50, 60, 70],
        pasoObjetivo: 'Como 40 > 20, actualizamos high = mid - 1.',
      },
      feedbackPositivo: '¡Correcto! Como 40 > 20, el nuevo high se mueve a mid - 1 (índice 2, valor 30).',
      feedbackNegativo: 'Dado que 40 es mayor que 20, el elemento debe estar a la izquierda de mid. El nuevo límite superior (high) debe actualizarse a mid - 1.',
    },
  ];

  const moreExerciseSeeds: ExerciseSeed[] = [
    ['Merge Sort', 'Mitades ordenadas de [4, 3, 2, 1]', '[3, 4, 1, 2]', 'Merge(arreglo, izquierda, mitad, derecha)', [4, 3, 2, 1], [3, 4, 1, 2]],
    ['Quick Sort', 'Partición con pivote 3 en [4, 2, 5, 1, 3]', '[2, 1, 3, 4, 5]', 'pivotIndex = particionar(arreglo, low, high)', [4, 2, 5, 1, 3], [2, 1, 3, 4, 5]],
    ['Heap Sort', 'Después de extraer el máximo de [9, 5, 7, 1]', '[7, 5, 1, 9]', 'heapify(arreglo, 0, fin)', [9, 5, 7, 1], [7, 5, 1, 9]],
    ['Linear Search', 'Índices revisados para buscar 8 en [4, 6, 8, 2]', '0, 1, 2', 'Si arreglo[i] == objetivo', [4, 6, 8, 2], [4, 6, 8]],
    ['Stack', 'Resultado de push(1), push(2), push(3), pop()', '3', 'pop(): guardar pila[tope]; tope = tope - 1', [1, 2, 3], [1, 2]],
    ['Queue', 'Resultado de enqueue(A), enqueue(B), enqueue(C), dequeue()', 'A', 'dequeue(): guardar cola[inicio]', [1, 2, 3], [2, 3]],
    ['Linked List', 'Cabeza tras insertar al inicio 1, 2, 3', '3', 'nuevoNodo.siguiente = cabeza; cabeza = nuevoNodo', [1, 2, 3], [3, 2, 1]],
    ['Deque', 'Estado tras pushFront(2), pushBack(3), pushFront(1)', '[1, 2, 3]', 'pushFront(valor): insertar al inicio', [2, 3], [1, 2, 3]],
    ['Priority Queue', 'Orden de atención para prioridades [2, 5, 1]', '[5, 2, 1]', 'extraerMax(): remover raíz y reordenar heap', [2, 5, 1], [5, 2, 1]],
    ['Segment Tree', 'Construcción por suma para hojas [2, 1, 5, 3]', '[11, 3, 8, 2, 1, 5, 3]', 'tree[nodo] = tree[2*nodo] + tree[2*nodo+1]', [2, 1, 5, 3], [11, 3, 8, 2, 1, 5, 3]],
  ].flatMap(([algoritmo, predPregunta, predRespuesta, pseudoRespuesta, inicial, objetivo]) => [
    {
      algoritmo: algoritmo as string,
      tipo: 'CompletarPseudocodigo' as const,
      pregunta: `Completa la línea clave de ${algoritmo}.`,
      respuestaCorrecta: pseudoRespuesta as string,
      dificultad: algoritmo === 'Priority Queue' || algoritmo === 'Quick Sort' || algoritmo === 'Heap Sort' || algoritmo === 'Segment Tree' ? 'Dificil' as const : 'Medio' as const,
      opciones: [
        pseudoRespuesta,
        'Para i = 0 hasta n - 1',
        'Intercambiar solo si el arreglo ya está ordenado',
        'devolver arreglo sin cambios',
      ],
      contenido: { antes: '', despues: '' },
      feedbackPositivo: 'Bien: elegiste la línea que captura la decisión central.',
      feedbackNegativo: 'El hueco debe representar la regla que guía el avance del algoritmo.',
    },
    {
      algoritmo: algoritmo as string,
      tipo: 'OrdenarBarras' as const,
      pregunta: `Mueve las barras al estado esperado para: ${predPregunta}.`,
      respuestaCorrecta: JSON.stringify(objetivo),
      dificultad: algoritmo === 'Priority Queue' || algoritmo === 'Quick Sort' || algoritmo === 'Heap Sort' || algoritmo === 'Segment Tree' ? 'Dificil' as const : 'Medio' as const,
      contenido: { inicial, pasoObjetivo: predPregunta, objetivo },
      feedbackPositivo: 'Exacto: el estado visual coincide con el paso objetivo.',
      feedbackNegativo: 'Compara qué elementos cambian de posición en ese paso.',
    },
  ]);

  for (const seed of [...exerciseSeeds, ...moreExerciseSeeds]) {
    await ensureExercise(seed);
  }

  // 4. Seed de insignias
  const insignias = [
    { nombre: 'Primer Paso', descripcion: 'Completaste tu primera simulación', imagen: '/badges/first-step.svg', criterioDesbloqueo: 'Completar 1 simulación' },
    { nombre: 'Explorador', descripcion: 'Visualizaste 3 algoritmos diferentes', imagen: '/badges/explorer.svg', criterioDesbloqueo: 'Visualizar 3 algoritmos' },
    { nombre: 'Racha de 7', descripcion: 'Estudiaste 7 días consecutivos', imagen: '/badges/streak-7.svg', criterioDesbloqueo: 'rachaDias >= 7' },
    { nombre: 'Maestro del Orden', descripcion: 'Completaste todos los algoritmos de Ordenamiento', imagen: '/badges/sort-master.svg', criterioDesbloqueo: 'Completar todos los algoritmos de Ordenamiento' },
  ];

  for (const badge of insignias) {
    await prisma.insignia.upsert({
      where: { nombre: badge.nombre },
      update: badge,
      create: badge,
    });
  }

  // 5. Seed de Preguntas Diagnóstico (incluyendo estructuras lineales y avanzadas)
  await prisma.preguntaDiagnostico.deleteMany();
  const preguntas = [
    {
      pregunta: '¿Cuál es el tiempo de complejidad promedio de Bubble Sort?',
      opciones: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
      indiceCorrecto: 2,
    },
    {
      pregunta: '¿Qué algoritmo utiliza la técnica "Divide y Vencerás"?',
      opciones: ['Insertion Sort', 'Merge Sort', 'Selection Sort', 'Bubble Sort'],
      indiceCorrecto: 1,
    },
    {
      pregunta: '¿Qué significa que un algoritmo de ordenamiento sea "Estable"?',
      opciones: [
        'Nunca arroja errores durante la ejecución.',
        'El tiempo de ejecución siempre es el mismo.',
        'Mantiene el orden relativo de elementos con claves iguales.',
        'Utiliza O(1) de memoria extra.',
      ],
      indiceCorrecto: 2,
    },
    {
      pregunta: '¿Qué principio sigue una estructura tipo Stack?',
      opciones: ['FIFO', 'LIFO', 'Aleatorio', 'Ordenado'],
      indiceCorrecto: 1,
    },
    {
      pregunta: '¿Cuál es la diferencia principal entre un Stack y una Queue?',
      opciones: [
        'El Stack usa más memoria que la Queue.',
        'La Queue es más rápida que el Stack.',
        'En un Stack, el último en entrar es el primero en salir; en una Queue, el primero en entrar es el primero en salir.',
        'No hay diferencia entre ambas estructuras.',
      ],
      indiceCorrecto: 2,
    },
    {
      pregunta: '¿Qué ventaja tiene una Lista Enlazada sobre un arreglo?',
      opciones: [
        'Acceso más rápido por índice.',
        'Menor uso de memoria por elemento.',
        'Inserción y eliminación eficiente sin necesidad de redimensionar.',
        'Búsqueda binaria disponible de forma nativa.',
      ],
      indiceCorrecto: 2,
    },
    {
      pregunta: '¿Cuál es la complejidad temporal de la Búsqueda Binaria en el peor de los casos?',
      opciones: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      indiceCorrecto: 1,
    },
    {
      pregunta: '¿Cuál es el propósito principal de un Segment Tree?',
      opciones: [
        'Responder consultas y actualizaciones de rango en O(log n).',
        'Ordenar un arreglo en tiempo lineal.',
        'Estructura para implementar colas LIFO.',
        'Búsqueda secuencial en listas enlazadas.',
      ],
      indiceCorrecto: 0,
    },
  ];

  for (const p of preguntas) {
    await prisma.preguntaDiagnostico.create({ data: p });
  }

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
