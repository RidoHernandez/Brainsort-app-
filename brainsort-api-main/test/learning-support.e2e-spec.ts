import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { LightMyRequestResponse } from 'fastify';
import { AppModule } from './../src/app.module';
import { createTestApp } from './create-test-app';

describe('Learning support flows (e2e)', () => {
  let app: INestApplication<NestFastifyApplication>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleFixture);

    const email = `learning_support_e2e_${Date.now()}@example.com`;
    const registerResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          correo: email,
          contrasena: 'Password123!',
          nombre: 'Learning Support E2E User',
          rol: 'Estudiante',
        },
      });

    const registerBody = JSON.parse(registerResponse.payload);
    authToken = registerBody.data.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debe evaluar diagnostico y generar una ruta consultable', async () => {
    const preguntasResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'GET',
        url: '/api/diagnostico/preguntas',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

    expect(preguntasResponse.statusCode).toBe(200);
    const preguntasBody = JSON.parse(preguntasResponse.payload);
    expect(Array.isArray(preguntasBody.data)).toBe(true);
    if (preguntasBody.data.length > 0) {
      expect(preguntasBody.data[0]).not.toHaveProperty('indiceCorrecto');
    }

    const respuestas = preguntasBody.data.map(() => 0);
    const evaluarResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'POST',
        url: '/api/diagnostico/evaluar',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: { respuestas },
      });

    expect(evaluarResponse.statusCode).toBe(201);
    const evaluarBody = JSON.parse(evaluarResponse.payload);
    expect(evaluarBody.data).toHaveProperty('puntaje');
    expect(evaluarBody.data).toHaveProperty('rutaGenerada');
    expect(evaluarBody.data.algoritmosSugeridos).toBeGreaterThan(0);

    const rutaResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'GET',
        url: '/api/ruta-aprendizaje/me',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

    expect(rutaResponse.statusCode).toBe(200);
    const rutaBody = JSON.parse(rutaResponse.payload);
    expect(Array.isArray(rutaBody.data.algoritmos)).toBe(true);
    expect(rutaBody.data.algoritmos.length).toBeGreaterThan(0);
  });

  it('debe exponer insignias disponibles y las insignias del usuario', async () => {
    const badgesResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'GET',
        url: '/api/insignias',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

    expect(badgesResponse.statusCode).toBe(200);
    const badgesBody = JSON.parse(badgesResponse.payload);
    expect(Array.isArray(badgesBody.data)).toBe(true);
    if (badgesBody.data.length > 0) {
      expect(badgesBody.data[0]).toHaveProperty('criterioDesbloqueo');
      expect(badgesBody.data[0]).toHaveProperty('desbloqueada', false);
    }

    const userBadgesResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'GET',
        url: '/api/insignias/me',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

    expect(userBadgesResponse.statusCode).toBe(200);
    const userBadgesBody = JSON.parse(userBadgesResponse.payload);
    expect(Array.isArray(userBadgesBody.data)).toBe(true);
  });

  it('debe listar y descargar modulos offline', async () => {
    const modulesResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'GET',
        url: '/api/modules/offline',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

    expect(modulesResponse.statusCode).toBe(200);
    const modulesBody = JSON.parse(modulesResponse.payload);
    expect(Array.isArray(modulesBody.data)).toBe(true);
    expect(modulesBody.data.length).toBeGreaterThan(0);

    const firstModule = modulesBody.data[0];
    expect(firstModule).toHaveProperty('algoritmoId');
    expect(firstModule).toHaveProperty('tamanoKB');

    const downloadResponse: LightMyRequestResponse = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'GET',
        url: `/api/modules/offline/${firstModule.algoritmoId}/download`,
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

    expect(downloadResponse.statusCode).toBe(200);
    const downloadBody = JSON.parse(downloadResponse.payload);
    expect(downloadBody.data.algoritmoId).toBe(firstModule.algoritmoId);
    expect(downloadBody.data.version).toBe(firstModule.version);
    expect(downloadBody.data.meta.id).toBe(firstModule.algoritmoId);
    expect(Array.isArray(downloadBody.data.pseudocode)).toBe(true);
    expect(Array.isArray(downloadBody.data.ejercicios)).toBe(true);
  });

  it('debe proteger endpoints de soporte de aprendizaje', async () => {
    const protectedRequests = [
      { method: 'GET', url: '/api/diagnostico/preguntas' },
      { method: 'GET', url: '/api/ruta-aprendizaje/me' },
      { method: 'GET', url: '/api/insignias' },
      { method: 'GET', url: '/api/modules/offline' },
    ];

    for (const request of protectedRequests) {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject(request);

      expect(response.statusCode).toBe(401);
    }
  });
});
