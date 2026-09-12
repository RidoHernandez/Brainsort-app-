-- Add mock exercises for gamification
-- These exercises are hardcoded in the frontend for development
-- This migration adds them to the database so they can be fetched via API

-- Insert Bubble Sort exercise
INSERT INTO "ejercicios_prediccion" (id, pregunta, "respuestaCorrecta", dificultad, "feedbackPositivo", "feedbackNegativo", "algoritmoId", "createdAt")
SELECT 
  gen_random_uuid(),
  'Dado el arreglo [5, 2, 8, 1], ¿cuál es el resultado después de la primera pasada completa de Bubble Sort?',
  '[2, 5, 1, 8]',
  'Facil',
  '¡Correcto! En la primera pasada, Bubble Sort compara pares adyacentes y deja el elemento más grande al final.',
  'Incorrecto. Recuerda que Bubble Sort compara pares adyacentes de izquierda a derecha y al final de la pasada el mayor queda al final.',
  id,
  NOW()
FROM "algoritmos"
WHERE nombre = 'Bubble Sort'
AND NOT EXISTS (
  SELECT 1 FROM "ejercicios_prediccion" 
  WHERE pregunta = 'Dado el arreglo [5, 2, 8, 1], ¿cuál es el resultado después de la primera pasada completa de Bubble Sort?'
);

-- Insert Selection Sort exercise
INSERT INTO "ejercicios_prediccion" (id, pregunta, "respuestaCorrecta", dificultad, "feedbackPositivo", "feedbackNegativo", "algoritmoId", "createdAt")
SELECT 
  gen_random_uuid(),
  'En Selection Sort, dado el arreglo [4, 7, 1, 3], ¿cuál es el primer intercambio que se realiza?',
  'Intercambiar 4 con 1',
  'Facil',
  '¡Correcto! Selection Sort busca el mínimo de todo el arreglo y lo intercambia con la primera posición.',
  'Incorrecto. Selection Sort primero ubica el valor mínimo del arreglo y luego lo intercambia con el primer elemento.',
  id,
  NOW()
FROM "algoritmos"
WHERE nombre = 'Selection Sort'
AND NOT EXISTS (
  SELECT 1 FROM "ejercicios_prediccion" 
  WHERE pregunta = 'En Selection Sort, dado el arreglo [4, 7, 1, 3], ¿cuál es el primer intercambio que se realiza?'
);

-- Insert Insertion Sort exercise
INSERT INTO "ejercicios_prediccion" (id, pregunta, "respuestaCorrecta", dificultad, "feedbackPositivo", "feedbackNegativo", "algoritmoId", "createdAt")
SELECT 
  gen_random_uuid(),
  'En Insertion Sort, dado el arreglo [3, 1, 4, 2], ¿cuál es el estado del arreglo después de insertar el segundo elemento?',
  '[1, 3, 4, 2]',
  'Facil',
  '¡Correcto! Insertion Sort toma el segundo elemento y lo inserta en la posición correcta dentro de la sublista ordenada.',
  'Incorrecto. Insertion Sort inserta cada elemento en orden dentro del subarreglo izquierdo ya ordenado.',
  id,
  NOW()
FROM "algoritmos"
WHERE nombre = 'Insertion Sort'
AND NOT EXISTS (
  SELECT 1 FROM "ejercicios_prediccion" 
  WHERE pregunta = 'En Insertion Sort, dado el arreglo [3, 1, 4, 2], ¿cuál es el estado del arreglo después de insertar el segundo elemento?'
);
