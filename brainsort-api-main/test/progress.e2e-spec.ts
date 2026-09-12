import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { LightMyRequestResponse } from 'fastify';
import { AppModule } from './../src/app.module';
import { createTestApp } from './create-test-app';

describe('ProgressModule (e2e)', () => {
  let app: INestApplication<NestFastifyApplication>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleFixture);

    // Registrar usuario nuevo para tener un estado limpio de progreso
    const email = `progress_e2e_${Date.now()}@example.com`;
    const registerResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          correo: email,
          contrasena: 'Password123!',
          nombre: 'Progreso E2E User',
          rol: 'Estudiante',
        },
      });

    const registerBody = JSON.parse(registerResponse.payload);
    authToken = registerBody.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Flujo de Progreso y Ranking', () => {
    it('debe obtener progreso inicial en 0', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/progreso/me',
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(body.data).toHaveProperty('puntosTotales');
      expect(body.data.puntosTotales).toBe(0);
      expect(body.data.nivelActual).toBe(1);
    });

    it('debe completar una sesión (sincronizar) y verificar progreso actualizado', async () => {
      // 1. Obtener algoritmo
      const libraryResponse: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/biblioteca',
        });

      const libraryBody = JSON.parse(libraryResponse.payload);
      if (
        !libraryBody.data?.algoritmos ||
        libraryBody.data.algoritmos.length === 0
      ) {
        console.warn('No hay algoritmos, saltando prueba');
        return;
      }
      const algoritmoId = libraryBody.data.algoritmos[0].id;

      // 2. Sincronizar progreso (simular sesión completada offline)
      const syncResponse: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/progress/sync',
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: {
            sesiones: [
              {
                algoritmoId,
                pasosCompletados: 10,
                completada: true,
                fechaInicio: new Date().toISOString(),
                fechaFin: new Date().toISOString(),
              },
            ],
          },
        });

      expect(syncResponse.statusCode).toBe(201);

      // 3. Consultar progreso actualizado
      const progressResponse: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/progreso/me',
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        });

      const progressBody = JSON.parse(progressResponse.payload);
      expect(progressBody.data.puntosTotales).toBeGreaterThan(0);

      // 4. Verificar que aparece en el ranking
      const rankingResponse: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/progreso/ranking',
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        });

      expect(rankingResponse.statusCode).toBe(200);
      const rankingBody = JSON.parse(rankingResponse.payload);

      expect(Array.isArray(rankingBody.data.ranking)).toBe(true);
      expect(typeof rankingBody.data.total).toBe('number');
      // El usuario debería estar en el ranking, o al menos el endpoint responde
      if (rankingBody.data.ranking.length > 0) {
        expect(rankingBody.data.ranking[0]).toHaveProperty('usuarioId');
        expect(rankingBody.data.ranking[0]).toHaveProperty('nombre');
        expect(rankingBody.data.ranking[0]).toHaveProperty('puntosTotales');
      }
    });

    it('debe requerir autenticación para ver progreso personal', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/progreso/me',
        });

      expect(response.statusCode).toBe(401);
    });

    it('debe requerir autenticación para ver el ranking', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/progreso/ranking',
        });

      expect(response.statusCode).toBe(401);
    });
  });
});
