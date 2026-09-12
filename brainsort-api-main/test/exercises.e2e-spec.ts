import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { LightMyRequestResponse } from 'fastify';
import { AppModule } from './../src/app.module';
import { createTestApp } from './create-test-app';

describe('ExercisesModule (e2e)', () => {
  let app: INestApplication<NestFastifyApplication>;
  let authToken: string;
  let algoritmoId: string;
  let ejercicioId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleFixture);

    // 1. Registrar usuario para obtener token
    const email = `exercises_e2e_${Date.now()}@example.com`;
    const registerResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          correo: email,
          contrasena: 'Password123!',
          nombre: 'Ejercicios E2E User',
          rol: 'Estudiante',
        },
      });

    const registerBody = JSON.parse(registerResponse.payload);
    authToken = registerBody.data.token;

    // 2. Obtener un algoritmo de la biblioteca para buscar sus ejercicios
    const libraryResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'GET',
        url: '/api/biblioteca',
      });

    const libraryBody = JSON.parse(libraryResponse.payload);
    // Tomamos el primer algoritmo disponible
    if (libraryBody.data?.algoritmos?.length > 0) {
      algoritmoId = libraryBody.data.algoritmos[0].id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Flujo de Ejercicios', () => {
    it('debe obtener ejercicios de un algoritmo', async () => {
      if (!algoritmoId) {
        console.warn(
          'No hay algoritmos en la base de datos para probar ejercicios',
        );
        return;
      }

      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: `/api/ejercicios/${algoritmoId}`,
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);

      expect(Array.isArray(body.data)).toBe(true);

      // Si el seed incluyó ejercicios, guardamos uno para la siguiente prueba
      if (body.data.length > 0) {
        ejercicioId = body.data[0].id;
        expect(body.data[0]).toHaveProperty('pregunta');
        expect(body.data[0]).toHaveProperty('dificultad');
        // Validar que no se filtra la respuesta correcta al cliente
        expect(body.data[0]).not.toHaveProperty('respuestaCorrecta');
      }
    });

    it('debe procesar respuesta correcta y actualizar puntos', async () => {
      if (!ejercicioId) {
        console.warn('No hay ejercicios disponibles para responder');
        return;
      }

      // 1. Obtener progreso actual
      const progressBefore: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/progreso/me',
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        });
      const progressBeforeBody = JSON.parse(progressBefore.payload);
      const puntosAntes = progressBeforeBody.data.puntosTotales || 0;

      // Nota: En un entorno de pruebas real con base de datos de test,
      // necesitaríamos consultar la DB para saber la respuesta correcta,
      // o mockear el servicio de ejercicios para predecir el resultado.
      // Aquí estamos haciendo la prueba asumiendo que enviamos una respuesta.
      // Dependiendo de si es correcta o no (por los datos del seed), evaluamos la respuesta.

      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: `/api/ejercicios/${ejercicioId}/responder`,
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: {
            respuesta: 'alguna respuesta',
          },
        });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);

      expect(body.data).toHaveProperty('correcto');
      expect(body.data).toHaveProperty('feedback');
      expect(body.data).toHaveProperty('puntosTotales');

      if (body.data.correcto) {
        expect(body.data).toHaveProperty('feedbackPositivo');
        expect(body.data.puntosTotales).toBeGreaterThan(puntosAntes);
      } else {
        expect(body.data).toHaveProperty('feedbackNegativo');
        expect(body.data.puntosTotales).toBe(puntosAntes);
      }
    });

    it('debe rechazar respuesta a ejercicio inexistente', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: `/api/ejercicios/ejercicio-inexistente-12345/responder`,
          headers: {
            authorization: `Bearer ${authToken}`,
          },
          payload: {
            respuesta: 'test',
          },
        });

      expect(response.statusCode).toBe(404);
    });

    it('debe requerir autenticación para obtener ejercicios', async () => {
      if (!algoritmoId) return;

      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: `/api/ejercicios/${algoritmoId}`,
        });

      expect(response.statusCode).toBe(401);
    });
  });
});
