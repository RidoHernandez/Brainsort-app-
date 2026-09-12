import { Test, TestingModule } from '@nestjs/testing';
import { SimulationsService } from './simulations.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadgesService } from '../badges/badges.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { executeWithTimeout } from './engines/registry';

// Mock del registry de engines
jest.mock('./engines/registry', () => ({
  getEngine: jest.fn().mockReturnValue({
    meta: { nombre: 'Bubble Sort' },
    pseudocode: [{ line: 1, text: 'for i in range(n)', indent: 0 }],
    execute: jest.fn().mockReturnValue([
      {
        numeroPaso: 1,
        tipoOperacion: 'comparacion',
        indicesActivos: [0, 1],
        estadoArray: [5, 2, 8, 1],
        lineaPseudocodigo: 1,
      },
      {
        numeroPaso: 2,
        tipoOperacion: 'intercambio',
        indicesActivos: [0, 1],
        estadoArray: [2, 5, 8, 1],
        lineaPseudocodigo: 2,
      },
    ]),
  }),
  executeWithTimeout: jest.fn().mockResolvedValue([
    {
      numeroPaso: 1,
      tipoOperacion: 'comparacion',
      indicesActivos: [0, 1],
      estadoArray: [5, 2, 8, 1],
      lineaPseudocodigo: 1,
    },
    {
      numeroPaso: 2,
      tipoOperacion: 'intercambio',
      indicesActivos: [0, 1],
      estadoArray: [2, 5, 8, 1],
      lineaPseudocodigo: 2,
    },
  ]),
}));

describe('SimulationsService', () => {
  let service: SimulationsService;

  const mockPrismaService = {
    algoritmo: {
      findUnique: jest.fn(),
    },
    sesionSimulacion: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockBadgesService = {
    checkAndAward: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: BadgesService, useValue: mockBadgesService },
      ],
    }).compile();

    service = module.get<SimulationsService>(SimulationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSimulation', () => {
    const mockAlgoritmo = {
      id: 'algo-1',
      nombre: 'Bubble Sort',
      descripcion: 'Algoritmo de ordenamiento burbuja',
      dificultad: 'Facil',
      complejidadTiempo: 'O(n²)',
      complejidadEspacio: 'O(1)',
      categoria: 'Ordenamiento',
      activo: true,
      pseudocodigo: [{ line: 1, text: 'for i in range(n)', indent: 0 }],
    };

    it('debe crear una simulación exitosamente con datos personalizados', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);
      mockPrismaService.sesionSimulacion.create.mockResolvedValue({
        id: 'sesion-1',
      });

      const result = await service.createSimulation(
        {
          algoritmoId: 'algo-1',
          conjuntoDeDatos: {
            valores: [5, 2, 8, 1],
            tipoOrigen: 'Personalizado',
            tamano: 4,
          },
        },
        'user-1',
      );

      expect(result).toHaveProperty('simulacion');
      expect(result).toHaveProperty('pseudocode');
      expect(result).toHaveProperty('totalPasos');
      expect(result).toHaveProperty('pasos');
      expect(result.totalPasos).toBe(2);
      expect(result.simulacion.estadoActual).toBe('Pausa');
      expect(result.simulacion.velocidadReproduccion).toBe(1.0);
    });

    it('debe lanzar NotFoundException si el algoritmo no existe', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(null);

      await expect(
        service.createSimulation(
          {
            algoritmoId: 'nonexistent',
            conjuntoDeDatos: {
              valores: [5, 2, 8, 1],
              tipoOrigen: 'Personalizado',
              tamano: 4,
            },
          },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe rechazar valores nulos en el conjunto de datos', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);

      await expect(
        service.createSimulation(
          {
            algoritmoId: 'algo-1',
            conjuntoDeDatos: {
              valores: [5, null as any, 8, 1],
              tipoOrigen: 'Personalizado',
              tamano: 4,
            },
          },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar cuando tamaño no coincide con cantidad de valores', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);

      await expect(
        service.createSimulation(
          {
            algoritmoId: 'algo-1',
            conjuntoDeDatos: {
              valores: [5, 2, 8],
              tipoOrigen: 'Personalizado',
              tamano: 5,
            },
          },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar valores que no son enteros positivos dentro del rango permitido', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);

      await expect(
        service.createSimulation(
          {
            algoritmoId: 'algo-1',
            conjuntoDeDatos: {
              valores: [5, 2.5, 1000, 1],
              tipoOrigen: 'Personalizado',
              tamano: 4,
            },
          },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe generar datos aleatorios cuando el tipoOrigen es Predeterminado', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);
      mockPrismaService.sesionSimulacion.create.mockResolvedValue({
        id: 'sesion-1',
      });

      await service.createSimulation(
        {
          algoritmoId: 'algo-1',
          conjuntoDeDatos: {
            valores: [5, 2, 8, 1],
            tipoOrigen: 'Predeterminado',
            tamano: 4,
          },
        },
        'user-1',
      );

      expect(executeWithTimeout).toHaveBeenCalledWith(
        'Bubble Sort',
        expect.any(Array),
      );
      const [, data] = (executeWithTimeout as jest.Mock).mock.calls.at(-1);
      expect(data.length).toBeGreaterThanOrEqual(8);
      expect(data.length).toBeLessThanOrEqual(15);
    });

    it('debe convertir errores del engine en BadRequestException', async () => {
      (executeWithTimeout as jest.Mock).mockRejectedValueOnce(
        new Error('Timeout: Engine execution exceeded 10 seconds'),
      );
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);

      await expect(
        service.createSimulation(
          {
            algoritmoId: 'algo-1',
            conjuntoDeDatos: {
              valores: [5, 2, 8, 1],
              tipoOrigen: 'Personalizado',
              tamano: 4,
            },
          },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.sesionSimulacion.create).not.toHaveBeenCalled();
    });

    it('debe crear SesionSimulacion en la base de datos', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);
      mockPrismaService.sesionSimulacion.create.mockResolvedValue({
        id: 'sesion-1',
      });

      await service.createSimulation(
        {
          algoritmoId: 'algo-1',
          conjuntoDeDatos: {
            valores: [5, 2, 8, 1],
            tipoOrigen: 'Personalizado',
            tamano: 4,
          },
        },
        'user-1',
      );

      expect(mockPrismaService.sesionSimulacion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          usuarioId: 'user-1',
          algoritmoId: 'algo-1',
          pasosCompletados: 0,
          completada: false,
        }),
      });
    });

    it('debe retornar pasos formateados correctamente', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(mockAlgoritmo);
      mockPrismaService.sesionSimulacion.create.mockResolvedValue({
        id: 'sesion-1',
      });

      const result = await service.createSimulation(
        {
          algoritmoId: 'algo-1',
          conjuntoDeDatos: {
            valores: [5, 2, 8, 1],
            tipoOrigen: 'Personalizado',
            tamano: 4,
          },
        },
        'user-1',
      );

      const step = result.pasos[0];
      expect(step).toHaveProperty('numeroPaso');
      expect(step).toHaveProperty('tipoOperacion');
      expect(step).toHaveProperty('indicesActivos');
      expect(step).toHaveProperty('estadoArray');
      expect(step).toHaveProperty('lineaPseudocodigo');
    });
  });

  describe('updateSessionProgress', () => {
    it('debe actualizar el progreso de la sesión', async () => {
      mockPrismaService.sesionSimulacion.findUnique.mockResolvedValue({
        id: 'sesion-1',
        usuarioId: 'user-1',
        totalPasos: 10,
        pasosCompletados: 0,
      });
      mockPrismaService.sesionSimulacion.update.mockResolvedValue({});

      await service.updateSessionProgress('sesion-1', 5);

      expect(mockPrismaService.sesionSimulacion.update).toHaveBeenCalledWith({
        where: { id: 'sesion-1' },
        data: {
          pasosCompletados: 5,
          completada: false,
          fechaFin: null,
        },
      });
    });

    it('debe marcar sesión como completada cuando pasos >= totalPasos', async () => {
      mockPrismaService.sesionSimulacion.findUnique.mockResolvedValue({
        id: 'sesion-1',
        usuarioId: 'user-1',
        totalPasos: 10,
        pasosCompletados: 0,
      });
      mockPrismaService.sesionSimulacion.update.mockResolvedValue({});

      await service.updateSessionProgress('sesion-1', 10);

      expect(mockPrismaService.sesionSimulacion.update).toHaveBeenCalledWith({
        where: { id: 'sesion-1' },
        data: expect.objectContaining({
          completada: true,
        }),
      });
    });

    it('debe verificar insignias al completar sesión', async () => {
      mockPrismaService.sesionSimulacion.findUnique.mockResolvedValue({
        id: 'sesion-1',
        usuarioId: 'user-1',
        totalPasos: 10,
        pasosCompletados: 0,
      });
      mockPrismaService.sesionSimulacion.update.mockResolvedValue({});

      await service.updateSessionProgress('sesion-1', 10);

      expect(mockBadgesService.checkAndAward).toHaveBeenCalledWith('user-1');
    });

    it('debe lanzar NotFoundException si la sesión no existe', async () => {
      mockPrismaService.sesionSimulacion.findUnique.mockResolvedValue(null);

      await expect(
        service.updateSessionProgress('nonexistent', 5),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
