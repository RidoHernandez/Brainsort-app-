import { expect, test, type Page } from '@playwright/test';

async function mockApi(page: Page) {
  // Mock library api
  await page.route('**/api/biblioteca', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          categorias: ['Ordenamiento'],
          totalAlgoritmos: 2,
          algoritmos: [
            {
              id: 'bubble-sort',
              nombre: 'Bubble Sort',
              descripcion: 'Ordenamiento por intercambio.',
              complejidadTiempo: 'O(n^2)',
              complejidadEspacio: 'O(1)',
              categoria: 'Ordenamiento',
              dificultad: 'Fácil',
              tags: ['basico'],
            },
            {
              id: 'merge-sort',
              nombre: 'Merge Sort',
              descripcion: 'Ordenamiento divide y venceras.',
              complejidadTiempo: 'O(n log n)',
              complejidadEspacio: 'O(n)',
              categoria: 'Ordenamiento',
              dificultad: 'Medio',
              tags: ['intermedio'],
            },
          ],
        },
      }),
    });
  });

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          token: 'e2e-access-token',
          refreshToken: 'e2e-refresh-token',
          usuario: {
            id: 'usr-e2e',
            nombre: 'Ada Lovelace',
            correo: 'ada@example.com',
            rol: 'Estudiante',
            tipo: 'usuario',
          },
        },
      }),
    });
  });

  await page.route('**/api/progreso/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          puntosTotales: 350,
          nivelActual: 2,
          rachaDias: 4,
          posicionRanking: 3,
          ultimaActividad: '2026-05-17T10:00:00Z',
          insignias: [
            {
              nombre: 'Primer algoritmo',
              imagen: 'badge-1.png',
              fechaObtencion: '2026-05-17T10:00:00Z',
            },
          ],
          simulacionesCompletadas: 7,
          ejerciciosCorrectos: 5,
          ejerciciosTotales: 8,
        },
      }),
    });
  });

  await page.route('**/api/ruta-aprendizaje/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'ruta-e2e',
          createdAt: '2026-05-17T10:00:00Z',
          algoritmos: [
            {
              id: 'bubble-sort',
              nombre: 'Bubble Sort',
              descripcion: 'Ordenamiento por intercambio.',
              complejidadTiempo: 'O(n^2)',
              complejidadEspacio: 'O(1)',
              categoria: 'Ordenamiento',
              tags: ['basico'],
            },
            {
              id: 'merge-sort',
              nombre: 'Merge Sort',
              descripcion: 'Ordenamiento divide y venceras.',
              complejidadTiempo: 'O(n log n)',
              complejidadEspacio: 'O(n)',
              categoria: 'Ordenamiento',
              tags: ['intermedio'],
            },
          ],
        },
      }),
    });
  });

  await page.route('**/api/users/me', async (route) => {
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 'usr-e2e',
            nombre: body.nombre,
            correo: 'dev@brainsort.app',
            rol: 'Estudiante',
          },
        }),
      });
      return;
    }

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
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
});

test('login permite autenticarse y entrar a la app principal', async ({ page }) => {
  await page.getByTestId('input-correo').fill('ada@example.com');
  await page.getByTestId('input-contrasena').fill('Password123');
  await page.getByTestId('btn-login').click();

  await expect(page.getByLabel('Biblioteca de algoritmos').filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByLabel('Mi ruta de aprendizaje').filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByLabel('Mi perfil').filter({ visible: true }).first()).toBeVisible();
});

test('ruta de aprendizaje muestra la secuencia recomendada', async ({ page }) => {
  await page.getByTestId('input-correo').fill('ada@example.com');
  await page.getByTestId('input-contrasena').fill('Password123');
  await page.getByTestId('btn-login').click();
  await page.getByLabel('Mi ruta de aprendizaje').filter({ visible: true }).first().click();

  await expect(page.getByText('Tu Camino a Seguir')).toBeVisible();
  await expect(page.getByText('Bubble Sort').filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText('Merge Sort').filter({ visible: true }).first()).toBeVisible();
});

test('perfil muestra datos del usuario y permite editar nombre', async ({ page }) => {
  await page.getByTestId('input-correo').fill('ada@example.com');
  await page.getByTestId('input-contrasena').fill('Password123');
  await page.getByTestId('btn-login').click();
  await page.getByLabel('Mi perfil').filter({ visible: true }).first().click();

  await expect(page.getByText('Mi Perfil')).toBeVisible();
  await expect(page.getByText('Ada Lovelace')).toBeVisible();
  await expect(page.getByText('ada@example.com')).toBeVisible();

  await page.getByText('Ada Lovelace').click();
  await page.getByPlaceholder('Tu nombre').fill('Roberth QA');
  await page.getByText('Guardar').click();

  await expect(page.getByText('Roberth QA')).toBeVisible();
});
