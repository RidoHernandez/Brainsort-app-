import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadgesService } from '../badges/badges.service';

describe('ProgressService', () => {
  let service: ProgressService;

  const mockPrismaService = {
    progresoUsuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    sesionSimulacion: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    respuestaEjercicio: {
      count: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    usuario: {
      findUnique: jest.fn(),
    },
    insignia: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    progresoInsignia: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    algoritmo: {
      count: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    ejercicioPrediccion: {
      count: jest.fn(),
    },
  };

  const mockBadgesService = {
    checkAndAward: jest.fn().mockResolvedValue(undefined),
    getAllBadges: jest.fn().mockResolvedValue([]),
    getUserBadges: jest.fn().mockResolvedValue([]),
    invalidateCache: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: BadgesService,
          useValue: mockBadgesService,
        },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserProgress', () => {
    it('should return user progress', async () => {
      const mockProgress = {
        id: '1',
        usuarioId: 'user1',
        puntosTotales: 100,
        nivelActual: 2,
        rachaDias: 5,
        posicionRanking: 10,
        ultimaActividad: new Date(),
        usuario: {
          nombre: 'Test User',
        },
        insignias: [],
      };

      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue(
        mockProgress,
      );
      mockPrismaService.sesionSimulacion.count.mockResolvedValue(5);
      mockPrismaService.respuestaEjercicio.findMany.mockResolvedValue([]);
      mockPrismaService.ejercicioPrediccion.count.mockResolvedValue(10);

      const result = await service.getUserProgress('user1');

      expect(result).toHaveProperty('puntosTotales');
      expect(result).toHaveProperty('nivelActual');
      expect(result).toHaveProperty('rachaDias');
      expect(result).toHaveProperty('posicionRanking');
      expect(result.puntosTotales).toBe(100);
    });

    it('should throw NotFoundException when progress not found', async () => {
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue(null);

      await expect(service.getUserProgress('user1')).rejects.toThrow(
        'Progreso no encontrado',
      );
    });
  });

  describe('getRanking', () => {
    it('should return ranking with pagination', async () => {
      const mockRanking = [
        {
          usuarioId: 'user1',
          usuario: { nombre: 'User 1' },
          puntosTotales: 1000,
          rachaDias: 10,
          nivelActual: 5,
        },
        {
          usuarioId: 'user2',
          usuario: { nombre: 'User 2' },
          puntosTotales: 800,
          rachaDias: 5,
          nivelActual: 4,
        },
      ];

      mockPrismaService.progresoUsuario.findMany.mockResolvedValue(mockRanking);
      mockPrismaService.progresoUsuario.count.mockResolvedValue(2);

      const result = await service.getRanking(10, 0);

      expect(result.ranking).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.ranking[0]).toHaveProperty('posicion');
      expect(result.ranking[0].posicion).toBe(1);
    });
  });

  describe('updateProgress', () => {
    it('should update user progress', async () => {
      const mockProgress = {
        id: '1',
        usuarioId: 'user1',
        puntosTotales: 50,
        nivelActual: 1,
        rachaDias: 0,
        posicionRanking: 20,
        ultimaActividad: new Date(),
      };

      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue(
        mockProgress,
      );
      mockPrismaService.progresoUsuario.findMany.mockResolvedValue([]);
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});

      await service.updateProgress('user1', 50);

      expect(mockPrismaService.progresoUsuario.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when progress not found', async () => {
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue(null);

      await expect(service.updateProgress('user1', 50)).rejects.toThrow(
        'Progreso no encontrado',
      );
    });
  });
});
