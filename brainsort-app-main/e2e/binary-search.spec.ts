import { expect, test } from '@playwright/test';

async function mockApi(page: any) {
  // Mock login api
  await page.route('**/api/auth/login', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          token: 'e2e-access-token',
          refreshToken: 'e2e-refresh-token',
          usuario: {
            id: 'usr-e2e',
            nombre: 'Dev User',
            correo: 'dev@brainsort.app',
            rol: 'Estudiante',
            tipo: 'usuario',
          },
        },
      }),
    });
  });

  // Mock progress api
  await page.route('**/api/progreso/me', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          puntosTotales: 350,
          nivelActual: 2,
          rachaDias: 4,
          posicionRanking: 3,
          insignias: [],
          simulacionesCompletadas: 7,
          ejerciciosCorrectos: 5,
          ejerciciosTotales: 8,
        },
      }),
    });
  });

  // Mock learning path api
  await page.route('**/api/ruta-aprendizaje/me', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'ruta-e2e',
          algoritmos: [],
        },
      }),
    });
  });

  // Mock user details
  await page.route('**/api/users/me', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'usr-e2e',
          nombre: 'Dev User',
          correo: 'dev@brainsort.app',
          rol: 'Estudiante',
        },
      }),
    });
  });

  // Mock library api
  await page.route('**/api/biblioteca', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          categorias: ['Busqueda'],
          totalAlgoritmos: 1,
          algoritmos: [
            {
              id: 'binary-search',
              nombre: 'Binary Search',
              descripcion: 'Búsqueda eficiente sobre arreglos ordenados.',
              complejidadTiempo: 'O(log n)',
              complejidadEspacio: 'O(1)',
              categoria: 'Busqueda',
              dificultad: 'Medio',
              tags: ['Busqueda'],
            },
          ],
        },
      }),
    });
  });

  // Mock algorithm detail api
  await page.route('**/api/algoritmos/binary-search', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'binary-search',
          nombre: 'Binary Search',
          descripcion: 'Búsqueda eficiente sobre arreglos ordenados.',
          complejidadTiempo: 'O(log n)',
          complejidadEspacio: 'O(1)',
          categoria: 'Busqueda',
          dificultad: 'Medio',
          tags: ['Busqueda'],
          pseudocode: [
            { line: 1, text: 'low = 0; high = n - 1', indent: 0 },
            { line: 2, text: 'Mientras low <= high', indent: 0 },
            { line: 3, text: '  mid = piso((low + high) / 2)', indent: 1 },
            { line: 4, text: '  Si arreglo[mid] == objetivo: devolver mid', indent: 1 },
            { line: 5, text: '  Si arreglo[mid] < objetivo: low = mid + 1', indent: 1 },
            { line: 6, text: '  Si no: high = mid - 1', indent: 1 },
          ],
        },
      }),
    });
  });

  // Mock simulation runner api
  await page.route('**/api/simulaciones', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          simulacion: {
            velocidadReproduccion: 1.0,
            estadoActual: 'Pausa',
            pasoActual: 1,
          },
          pseudocode: [
            { line: 1, text: 'low = 0; high = n - 1', indent: 0 },
            { line: 2, text: 'Mientras low <= high', indent: 0 },
            { line: 3, text: '  mid = piso((low + high) / 2)', indent: 1 },
            { line: 4, text: '  Si arreglo[mid] == objetivo: devolver mid', indent: 1 },
            { line: 5, text: '  Si arreglo[mid] < objetivo: low = mid + 1', indent: 1 },
            { line: 6, text: '  Si no: high = mid - 1', indent: 1 },
          ],
          totalPasos: 3,
          pasos: [
            {
              numeroPaso: 1,
              tipoOperacion: 'comparacion',
              indicesActivos: [3],
              valores: [10, 20, 30, 40, 50, 60, 70],
              lineaPseudocodigo: 3,
              mensaje: 'Calculando elemento medio mid = 3 (valor 40)',
              markers: [
                { index: 0, label: 'low', role: 'pointer', color: '#00D4FF' },
                { index: 6, label: 'high', role: 'pointer', color: '#00D4FF' },
                { index: 3, label: 'mid', role: 'pointer', color: '#F5A623' },
              ],
            },
            {
              numeroPaso: 2,
              tipoOperacion: 'comparacion',
              indicesActivos: [5],
              valores: [10, 20, 30, 40, 50, 60, 70],
              lineaPseudocodigo: 5,
              mensaje: 'El objetivo es mayor que 40, actualizando low = mid + 1 = 4',
              markers: [
                { index: 0, label: '', role: 'descartado', color: '#1A2333' },
                { index: 1, label: '', role: 'descartado', color: '#1A2333' },
                { index: 2, label: '', role: 'descartado', color: '#1A2333' },
                { index: 3, label: '', role: 'descartado', color: '#1A2333' },
                { index: 4, label: 'low', role: 'pointer', color: '#00D4FF' },
                { index: 6, label: 'high', role: 'pointer', color: '#00D4FF' },
                { index: 5, label: 'mid', role: 'pointer', color: '#F5A623' },
              ],
            },
            {
              numeroPaso: 3,
              tipoOperacion: 'completado',
              indicesActivos: [5],
              valores: [10, 20, 30, 40, 50, 60, 70],
              lineaPseudocodigo: 4,
              mensaje: '¡Objetivo encontrado en el índice 5!',
              markers: [
                { index: 0, label: '', role: 'descartado', color: '#1A2333' },
                { index: 1, label: '', role: 'descartado', color: '#1A2333' },
                { index: 2, label: '', role: 'descartado', color: '#1A2333' },
                { index: 3, label: '', role: 'descartado', color: '#1A2333' },
                { index: 5, label: 'found', role: 'final', color: '#7ED321' },
              ],
            },
          ],
        },
      }),
    });
  });

  // Mock exercises fetch api
  await page.route('**/api/ejercicios/binary-search', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'ex-bs-1',
          tipo: 'OrdenarBarras',
          pregunta: '¿Cuál es la barra que corresponde al elemento medio (mid) en la primera iteración?',
          dificultad: 'Medio',
          algoritmoId: 'binary-search',
          contenido: {
            modoSeleccion: true,
            inicial: [12, 24, 35, 48, 57, 69, 82],
            pasoObjetivo: 'Con low=0 y high=6, calcula el índice del elemento medio.',
          },
        },
      ]),
    });
  });

  // Mock answer api
  await page.route('**/api/ejercicios/*/responder', async (route: any) => {
    const payload = route.request().postDataJSON();
    const isCorrect = payload.respuesta === '3';
    if (isCorrect) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          correcto: true,
          feedback: '¡Excelente! El índice del elemento medio es 3 (valor 48).',
          feedbackPositivo: '¡Excelente! El índice del elemento medio es 3 (valor 48).',
          puntosGanados: 10,
          puntosTotales: 360,
          rachaDias: 4,
          posicionRanking: 3,
          nivelActual: 2,
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          correcto: false,
          feedback: 'Intenta nuevamente. Recuerda que con low=0 y high=6, mid es 3.',
          feedbackNegativo: 'Intenta nuevamente. Recuerda que con low=0 y high=6, mid es 3.',
          puntosGanados: 0,
          puntosTotales: 350,
          rachaDias: 4,
          posicionRanking: 3,
          nivelActual: 2,
        }),
      });
    }
  });
}

test('Verificar simulación visual de búsqueda binaria y resolución de ejercicio interactivo', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');

  // 1. Iniciar sesión
  await page.getByTestId('input-correo').fill('ada@example.com');
  await page.getByTestId('input-contrasena').fill('Password123');
  await page.getByTestId('btn-login').click();

  // 2. Navegar a la Biblioteca
  await expect(page.getByLabel('Biblioteca', { exact: false }).first()).toBeVisible();
  
  // 3. Entrar al detalle de Binary Search
  await page.locator('text=Binary Search').filter({ visible: true }).first().click();
  
  // Esperar a que cargue el detalle del algoritmo y hacer clic en Iniciar Simulación
  await page.locator('text=Iniciar Simulación').filter({ visible: true }).first().click();
  
  // Esperar a que cargue la pantalla de simulación
  await expect(page.locator('text=Binary Search').filter({ visible: true }).first()).toBeVisible();
  
  // Verificar leyenda de colores de búsqueda específica
  await expect(page.locator('text=Buscando').filter({ visible: true }).first()).toBeVisible();
  await expect(page.locator('text=Elemento Medio (mid)').filter({ visible: true }).first()).toBeVisible();
  await expect(page.locator('text=Descartado').filter({ visible: true }).first()).toBeVisible();
  
  // Tomar captura de pantalla del canvas inicial
  await page.screenshot({ path: 'output/playwright-report/binary-search-simulation-start.png' });

  // Verificar y alternar el botón de variables inline
  const toggleBtn = page.getByTestId('btn-toggle-inline-values');
  await expect(toggleBtn).toBeVisible();
  await expect(toggleBtn).toHaveText('Var: On');

  // Verificar que el pseudocódigo contiene variables con sus valores, p.ej., "low:0"
  await expect(page.locator('text=low:0').first()).toBeVisible();

  // Hacer clic para desactivar
  await toggleBtn.click();
  await expect(toggleBtn).toHaveText('Var: Off');
  // Verificar que ya no hay variables con valores inline
  await expect(page.locator('text=low:0').first()).not.toBeVisible();

  // Activar de nuevo
  await toggleBtn.click();
  await expect(toggleBtn).toHaveText('Var: On');

  // Avanzar un paso y verificar
  await page.getByTestId('btn-next-step').click();
  await page.screenshot({ path: 'output/playwright-report/binary-search-simulation-step2.png' });

  // 4. Ir a ejercicios prácticos
  await page.getByTestId('btn-practice').click();

  // Esperar pantalla de ejercicios
  await expect(page.getByText('Selecciona la barra correcta')).toBeVisible();
  await expect(page.getByText('Toca la barra que corresponde a la respuesta.')).toBeVisible();

  // Tomar captura del ejercicio antes de responder
  await page.screenshot({ path: 'output/playwright-report/binary-search-exercise-before.png' });

  // Seleccionar la barra con el valor 48 (índice 3)
  await page.getByText('48').click();

  // Tomar captura después de seleccionar la barra
  await page.screenshot({ path: 'output/playwright-report/binary-search-exercise-selected.png' });

  // Comprobar la respuesta
  await page.locator('text=Comprobar').first().click();

  // Esperar mensaje de éxito
  await expect(page.locator('text=Correcto').filter({ visible: true }).first()).toBeVisible();
  await expect(page.locator('text=¡Excelente!').filter({ visible: true }).first()).toBeVisible();

  // Tomar captura del resultado exitoso
  await page.screenshot({ path: 'output/playwright-report/binary-search-exercise-success.png' });

  // Terminar sesión de práctica
  await page.locator('text=Terminar sesión').first().click();
  
  // Regresar a la pantalla de Simulación (pantalla anterior en el stack)
  await expect(page.getByTestId('btn-practice').first()).toBeVisible();
});
