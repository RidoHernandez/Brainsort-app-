import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { LightMyRequestResponse } from 'fastify';
import { AppModule } from './../src/app.module';
import { createTestApp } from './create-test-app';

// Tipos para respuestas de biblioteca
interface Algoritmo {
  id: string;
  nombre: string;
  descripcion: string;
  complejidadTiempo: string;
  complejidadEspacio: string;
  categoria: string;
  dificultad: string;
}

interface AlgoritmoDetalle extends Algoritmo {
  pseudocode: Array<{
    line: number;
    text: string;
    indent: number;
  }>;
}

interface LibraryResponse {
  data: {
    categorias: string[];
    totalAlgoritmos: number;
    algoritmos: Algoritmo[];
  };
  message: string;
}

describe('AlgorithmsController (e2e)', () => {
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

  describe('GET /api/biblioteca', () => {
    it('debe retornar respuesta exitosa', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/biblioteca',
        });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as LibraryResponse;
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('message');
      expect(body.message).toBe('Éxito');
    });

    it('debe retornar estructura correcta', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/biblioteca',
        });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as LibraryResponse;
      expect(body.data).toHaveProperty('categorias');
      expect(body.data).toHaveProperty('totalAlgoritmos');
      expect(body.data).toHaveProperty('algoritmos');
      expect(Array.isArray(body.data.categorias)).toBe(true);
      expect(Array.isArray(body.data.algoritmos)).toBe(true);
      expect(typeof body.data.totalAlgoritmos).toBe('number');
    });

    it('debe filtrar por categoría', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/biblioteca?categoria=Ordenamiento',
        });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as LibraryResponse;
      expect(body.data).toHaveProperty('algoritmos');
      if (body.data.algoritmos.length > 0) {
        body.data.algoritmos.forEach((algo: Algoritmo) => {
          expect(algo.categoria).toBe('Ordenamiento');
        });
      }
    });

    it('debe buscar por nombre', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/biblioteca?nombre=bubble',
        });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as LibraryResponse;
      expect(body.data).toHaveProperty('algoritmos');
      if (body.data.algoritmos.length > 0) {
        body.data.algoritmos.forEach((algo: Algoritmo) => {
          expect(algo.nombre.toLowerCase()).toContain('bubble');
        });
      }
    });

    it('debe manejar catálogo vacío', async () => {
      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/biblioteca?nombre=algoritmoInexistente123456',
        });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as LibraryResponse;
      expect(body.data).toHaveProperty('algoritmos');
      expect(body.data.algoritmos).toHaveLength(0);
      expect(body.data.totalAlgoritmos).toBe(0);
    });
  });

  describe('GET /api/algoritmos/:id', () => {
    it('debe retornar pseudocódigo normalizado para el frontend', async () => {
      const libraryResponse: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: '/api/biblioteca?nombre=bubble',
        });

      const libraryBody = JSON.parse(
        libraryResponse.payload,
      ) as LibraryResponse;
      const algoritmoId = libraryBody.data.algoritmos[0]?.id;

      if (!algoritmoId) {
        console.warn('No hay algoritmo Bubble Sort para probar detalle');
        return;
      }

      const response: LightMyRequestResponse = await app
        .getHttpAdapter()
        .getInstance()
        .inject({
          method: 'GET',
          url: `/api/algoritmos/${algoritmoId}`,
        });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload) as { data: AlgoritmoDetalle };

      expect(Array.isArray(body.data.pseudocode)).toBe(true);
      expect(body.data.pseudocode.length).toBeGreaterThan(0);
      expect(body.data.pseudocode[0]).toEqual(
        expect.objectContaining({
          line: expect.any(Number),
          text: expect.any(String),
          indent: expect.any(Number),
        }),
      );
      expect(body.data.pseudocode[0]).not.toHaveProperty('numero');
      expect(body.data.pseudocode[0]).not.toHaveProperty('codigo');
    });
  });
});
