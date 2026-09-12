import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LaTeX } from '../common/LaTeX';
import { DarkText, DarkSurfaces, Accent } from '../../styles/colors';
import { TextVariants } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

interface TheoryProps {
  algoritmoNombre: string;
}

export function AlgorithmTheory({ algoritmoNombre }: TheoryProps) {
  const normalizedNombre = algoritmoNombre.toLowerCase();

  if (normalizedNombre.includes('bubble')) {
    return <BubbleSortTheory />;
  }
  if (normalizedNombre.includes('selection')) {
    return <SelectionSortTheory />;
  }
  if (normalizedNombre.includes('insertion')) {
    return <InsertionSortTheory />;
  }
  if (normalizedNombre.includes('merge')) {
    return <MergeSortTheory />;
  }
  if (normalizedNombre.includes('quick')) {
    return <QuickSortTheory />;
  }
  if (normalizedNombre.includes('heap')) {
    return <HeapSortTheory />;
  }
  if (normalizedNombre.includes('binary')) {
    return <BinarySearchTheory />;
  }
  if (normalizedNombre.includes('linear')) {
    return <LinearSearchTheory />;
  }
  if (normalizedNombre.includes('stack')) {
    return <StackTheory />;
  }
  if (normalizedNombre.includes('queue') && !normalizedNombre.includes('priority')) {
    return <QueueTheory />;
  }
  if (normalizedNombre.includes('linked')) {
    return <LinkedListTheory />;
  }
  if (normalizedNombre.includes('deque')) {
    return <DequeTheory />;
  }
  if (normalizedNombre.includes('priority')) {
    return <PriorityQueueTheory />;
  }
  if (normalizedNombre.includes('segment')) {
    return <SegmentTreeTheory />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Teoría del Algoritmo</Text>
      <Text style={styles.paragraph}>
        La información teórica detallada para este algoritmo se encuentra en proceso de redacción ({algoritmoNombre}).
      </Text>
    </View>
  );
}

// ─── Bubble Sort ───────────────────────────────────────────────────────────
function BubbleSortTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona el Ordenamiento Burbuja?</Text>
      
      <Text style={styles.paragraph}>
        El ordenamiento burbuja (Bubble Sort) es un algoritmo de ordenamiento sencillo basado en comparaciones directas. Funciona recorriendo repetidamente la lista que se va a ordenar, comparando elementos adyacentes y permutándolos si están en el orden incorrecto.
      </Text>

      <Text style={styles.subtitle}>El Mecanismo de Comparación</Text>
      <Text style={styles.paragraph}>
        En cada paso, comparamos el elemento en el índice <Text style={styles.code}>i</Text> con el elemento en el índice <Text style={styles.code}>i+1</Text>:
      </Text>
      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Condición de Intercambio:</Text>
        <LaTeX math="if \ A[i] > A[i+1] \implies exchange(A[i], A[i+1])" block />
      </View>

      <Text style={styles.paragraph}>
        Este proceso se repite hasta que el arreglo quede completamente ordenado. En cada iteración completa sobre el arreglo, el elemento más grande sin ordenar "flota" hacia su posición final, similar a cómo suben las burbujas de gas en un líquido (de ahí su nombre).
      </Text>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      
      <Text style={styles.paragraph}>
        Para un arreglo de tamaño <LaTeX math="n" />, la cantidad total de comparaciones en el peor de los casos (cuando el arreglo está en orden inverso) es la suma de los primeros <LaTeX math="n-1" /> números enteros. Esto se modela formalmente mediante la sumatoria:
      </Text>

      <View style={styles.formulaCard}>
        <LaTeX math="T(n) = \sum_{i=1}^{n-1} (n - i) = \frac{n(n-1)}{2} = O(n^2)" block />
      </View>

      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Peor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n^2)" /></View>
          <Text style={styles.complexityCellDesc}>Orden inverso</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Caso Promedio</Text>
          <View style={styles.mathCell}><LaTeX math="O(n^2)" /></View>
          <Text style={styles.complexityCellDesc}>Elementos aleatorios</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Mejor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n)" /></View>
          <Text style={styles.complexityCellDesc}>Ya ordenado (con optimización)</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Espacio Auxiliar</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>In-place (no requiere memoria extra)</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>La Optimización Clave</Text>
      <Text style={styles.paragraph}>
        El caso óptimo de <LaTeX math="O(n)" /> se logra introduciendo una bandera booleana (ej. <Text style={styles.code}>intercambiado</Text>). Si durante una pasada completa sobre el arreglo no ocurre ningún intercambio, significa que el arreglo ya está ordenado y podemos detener el algoritmo inmediatamente, evitando iteraciones innecesarias.
      </Text>
    </View>
  );
}

// ─── Selection Sort ────────────────────────────────────────────────────────
function SelectionSortTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona el Ordenamiento por Selección?</Text>
      
      <Text style={styles.paragraph}>
        El ordenamiento por selección (Selection Sort) es un algoritmo sencillo que divide mentalmente el arreglo en una sección ordenada y otra desordenada. Recorre repetidamente la parte desordenada para buscar el elemento mínimo y lo coloca al principio.
      </Text>

      <Text style={styles.subtitle}>La Analogía de los Libros</Text>
      <Text style={styles.paragraph}>
        Imagina que tienes una fila de libros desordenados en un estante. Recorres todo el estante buscando el libro más pequeño de todos, lo sacas de su lugar y lo intercambias con el libro que está en la primera posición. Luego, repites el mismo proceso buscando el más pequeño a partir de la segunda posición y lo intercambias con el de la segunda posición.
      </Text>

      <Text style={styles.subtitle}>El Mecanismo de Búsqueda</Text>
      <Text style={styles.bulletPoint}>
        1. <Text style={styles.bold}>Buscar el mínimo:</Text> Recorres la sección desordenada buscando el índice del elemento menor (<Text style={styles.code}>minIndex</Text>).
      </Text>
      <Text style={styles.bulletPoint}>
        2. <Text style={styles.bold}>Intercambiar:</Text> Intercambias ese elemento mínimo con el primer elemento de la sección desordenada.
      </Text>
      <Text style={styles.bulletPoint}>
        3. <Text style={styles.bold}>Avanzar:</Text> Mueves la frontera ordenada un paso a la derecha y repites.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Búsqueda matemática del mínimo:</Text>
        <LaTeX math="A[minIndex] = \min(\{A[j] \mid i \le j < n\})" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <Text style={styles.paragraph}>
        Dado que siempre escaneamos la sección desordenada por completo para asegurar que encontramos el elemento más pequeño, el número de comparaciones no cambia aunque el arreglo ya esté ordenado:
      </Text>
      <View style={styles.formulaCard}>
        <LaTeX math="T(n) = \sum_{i=0}^{n-2} (n - 1 - i) = \frac{n(n-1)}{2} = O(n^2)" block />
      </View>

      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Peor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n^2)" /></View>
          <Text style={styles.complexityCellDesc}>Igual que los otros casos (requiere buscar siempre)</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Caso Promedio</Text>
          <View style={styles.mathCell}><LaTeX math="O(n^2)" /></View>
          <Text style={styles.complexityCellDesc}>Elementos aleatorios</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Mejor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n^2)" /></View>
          <Text style={styles.complexityCellDesc}>Lista ya ordenada (igual realiza todas las comparaciones)</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Espacio Auxiliar</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>In-place (no requiere memoria extra)</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Insertion Sort ────────────────────────────────────────────────────────
function InsertionSortTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona el Ordenamiento por Inserción?</Text>

      <Text style={styles.paragraph}>
        El ordenamiento por inserción (Insertion Sort) construye la lista ordenada elemento por elemento. Toma cada nuevo elemento y lo va insertando en su posición correcta dentro de la parte que ya ha sido ordenada.
      </Text>

      <Text style={styles.subtitle}>La Analogía de la Mano de Cartas</Text>
      <Text style={styles.paragraph}>
        Es exactamente como ordenas las cartas en tu mano durante un juego. Tomas una carta desordenada y la vas deslizando de derecha a izquierda comparándola con las cartas ya ordenadas, hasta colocarla en su lugar preciso.
      </Text>

      <Text style={styles.subtitle}>El Mecanismo de Inserción</Text>
      <Text style={styles.bulletPoint}>
        1. <Text style={styles.bold}>Clave (Key):</Text> Seleccionas el elemento en el índice <Text style={styles.code}>i</Text> como valor a insertar.
      </Text>
      <Text style={styles.bulletPoint}>
        2. <Text style={styles.bold}>Desplazar:</Text> Mientras los elementos anteriores sean mayores, los desplazas una posición a la derecha.
      </Text>
      <Text style={styles.bulletPoint}>
        3. <Text style={styles.bold}>Insertar:</Text> Colocas la clave en la posición libre donde ya no hay elementos mayores.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Bucle de desplazamiento interno:</Text>
        <LaTeX math="while \ (j \ge 0 \ \land \ A[j] > key) \implies A[j+1] = A[j]" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <Text style={styles.paragraph}>
        Si el arreglo ya está ordenado, el bucle interno no realiza desplazamientos y solo hace 1 comparación por elemento, dando un excelente tiempo de <LaTeX math="O(n)" />.
      </Text>

      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Peor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n^2)" /></View>
          <Text style={styles.complexityCellDesc}>Lista en orden inverso (máximos desplazamientos)</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Caso Promedio</Text>
          <View style={styles.mathCell}><LaTeX math="O(n^2)" /></View>
          <Text style={styles.complexityCellDesc}>Elementos aleatorios</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Mejor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n)" /></View>
          <Text style={styles.complexityCellDesc}>Lista ya ordenada (0 desplazamientos)</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Espacio Auxiliar</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>In-place y Estable</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Merge Sort ────────────────────────────────────────────────────────
function MergeSortTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona el Ordenamiento por Mezcla?</Text>

      <Text style={styles.paragraph}>
        El ordenamiento por mezcla (Merge Sort) utiliza el paradigma de diseño "Divide y Vencerás". Divide recursivamente el arreglo a la mitad hasta tener subarreglos de tamaño 1, y luego los combina de forma ordenada.
      </Text>

      <Text style={styles.subtitle}>La Analogía de los Exámenes</Text>
      <Text style={styles.paragraph}>
        Imagina ordenar un gran fajo de exámenes dividiéndolo en dos, dándole cada mitad a un asistente diferente para que los ordene, y luego combinando sus dos pilas ordenadas comparando solo los exámenes de la parte superior de cada pila.
      </Text>

      <Text style={styles.subtitle}>El Mecanismo de División y Mezcla</Text>
      <Text style={styles.bulletPoint}>
        1. <Text style={styles.bold}>Dividir:</Text> Partes el arreglo a la mitad calculando el índice del centro.
      </Text>
      <Text style={styles.bulletPoint}>
        2. <Text style={styles.bold}>Vencer:</Text> Aplicas Merge Sort recursivamente a la mitad izquierda y derecha.
      </Text>
      <Text style={styles.bulletPoint}>
        3. <Text style={styles.bold}>Combinar (Merge):</Text> Tomas ambas partes ordenadas y las fusionas en un arreglo auxiliar.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Ecuación de Recurrencia:</Text>
        <LaTeX math="T(n) = 2T\left(\frac{n}{2}\right) + O(n) \implies T(n) = O(n \log n)" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <Text style={styles.paragraph}>
        Dado que siempre divide a la mitad de forma exacta, la altura del árbol de recursión es siempre <LaTeX math="\log_2 n" /> y el costo de fusionar cada nivel es <LaTeX math="O(n)" />.
      </Text>

      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Peor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n \log n)" /></View>
          <Text style={styles.complexityCellDesc}>Igual que todos los casos (comportamiento consistente)</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Caso Promedio</Text>
          <View style={styles.mathCell}><LaTeX math="O(n \log n)" /></View>
          <Text style={styles.complexityCellDesc}>Elementos aleatorios</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Mejor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n \log n)" /></View>
          <Text style={styles.complexityCellDesc}>Lista ya ordenada (igual realiza todo el proceso de mezcla)</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Espacio Auxiliar</Text>
          <View style={styles.mathCell}><LaTeX math="O(n)" /></View>
          <Text style={styles.complexityCellDesc}>Requiere un arreglo temporal para fusionar (no es in-place)</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Quick Sort ────────────────────────────────────────────────────────
function QuickSortTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona el Ordenamiento Rápido?</Text>

      <Text style={styles.paragraph}>
        El ordenamiento rápido (Quick Sort) es un algoritmo eficiente que también usa "Divide y Vencerás". Elige un elemento como "pivote" y particiona el arreglo de modo que los menores queden a la izquierda y los mayores a la derecha.
      </Text>

      <Text style={styles.subtitle}>La Analogía de la Estatura</Text>
      <Text style={styles.paragraph}>
        Imagina un grupo de estudiantes. Eliges a uno (el pivote). Haces que todos los que son más bajos que él se coloquen a su izquierda, y los más altos a su derecha. El pivote queda en su posición final correcta, y luego repites el proceso para los dos grupos restantes.
      </Text>

      <Text style={styles.subtitle}>El Mecanismo de Partición</Text>
      <Text style={styles.bulletPoint}>
        1. <Text style={styles.bold}>Seleccionar Pivote:</Text> Se escoge un elemento (ej. el último).
      </Text>
      <Text style={styles.bulletPoint}>
        2. <Text style={styles.bold}>Particionar:</Text> Se acomodan los elementos alrededor del pivote.
      </Text>
      <Text style={styles.bulletPoint}>
        3. <Text style={styles.bold}>Recursión:</Text> Se aplica Quick Sort a la sublista izquierda y derecha del pivote.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Propiedad de la partición (pivote en p):</Text>
        <LaTeX math="\forall i < p, \ A[i] \le A[p] \quad \land \quad \forall j > p, \ A[j] > A[p]" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <Text style={styles.paragraph}>
        Si el pivote divide la lista a la mitad de forma balanceada, la complejidad es de <LaTeX math="O(n \log n)" />. Si la divide de forma totalmente desbalanceada (lista ordenada y eligiendo el último elemento como pivote), decae a <LaTeX math="O(n^2)" />.
      </Text>

      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Peor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n^2)" /></View>
          <Text style={styles.complexityCellDesc}>Partición muy desbalanceada (extrema)</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Caso Promedio</Text>
          <View style={styles.mathCell}><LaTeX math="O(n \log n)" /></View>
          <Text style={styles.complexityCellDesc}>Pivote balanceado promedio</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Mejor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n \log n)" /></View>
          <Text style={styles.complexityCellDesc}>Partición perfectamente balanceada a la mitad</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Espacio Auxiliar</Text>
          <View style={styles.mathCell}><LaTeX math="O(\log n)" /></View>
          <Text style={styles.complexityCellDesc}>Espacio en pila de recursión (ordena in-place)</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Heap Sort ────────────────────────────────────────────────────────
function HeapSortTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona el Ordenamiento por Montículo?</Text>

      <Text style={styles.paragraph}>
        El ordenamiento por montículo (Heap Sort) utiliza una estructura de datos tipo montículo (Max-Heap) para buscar el elemento máximo y colocarlo al final del arreglo, repitiendo el proceso recursivamente.
      </Text>

      <Text style={styles.subtitle}>La Analogía de la Pirámide Jerárquica</Text>
      <Text style={styles.paragraph}>
        Imagina una empresa donde el director general (la raíz del montículo) es el de mayor rango. Cuando el director se retira (se coloca al final del arreglo), los subjefes compiten para ascender a la raíz y restaurar la jerarquía, y el proceso se repite con el nuevo jefe.
      </Text>

      <Text style={styles.subtitle}>El Mecanismo de Montículo</Text>
      <Text style={styles.bulletPoint}>
        1. <Text style={styles.bold}>Construir Heap:</Text> Se organiza el arreglo para cumplir la propiedad de Max-Heap en tiempo <LaTeX math="O(n)" />.
      </Text>
      <Text style={styles.bulletPoint}>
        2. <Text style={styles.bold}>Extraer Máximo:</Text> Se intercambia la raíz con el último elemento disponible.
      </Text>
      <Text style={styles.bulletPoint}>
        3. <Text style={styles.bold}>Sift Down:</Text> Se reajusta el montículo activo para mantener la propiedad de jerarquía.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Propiedad de Max-Heap en arreglos:</Text>
        <LaTeX math="A[i] \ge A[2i+1] \quad \text{y} \quad A[i] \ge A[2i+2]" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <Text style={styles.paragraph}>
        Cada operación de reajuste en el montículo toma tiempo logarítmico proporcional a la altura del árbol binario (<LaTeX math="\log n" />). Esto se repite para los <LaTeX math="n" /> elementos.
      </Text>

      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Peor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n \log n)" /></View>
          <Text style={styles.complexityCellDesc}>Consistente en todos los casos</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Caso Promedio</Text>
          <View style={styles.mathCell}><LaTeX math="O(n \log n)" /></View>
          <Text style={styles.complexityCellDesc}>Elementos aleatorios</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Mejor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n \log n)" /></View>
          <Text style={styles.complexityCellDesc}>Lista ya ordenada (igual reestructura el montículo)</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Espacio Auxiliar</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>Ordena in-place sin memoria adicional</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Binary Search ────────────────────────────────────────────────────────
function BinarySearchTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona la Búsqueda Binaria?</Text>

      <Text style={styles.paragraph}>
        La búsqueda binaria (Binary Search) encuentra la posición de un valor objetivo dentro de un arreglo ordenado comparando el valor con el elemento en medio del arreglo y descartando la mitad que no puede contenerlo.
      </Text>

      <Text style={styles.subtitle}>La Analogía del Diccionario</Text>
      <Text style={styles.paragraph}>
        Cuando buscas una palabra en un diccionario, lo abres por la mitad. Si la palabra buscada es anterior alfabéticamente a la página abierta, sabes que no está en la mitad derecha y la descartas, repitiendo en la mitad izquierda.
      </Text>

      <Text style={styles.subtitle}>El Mecanismo de Descarte</Text>
      <Text style={styles.bulletPoint}>
        1. <Text style={styles.bold}>Requisito:</Text> El arreglo debe estar ordenado.
      </Text>
      <Text style={styles.bulletPoint}>
        2. <Text style={styles.bold}>Calcular Medio:</Text> Se obtiene el índice central <LaTeX math="mid = \lfloor (low + high) / 2 \rfloor" />.
      </Text>
      <Text style={styles.bulletPoint}>
        3. <Text style={styles.bold}>Descartar:</Text> Si el valor en <Text style={styles.code}>mid</Text> es mayor al buscado, se busca en la izquierda. Si es menor, en la derecha.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Reducción del espacio de búsqueda:</Text>
        <LaTeX math="N \to \frac{N}{2} \to \frac{N}{4} \to \dots \to 1 \implies O(\log N)" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Peor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(\log n)" /></View>
          <Text style={styles.complexityCellDesc}>El elemento está al final de las divisiones o no existe</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Caso Promedio</Text>
          <View style={styles.mathCell}><LaTeX math="O(\log n)" /></View>
          <Text style={styles.complexityCellDesc}>Búsqueda estándar promedio</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Mejor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>El valor objetivo está justo en el centro en el primer intento</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Linear Search ────────────────────────────────────────────────────────
function LinearSearchTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona la Búsqueda Lineal?</Text>

      <Text style={styles.paragraph}>
        La búsqueda lineal (Linear Search) es el método más simple para encontrar un elemento. Revisa secuencialmente cada elemento de la lista uno por uno hasta encontrar el valor buscado o llegar al final.
      </Text>

      <Text style={styles.subtitle}>La Analogía de las Llaves</Text>
      <Text style={styles.paragraph}>
        Es como tener un manojo de llaves desordenadas y probarlas una por una en la cerradura hasta que encuentras la llave correcta que abre la puerta.
      </Text>

      <Text style={styles.subtitle}>El Mecanismo de Búsqueda</Text>
      <Text style={styles.bulletPoint}>
        1. <Text style={styles.bold}>Iniciar:</Text> Comienzas en el índice 0.
      </Text>
      <Text style={styles.bulletPoint}>
        2. <Text style={styles.bold}>Comparar:</Text> Si el valor en la posición actual es el buscado, devuelves el índice.
      </Text>
      <Text style={styles.bulletPoint}>
        3. <Text style={styles.bold}>Avanzar:</Text> Si no, pasas al siguiente índice a la derecha.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Verificación secuencial simple:</Text>
        <LaTeX math="A[i] == objetivo \implies retornar \ i" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Peor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(n)" /></View>
          <Text style={styles.complexityCellDesc}>El elemento está al final de la lista o no existe</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Caso Promedio</Text>
          <View style={styles.mathCell}><LaTeX math="O(n)" /></View>
          <Text style={styles.complexityCellDesc}>Requiere revisar en promedio n/2 elementos</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Mejor Caso</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>El elemento buscado está en el primer índice</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Stack ────────────────────────────────────────────────────────
function StackTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona una Pila (Stack)?</Text>

      <Text style={styles.paragraph}>
        Una Pila (Stack) es una estructura de datos lineal que sigue el principio LIFO (Last In, First Out), lo que significa que el último elemento agregado es el primero en ser retirado.
      </Text>

      <Text style={styles.subtitle}>La Analogía de los Platos</Text>
      <Text style={styles.paragraph}>
        Es idéntica a una pila de platos limpios colocados sobre un resorte en un buffet. Colocas un plato arriba (Push) y cuando necesitas uno, retiras obligatoriamente el de arriba (Pop).
      </Text>

      <Text style={styles.subtitle}>Operaciones Principales</Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Push (Apilar):</Text> Inserta un elemento en el extremo superior.
      </Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Pop (Desapilar):</Text> Remueve el elemento superior.
      </Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Peek / Top:</Text> Obtiene el elemento del tope sin removerlo.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Propiedad LIFO:</Text>
        <LaTeX math="Pop() \implies retorna \ pila[tope] \quad y \quad tope \leftarrow tope - 1" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Push / Pop / Peek</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>Operaciones instantáneas en tiempo constante en el tope</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Búsqueda</Text>
          <View style={styles.mathCell}><LaTeX math="O(n)" /></View>
          <Text style={styles.complexityCellDesc}>Requiere desapilar todos los elementos para buscar uno al fondo</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Queue ────────────────────────────────────────────────────────
function QueueTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona una Cola (Queue)?</Text>

      <Text style={styles.paragraph}>
        Una Cola (Queue) es una estructura de datos lineal que sigue el principio FIFO (First In, First Out), lo que significa que el primer elemento insertado es el primero en ser removido.
      </Text>

      <Text style={styles.subtitle}>La Analogía del Banco</Text>
      <Text style={styles.paragraph}>
        Es exactamente como hacer fila en un banco. La primera persona en la fila es la primera en ser atendida (Dequeue), y las nuevas personas se agregan al final (Enqueue).
      </Text>

      <Text style={styles.subtitle}>Operaciones Principales</Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Enqueue (Encolar):</Text> Agrega un elemento al final (cola).
      </Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Dequeue (Desencolar):</Text> Remueve el primer elemento (frente).
      </Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Front:</Text> Inspecciona el primer elemento sin removerlo.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Propiedad FIFO:</Text>
        <LaTeX math="Dequeue() \implies retorna \ cola[inicio] \quad y \quad inicio \leftarrow inicio + 1" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Enqueue / Dequeue</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>Operaciones instantáneas en ambos extremos de la estructura</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Búsqueda</Text>
          <View style={styles.mathCell}><LaTeX math="O(n)" /></View>
          <Text style={styles.complexityCellDesc}>Requiere recorrer toda la cola elemento por elemento</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Linked List ────────────────────────────────────────────────────────
function LinkedListTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona una Lista Enlazada?</Text>

      <Text style={styles.paragraph}>
        Una lista enlazada (Linked List) es una colección lineal de nodos, donde cada nodo contiene un valor y una referencia (enlace) al siguiente nodo de la lista.
      </Text>

      <Text style={styles.subtitle}>La Analogía de los Vagones del Tren</Text>
      <Text style={styles.paragraph}>
        Es como un tren de carga. Cada vagón (nodo) contiene mercancía (valor) y un gancho (puntero) que lo conecta al siguiente vagón. La locomotora es la cabeza (head). Si agregas un vagón al inicio, solo cambias los ganchos correspondientes.
      </Text>

      <Text style={styles.subtitle}>Operaciones Clave</Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Acceso / Búsqueda:</Text> Debes caminar de nodo en nodo siguiendo los enlaces en tiempo <LaTeX math="O(n)" />.
      </Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Inserción al Inicio:</Text> Creas un nodo, apuntas su enlace a la cabeza actual, y actualizas la cabeza en tiempo <LaTeX math="O(1)" />.
      </Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Eliminación:</Text> Haces que el nodo anterior apunte al nodo siguiente del elemento a eliminar.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Estructura recursiva del nodo:</Text>
        <LaTeX math="Nodo = \{ valor: T, \ siguiente: Nodo \ | \ null \}" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Inserción / Borrado</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>Al inicio o con referencia directa al nodo</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Acceso por índice</Text>
          <View style={styles.mathCell}><LaTeX math="O(n)" /></View>
          <Text style={styles.complexityCellDesc}>Requiere recorrer la lista desde la cabeza paso a paso</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Deque ────────────────────────────────────────────────────────
function DequeTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona una Cola Doble (Deque)?</Text>

      <Text style={styles.paragraph}>
        Una Cola Doble (Double-Ended Queue) es una estructura de datos lineal que permite la inserción y eliminación de elementos en ambos extremos (frente y cola).
      </Text>

      <Text style={styles.subtitle}>La Analogía de la Baraja de Cartas</Text>
      <Text style={styles.paragraph}>
        Es como tener una baraja de cartas sobre la mesa: puedes colocar o retirar cartas tanto de la parte superior (frente) como de la parte inferior (final) de la baraja.
      </Text>

      <Text style={styles.subtitle}>Operaciones Clave</Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.code}>pushFront / pushBack</Text>: Inserta un elemento al inicio o final de la cola doble.
      </Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.code}>popFront / popBack</Text>: Remueve el primer o último elemento de la estructura.
      </Text>

      <Text style={styles.subtitle}>Estructura de Doble Enlace</Text>
      <Text style={styles.paragraph}>
        Suele implementarse mediante una lista doblemente enlazada, donde cada nodo tiene punteros tanto al nodo siguiente como al anterior, logrando eficiencia constante en los extremos.
      </Text>

      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Inserción / Borrado</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>Operaciones en los extremos (push/pop en frente/final)</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Acceso por índice</Text>
          <View style={styles.mathCell}><LaTeX math="O(n)" /></View>
          <Text style={styles.complexityCellDesc}>Requiere recorrer la lista desde el extremo más cercano</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Priority Queue ────────────────────────────────────────────────────────
function PriorityQueueTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona una Cola de Prioridad?</Text>

      <Text style={styles.paragraph}>
        Una Cola de Prioridad (Priority Queue) es una estructura donde cada elemento tiene una prioridad asociada. Los elementos con mayor prioridad se atienden antes que los de menor prioridad.
      </Text>

      <Text style={styles.subtitle}>La Analogía de Urgencias del Hospital</Text>
      <Text style={styles.paragraph}>
        En urgencias, los pacientes no son atendidos por orden de llegada (FIFO). Un paciente en estado crítico (máxima prioridad) ingresa de inmediato antes que alguien con síntomas leves.
      </Text>

      <Text style={styles.subtitle}>Mecanismo de Montículo (Heap)</Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Insertar:</Text> Agrega el elemento al final y lo hace ascender (sift up) hasta su nivel correcto de prioridad.
      </Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Extraer Máximo:</Text> Retira la raíz (elemento de mayor prioridad), sube el último elemento y lo hace descender (sift down).
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Costo de reacomodo basado en la altura:</Text>
        <LaTeX math="Altura = \lfloor \log_2 n \rfloor \implies Costo = O(\log n)" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Insertar / Extraer</Text>
          <View style={styles.mathCell}><LaTeX math="O(\log n)" /></View>
          <Text style={styles.complexityCellDesc}>Se recorre solo una rama de la raíz a una hoja en el montículo</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Ver Máxima Prioridad</Text>
          <View style={styles.mathCell}><LaTeX math="O(1)" /></View>
          <Text style={styles.complexityCellDesc}>El elemento de mayor prioridad siempre reside en la raíz</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Segment Tree ────────────────────────────────────────────────────────
function SegmentTreeTheory() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>¿Cómo funciona el Árbol de Segmentos?</Text>

      <Text style={styles.paragraph}>
        Un Árbol de Segmentos (Segment Tree) es un árbol binario que almacena intervalos o segmentos de un arreglo. Permite realizar consultas de rangos y actualizaciones de elementos eficientemente.
      </Text>

      <Text style={styles.subtitle}>La Analogía de los Gerentes de Ventas</Text>
      <Text style={styles.paragraph}>
        Imagina una cadena de tiendas. Cada tienda conoce sus ventas del día (hojas del árbol). Hay gerentes intermedios que saben la suma de ventas de un grupo de tiendas. Al consultar las ventas totales de un rango de tiendas, el director general le pregunta a unos pocos gerentes clave en lugar de a cada tienda individual.
      </Text>

      <Text style={styles.subtitle}>Operaciones y Estructura</Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Hojas:</Text> Almacenan los elementos del arreglo original.
      </Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Nodos internos:</Text> Almacenan valores precalculados (sumas, mínimos, máximos) del rango que cubren sus hijos.
      </Text>
      <Text style={styles.bulletPoint}>
        - <Text style={styles.bold}>Actualización:</Text> Cuando un elemento cambia, se actualiza su hoja y se sube por el árbol recalculando solo sus ancestros.
      </Text>

      <View style={styles.formulaCard}>
        <Text style={styles.formulaLabel}>Consulta de rangos y actualizaciones en tiempo logarítmico:</Text>
        <LaTeX math="T_{\text{query}}(n) = O(\log n) \quad \text{y} \quad T_{\text{update}}(n) = O(\log n)" block />
      </View>

      <Text style={styles.subtitle}>Análisis de Complejidad Matemática</Text>
      <View style={styles.complexityGrid}>
        <View style={styles.complexityItem}>
          <Text style={styles.complexityHeader}>Caso</Text>
          <Text style={styles.complexityHeader}>Complejidad</Text>
          <Text style={styles.complexityHeader}>Condición</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Consulta / Actualización</Text>
          <View style={styles.mathCell}><LaTeX math="O(\log n)" /></View>
          <Text style={styles.complexityCellDesc}>Se visitan máximo 4 nodos por nivel en la recursión</Text>
        </View>
        <View style={styles.complexityRow}>
          <Text style={styles.complexityCell}>Construcción</Text>
          <View style={styles.mathCell}><LaTeX math="O(n)" /></View>
          <Text style={styles.complexityCellDesc}>Se construye una sola vez recorriendo y sumando el arreglo original</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Estilos Generales Compartidos ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    gap: Spacing[4],
  },
  bold: {
    fontWeight: 'bold',
    color: DarkText.primary,
  },
  sectionTitle: {
    ...TextVariants.h3,
    color: DarkText.primary,
    marginBottom: Spacing[2],
  },
  subtitle: {
    ...TextVariants.h4,
    color: Accent[500],
    marginTop: Spacing[3],
    marginBottom: Spacing[1],
  },
  paragraph: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    lineHeight: 22,
  },
  bulletPoint: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    lineHeight: 22,
    paddingLeft: Spacing[4],
    marginBottom: Spacing[1],
  },
  code: {
    fontFamily: 'monospace',
    color: '#00D4FF',
    backgroundColor: DarkSurfaces.surfaceElevated,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  formulaCard: {
    backgroundColor: DarkSurfaces.surface,
    borderColor: DarkSurfaces.border,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    marginVertical: Spacing[2],
    alignItems: 'center',
  },
  formulaLabel: {
    ...TextVariants.caption,
    color: DarkText.muted,
    marginBottom: 4,
  },
  complexityGrid: {
    backgroundColor: DarkSurfaces.surface,
    borderColor: DarkSurfaces.border,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing[3],
    overflow: 'hidden',
  },
  complexityItem: {
    flexDirection: 'row',
    backgroundColor: DarkSurfaces.surfaceElevated,
    padding: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: DarkSurfaces.border,
  },
  complexityHeader: {
    flex: 1,
    ...TextVariants.labelSm,
    color: DarkText.primary,
    fontWeight: 'bold',
  },
  complexityRow: {
    flexDirection: 'row',
    padding: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: DarkSurfaces.borderSubtle,
    alignItems: 'center',
  },
  complexityCell: {
    flex: 1,
    ...TextVariants.bodySm,
    color: DarkText.primary,
  },
  mathCell: {
    flex: 1,
    justifyContent: 'center',
  },
  complexityCellDesc: {
    flex: 1,
    ...TextVariants.bodySm,
    color: DarkText.muted,
  },
});
