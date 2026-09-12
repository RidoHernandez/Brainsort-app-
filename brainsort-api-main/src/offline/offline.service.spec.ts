import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { OfflineService } from './offline.service';

describe('OfflineService', () => {
  let service: OfflineService;

  const mockPrismaService = {
    algoritmo: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    ejercicioPrediccion: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfflineService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OfflineService>(OfflineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOfflineModules', () => {
    it('debe listar módulos activos con tamaño estimado y estado de descarga', async () => {
      mockPrismaService.algoritmo.findMany.mockResolvedValue([
        { id: 'algo-1', nombre: 'Bubble Sort', activo: true },
      ]);

      const result = await service.getOfflineModules('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          algoritmoId: 'algo-1',
          nombre: 'Bubble Sort',
          version: '1.0.0',
          descargado: false,
        }),
      );
      expect(result[0].tamanoKB).toBeGreaterThan(0);
      expect(mockPrismaService.algoritmo.findMany).toHaveBeenCalledWith({
        where: { activo: true },
      });
    });
  });

  describe('downloadModule', () => {
    const algoritmo = {
      id: 'algo-1',
      nombre: 'Bubble Sort',
      descripcion: 'Ordenamiento burbuja',
      dificultad: 'Facil',
      complejidadTiempo: 'O(n^2)',
      complejidadEspacio: 'O(1)',
      categoria: 'Ordenamiento',
    };

    it('debe descargar metadatos, pseudocódigo y ejercicios del módulo', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(algoritmo);
      mockPrismaService.ejercicioPrediccion.findMany.mockResolvedValue([
        {
          id: 'ej-1',
          pregunta: '¿Cuál es el siguiente intercambio?',
          dificultad: 'Facil',
          respuestaCorrecta: '2,5,8',
          feedbackPositivo: 'Correcto',
          feedbackNegativo: 'Revisa la comparación',
        },
      ]);

      const result = await service.downloadModule('algo-1');

      expect(result.meta).toEqual(algoritmo);
      expect(result.pseudocode.length).toBeGreaterThan(0);
      expect(result.ejercicios).toEqual([
        {
          id: 'ej-1',
          pregunta: '¿Cuál es el siguiente intercambio?',
          dificultad: 'Facil',
          respuestaCorrecta: '2,5,8',
          feedbackPositivo: 'Correcto',
          feedbackNegativo: 'Revisa la comparación',
        },
      ]);
    });

    it('debe lanzar NotFoundException cuando no existe el algoritmo', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(null);

      await expect(service.downloadModule('algo-x')).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockPrismaService.ejercicioPrediccion.findMany,
      ).not.toHaveBeenCalled();
    });
  });
});
