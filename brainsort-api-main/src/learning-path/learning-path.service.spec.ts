import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { LearningPathService } from './learning-path.service';

describe('LearningPathService', () => {
  let service: LearningPathService;

  const mockPrismaService = {
    rutaAprendizaje: {
      findUnique: jest.fn(),
    },
    algoritmo: {
      findMany: jest.fn(),
    },
    resultadoDiagnostico: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningPathService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<LearningPathService>(LearningPathService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRutaUsuario', () => {
    it('debe retornar algoritmos ordenados según la ruta guardada', async () => {
      const createdAt = new Date('2026-05-01T12:00:00Z');
      mockPrismaService.rutaAprendizaje.findUnique.mockResolvedValue({
        id: 'ruta-1',
        usuarioId: 'user-1',
        algoritmosId: ['algo-2', 'algo-1'],
        createdAt,
      });
      mockPrismaService.algoritmo.findMany.mockResolvedValue([
        {
          id: 'algo-1',
          nombre: 'Bubble Sort',
          descripcion: 'Ordenamiento burbuja',
          dificultad: 'Facil',
          categoria: 'Ordenamiento',
          tags: ['basico'],
        },
        {
          id: 'algo-2',
          nombre: 'Insertion Sort',
          descripcion: 'Ordenamiento por insercion',
          dificultad: 'Medio',
          categoria: 'Ordenamiento',
          tags: ['estable'],
        },
      ]);

      mockPrismaService.resultadoDiagnostico.findUnique.mockResolvedValue(null);

      const result = await service.getRutaUsuario('user-1');

      expect(result).toEqual({
        id: 'ruta-1',
        createdAt,
        algoritmos: [
          expect.objectContaining({ id: 'algo-2' }),
          expect.objectContaining({ id: 'algo-1' }),
        ],
        diagnostico: null,
      });
      expect(mockPrismaService.algoritmo.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['algo-2', 'algo-1'] } },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          dificultad: true,
          categoria: true,
          tags: true,
        },
      });
    });

    it('debe lanzar NotFoundException cuando el usuario no tiene ruta', async () => {
      mockPrismaService.rutaAprendizaje.findUnique.mockResolvedValue(null);

      await expect(service.getRutaUsuario('user-sin-ruta')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.algoritmo.findMany).not.toHaveBeenCalled();
    });
  });
});
