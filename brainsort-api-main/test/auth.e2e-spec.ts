import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { LightMyRequestResponse } from 'fastify';
import { AppModule } from './../src/app.module';
import { createTestApp } from './create-test-app';

// Tipos para respuestas de autenticación
interface AuthResponse {
  data: {
    token: string;
    refreshToken: string;
    usuario: {
      correo: string;
      id: string;
      nombre: string;
    };
  };
}

interface ErrorResponse {
  message: string;
  statusCode: number;
}

describe('AuthController (e2e)', () => {
  let app: INestApplication<NestFastifyApplication>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleFixture);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('debe registrar un usuario exitosamente', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            correo: uniqueEmail,
            contrasena: 'Password123!',
            nombre: 'Test User',
            rol: 'Estudiante',
          },
        });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload) as AuthResponse;
      expect(body.data).toHaveProperty('token');
      expect(body.data).toHaveProperty('refreshToken');
      expect(body.data).toHaveProperty('usuario');
      expect(body.data.usuario.correo).toBe(uniqueEmail);
    });

    it('debe rechazar registro con email duplicado', async () => {
      const email = `duplicate${Date.now()}@example.com`;

      // Primer registro
      await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            correo: email,
            contrasena: 'Password123!',
            nombre: 'Test User',
            rol: 'Estudiante',
          },
        });

      // Segundo registro con mismo email
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            correo: email,
            contrasena: 'Password123!',
            nombre: 'Test User 2',
            rol: 'Estudiante',
          },
        });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.payload) as ErrorResponse;
      expect(body.message).toContain('Email already registered');
    });

    it('debe rechazar registro con email inválido', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            correo: 'email-invalido',
            contrasena: 'Password123!',
            nombre: 'Test User',
            rol: 'Estudiante',
          },
        });

      expect(response.statusCode).toBe(400);
    });

    it('debe rechazar registro con contraseña débil', async () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            correo: uniqueEmail,
            contrasena: '123',
            nombre: 'Test User',
            rol: 'Estudiante',
          },
        });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debe hacer login exitosamente', async () => {
      const email = `login${Date.now()}@example.com`;

      // Registrar usuario primero
      await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            correo: email,
            contrasena: 'Password123!',
            nombre: 'Login Test',
            rol: 'Estudiante',
          },
        });

      // Login
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/login',
          payload: {
            correo: email,
            contrasena: 'Password123!',
          },
        });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as AuthResponse;
      expect(body.data).toHaveProperty('token');
      expect(body.data).toHaveProperty('refreshToken');
      expect(body.data).toHaveProperty('usuario');
    });

    it('debe rechazar login con credenciales incorrectas', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/login',
          payload: {
            correo: 'noexiste@example.com',
            contrasena: 'Password123!',
          },
        });

      expect(response.statusCode).toBe(401);
    });

    it('debe rechazar login con contraseña incorrecta', async () => {
      const email = `wrongpass${Date.now()}@example.com`;

      // Registrar usuario
      await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            correo: email,
            contrasena: 'Password123!',
            nombre: 'Wrong Pass Test',
            rol: 'Estudiante',
          },
        });

      // Login con contraseña incorrecta
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/login',
          payload: {
            correo: email,
            contrasena: 'WrongPassword123!',
          },
        });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('debe refrescar el token exitosamente', async () => {
      const email = `refresh${Date.now()}@example.com`;

      // Registrar usuario
      const registerResponse: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: {
            correo: email,
            contrasena: 'Password123!',
            nombre: 'Refresh Test',
            rol: 'Estudiante',
          },
        });

      const registerBody = JSON.parse(registerResponse.payload) as AuthResponse;

      // Refresh token
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/refresh',
          payload: {
            refreshToken: registerBody.data.refreshToken,
          },
        });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as AuthResponse;
      expect(body.data).toHaveProperty('token');
      expect(body.data).toHaveProperty('refreshToken');
    });

    it('debe rechazar refresh token inválido', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'POST',
          url: '/api/auth/refresh',
          payload: {
            refreshToken: 'token-invalido',
          },
        });

      expect(response.statusCode).toBe(401);
    });
  });
});
