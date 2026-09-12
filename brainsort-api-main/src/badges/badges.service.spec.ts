import { Test, TestingModule } from '@nestjs/testing';
import { BadgesService } from './badges.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BadgesService', () => {
  let service: BadgesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    insignia: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    progresoUsuario: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    progresoInsignia: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
    },
    sesionSimulacion: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
    algoritmo: {
      count: jest.fn().mockResolvedValue(0),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BadgesService>(BadgesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllBadges', () => {
    it('should return all badges', async () => {
      const mockBadges = [
        {
          id: '1',
          nombre: 'Primera Simulación',
          descripcion: 'Completar 1 simulación',
          imagen: 'badge1.png',
          criterioDesbloqueo: 'Completar 1 simulación',
        },
        {
          id: '2',
          nombre: 'Explorador',
          descripcion: 'Visualizar 3 algoritmos',
          imagen: 'badge2.png',
          criterioDesbloqueo: 'Visualizar 3 algoritmos',
        },
      ];

      mockPrismaService.insignia.findMany.mockImplementation(
        async () => mockBadges,
      );
      service.invalidateCache();
      const result = await service.getAllBadges();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('nombre');
      expect(result[0]).toHaveProperty('desbloqueada');
      expect(result[0].desbloqueada).toBe(false);
    });
  });

  describe('getUserBadges', () => {
    it('should return user badges with unlock status', async () => {
      const mockBadges = [
        {
          id: '1',
          nombre: 'Primera Simulación',
          descripcion: 'Completar 1 simulación',
          imagen: 'badge1.png',
          criterioDesbloqueo: 'Completar 1 simulación',
        },
      ];

      const mockProgress = {
        id: 'prog1',
        usuarioId: 'user1',
        puntosTotales: 100,
      };

      const mockUserBadges = [
        {
          insigniaId: '1',
          fechaObtencion: new Date(),
          insignia: mockBadges[0],
        },
      ];

      mockPrismaService.insignia.findMany.mockResolvedValue(mockBadges);
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue(
        mockProgress,
      );
      mockPrismaService.progresoInsignia.findMany.mockResolvedValue(
        mockUserBadges,
      );

      const result = await service.getUserBadges('user1');

      expect(result).toHaveLength(2);
      expect(result[0].desbloqueada).toBe(true);
      expect(result[0]).toHaveProperty('fechaObtencion');
    });

    it('should throw NotFoundException when progress not found', async () => {
      (prismaService.progresoUsuario.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.getUserBadges('user1')).rejects.toThrow(
        'Progreso no encontrado',
      );
    });
  });

  describe('checkAndAward', () => {
    it('should award badge when requirements met', async () => {
      const mockBadges = [
        {
          id: '1',
          nombre: 'Primera Simulación',
          descripcion: 'Completar 1 simulación',
          imagen: 'badge1.png',
          criterioDesbloqueo: 'Completar 1 simulación',
        },
      ];

      const mockProgress = {
        id: 'prog1',
        usuarioId: 'user1',
        puntosTotales: 100,
        rachaDias: 5,
      };

      (prismaService.insignia.findMany as jest.Mock).mockResolvedValue(
        mockBadges,
      );
      (prismaService.progresoUsuario.findUnique as jest.Mock).mockResolvedValue(
        mockProgress,
      );
      (prismaService.progresoInsignia.findMany as jest.Mock).mockResolvedValue(
        [],
      );
      (prismaService.sesionSimulacion.count as jest.Mock).mockResolvedValue(1);
      (prismaService.sesionSimulacion.findMany as jest.Mock).mockResolvedValue([
        { algoritmoId: 'alg1' },
      ]);
      (prismaService.algoritmo.count as jest.Mock).mockResolvedValue(5);
      mockPrismaService.progresoInsignia.create.mockResolvedValue({});

      await service.checkAndAward('user1');

      expect(mockPrismaService.progresoInsignia.create).toHaveBeenCalled();
    });

    it('should not award badge when requirements not met', async () => {
      const mockBadges = [
        {
          id: '1',
          nombre: 'Primera Simulación',
          descripcion: 'Completar 1 simulación',
          imagen: 'badge1.png',
          criterioDesbloqueo: 'Completar 1 simulación',
        },
      ];

      const mockProgress = {
        id: 'prog1',
        usuarioId: 'user1',
        puntosTotales: 100,
        rachaDias: 5,
      };

      mockPrismaService.insignia.findMany.mockResolvedValue(mockBadges);
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue(
        mockProgress,
      );
      mockPrismaService.progresoInsignia.findMany.mockResolvedValue([]);
      mockPrismaService.sesionSimulacion.count.mockResolvedValue(0); // No simulations completed
      mockPrismaService.sesionSimulacion.findMany.mockResolvedValue([]);
      mockPrismaService.algoritmo.count.mockResolvedValue(5);

      await service.checkAndAward('user1');

      expect(mockPrismaService.progresoInsignia.create).not.toHaveBeenCalled();
    });

    it('should skip already awarded badges', async () => {
      const mockBadges = [
        {
          id: '1',
          nombre: 'Primera Simulación',
          descripcion: 'Completar 1 simulación',
          imagen: 'badge1.png',
          criterioDesbloqueo: 'Completar 1 simulación',
        },
      ];

      const mockProgress = {
        id: 'prog1',
        usuarioId: 'user1',
        puntosTotales: 100,
        rachaDias: 5,
      };

      const mockUserBadges = [
        {
          insigniaId: '1',
          fechaObtencion: new Date(),
        },
      ];

      mockPrismaService.insignia.findMany.mockResolvedValue(mockBadges);
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue(
        mockProgress,
      );
      mockPrismaService.progresoInsignia.findMany.mockResolvedValue(
        mockUserBadges,
      );

      await service.checkAndAward('user1');

      expect(mockPrismaService.progresoInsignia.create).not.toHaveBeenCalled();
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate badge cache', () => {
      service.invalidateCache();
      expect(service).toBeDefined();
    });
  });
});
