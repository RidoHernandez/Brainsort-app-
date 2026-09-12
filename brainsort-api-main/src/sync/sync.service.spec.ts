import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SyncService', () => {
  let service: SyncService;

  const mockPrismaService = {
    algoritmo: {
      findUnique: jest.fn(),
    },
    sesionSimulacion: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    progresoUsuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── syncProgress ─────────────────────────────────────────────────────────

  describe('syncProgress', () => {
    const fechaInicio = new Date('2026-05-01T10:00:00Z');
    const fechaFin = new Date('2026-05-01T10:05:00Z');

    const mockAlgoritmo = {
      id: 'algo-1',
      nombre: 'Bubble Sort',
      dificultad: 'Facil',
    };

    const mockProgreso = {
      id: 'prog-1',
      usuarioId: 'user-1',
      puntosTotales: 50,
      nivelActual: 1,
      rachaDias: 2,
      posicionRanking: 5,
      ultimaActividad: new Date(),
    };

    it('debe sincronizar sesiones completadas y retornar conteos correctos', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);
      mockPrismaService.sesionSimulacion.findFirst.mockResolvedValue(null); // No duplicada
      mockPrismaService.sesionSimulacion.create.mockResolvedValue({});
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(2);

      const result = await service.syncProgress('user-1', {
        sesiones: [
          {
            algoritmoId: 'algo-1',
            pasosCompletados: 10,
            completada: true,
            fechaInicio,
            fechaFin,
          },
        ],
      });

      expect(result.sincronizados).toBe(1);
      expect(result.puntosActualizados).toBe(10); // Facil = 10 pts
    });

    it('debe omitir sesiones de algoritmos inexistentes', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(null); // No existe

      const result = await service.syncProgress('user-1', {
        sesiones: [
          {
            algoritmoId: 'algo-inexistente',
            pasosCompletados: 5,
            completada: false,
            fechaInicio,
            fechaFin: null,
          },
        ],
      });

      expect(result.sincronizados).toBe(0);
      expect(result.puntosActualizados).toBe(0);
      expect(mockPrismaService.sesionSimulacion.create).not.toHaveBeenCalled();
    });

    it('debe omitir sesiones ya sincronizadas (duplicadas)', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);
      mockPrismaService.sesionSimulacion.findFirst.mockResolvedValue({
        id: 'sesion-existente', // Ya existe
      });

      const result = await service.syncProgress('user-1', {
        sesiones: [
          {
            algoritmoId: 'algo-1',
            pasosCompletados: 10,
            completada: true,
            fechaInicio,
            fechaFin,
          },
        ],
      });

      expect(result.sincronizados).toBe(0);
      expect(mockPrismaService.sesionSimulacion.create).not.toHaveBeenCalled();
    });

    it('debe sincronizar múltiples sesiones y acumular puntos', async () => {
      // Algoritmo Facil = 10, Medio = 20
      const algoMedio = { ...mockAlgoritmo, id: 'algo-2', dificultad: 'Medio' };

      mockPrismaService.algoritmo.findUnique
        .mockResolvedValueOnce(mockAlgoritmo) // Primera sesión: Facil
        .mockResolvedValueOnce(algoMedio); // Segunda sesión: Medio
      mockPrismaService.sesionSimulacion.findFirst.mockResolvedValue(null);
      mockPrismaService.sesionSimulacion.create.mockResolvedValue({});
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(1);

      const result = await service.syncProgress('user-1', {
        sesiones: [
          {
            algoritmoId: 'algo-1',
            pasosCompletados: 10,
            completada: true,
            fechaInicio,
            fechaFin,
          },
          {
            algoritmoId: 'algo-2',
            pasosCompletados: 8,
            completada: true,
            fechaInicio,
            fechaFin,
          },
        ],
      });

      expect(result.sincronizados).toBe(2);
      expect(result.puntosActualizados).toBe(30); // 10 + 20
    });

    it('no debe sumar puntos por sesiones no completadas', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);
      mockPrismaService.sesionSimulacion.findFirst.mockResolvedValue(null);
      mockPrismaService.sesionSimulacion.create.mockResolvedValue({});

      const result = await service.syncProgress('user-1', {
        sesiones: [
          {
            algoritmoId: 'algo-1',
            pasosCompletados: 5,
            completada: false, // No completada
            fechaInicio,
            fechaFin: null,
          },
        ],
      });

      expect(result.sincronizados).toBe(1); // Sí se sincronizó
      expect(result.puntosActualizados).toBe(0); // Pero sin puntos
      expect(
        mockPrismaService.progresoUsuario.findUnique,
      ).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el progreso no existe al actualizar puntos', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);
      mockPrismaService.sesionSimulacion.findFirst.mockResolvedValue(null);
      mockPrismaService.sesionSimulacion.create.mockResolvedValue({});
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue(null); // Sin progreso

      await expect(
        service.syncProgress('user-sin-progreso', {
          sesiones: [
            {
              algoritmoId: 'algo-1',
              pasosCompletados: 10,
              completada: true,
              fechaInicio,
              fechaFin,
            },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe retornar sincronizados=0 y puntosActualizados=0 con lista vacía', async () => {
      const result = await service.syncProgress('user-1', { sesiones: [] });

      expect(result.sincronizados).toBe(0);
      expect(result.puntosActualizados).toBe(0);
      expect(mockPrismaService.algoritmo.findUnique).not.toHaveBeenCalled();
    });
  });
});
