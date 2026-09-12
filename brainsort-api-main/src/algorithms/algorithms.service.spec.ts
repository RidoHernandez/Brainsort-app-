import { Test, TestingModule } from '@nestjs/testing';
import { AlgorithmsService } from './algorithms.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AlgorithmsService', () => {
  let service: AlgorithmsService;

  const mockPrismaService = {
    algoritmo: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlgorithmsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AlgorithmsService>(AlgorithmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLibrary', () => {
    it('should return library with all algorithms when no filters provided', async () => {
      const mockAlgorithms = [
        {
          id: '1',
          nombre: 'Bubble Sort',
          categoria: 'Ordenamiento',
          dificultad: 'Facil',
          complejidadTiempo: 'O(n²)',
          complejidadEspacio: 'O(1)',
          descripcion: 'Algoritmo de ordenamiento',
          activo: true,
          tags: ['basico'],
        },
        {
          id: '2',
          nombre: 'Binary Search',
          categoria: 'Búsqueda',
          dificultad: 'Medio',
          complejidadTiempo: 'O(log n)',
          complejidadEspacio: 'O(1)',
          descripcion: 'Algoritmo de búsqueda',
          activo: true,
          tags: ['busqueda'],
        },
      ];

      mockPrismaService.algoritmo.findMany.mockResolvedValue(mockAlgorithms);
      mockPrismaService.algoritmo.count.mockResolvedValue(
        mockAlgorithms.length,
      );

      const result = await service.getLibrary({});

      expect(result).toHaveProperty('categorias');
      expect(result).toHaveProperty('totalAlgoritmos');
      expect(result).toHaveProperty('algoritmos');
      expect(result.totalAlgoritmos).toBe(2);
      expect(result.algoritmos).toHaveLength(2);
    });

    it('should filter by categoria', async () => {
      const mockAlgorithms = [
        {
          id: '1',
          nombre: 'Bubble Sort',
          categoria: 'Ordenamiento',
          dificultad: 'Facil',
          complejidadTiempo: 'O(n²)',
          complejidadEspacio: 'O(1)',
          descripcion: 'Algoritmo de ordenamiento',
          activo: true,
          tags: ['basico'],
        },
      ];

      mockPrismaService.algoritmo.findMany.mockResolvedValue(mockAlgorithms);
      mockPrismaService.algoritmo.count.mockResolvedValue(
        mockAlgorithms.length,
      );

      const result = await service.getLibrary({ categoria: 'Ordenamiento' });

      expect(result.algoritmos).toHaveLength(1);
      expect(result.algoritmos[0].categoria).toBe('Ordenamiento');
      expect(mockPrismaService.algoritmo.findMany).toHaveBeenCalledWith({
        where: {
          categoria: 'Ordenamiento',
          activo: true,
        },
        orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
      });
    });

    it('should filter by nombre', async () => {
      const mockAlgorithms = [
        {
          id: '1',
          nombre: 'Bubble Sort',
          categoria: 'Ordenamiento',
          dificultad: 'Facil',
          complejidadTiempo: 'O(n²)',
          complejidadEspacio: 'O(1)',
          descripcion: 'Algoritmo de ordenamiento',
          activo: true,
          tags: ['basico'],
        },
      ];

      mockPrismaService.algoritmo.findMany.mockResolvedValue(mockAlgorithms);
      mockPrismaService.algoritmo.count.mockResolvedValue(
        mockAlgorithms.length,
      );

      const result = await service.getLibrary({ nombre: 'bubble' });

      expect(result.algoritmos).toHaveLength(1);
      expect(result.algoritmos[0].nombre.toLowerCase()).toContain('bubble');
    });

    it('should return empty array when no algorithms match', async () => {
      mockPrismaService.algoritmo.findMany.mockResolvedValue([]);
      mockPrismaService.algoritmo.count.mockResolvedValue(0);

      const result = await service.getLibrary({ nombre: 'nonexistent' });

      expect(result.algoritmos).toHaveLength(0);
      expect(result.totalAlgoritmos).toBe(0);
    });

    it('should filter by comma-separated tags and trim values', async () => {
      mockPrismaService.algoritmo.findMany.mockResolvedValue([]);
      mockPrismaService.algoritmo.count.mockResolvedValue(0);

      await service.getLibrary({ tags: 'basico, ordenamiento ' });

      expect(mockPrismaService.algoritmo.findMany).toHaveBeenCalledWith({
        where: {
          activo: true,
          tags: {
            hasSome: ['basico', 'ordenamiento'],
          },
        },
        orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
      });
    });

    it('should truncate long descriptions in library cards', async () => {
      const longDescription = 'a'.repeat(160);
      mockPrismaService.algoritmo.findMany.mockResolvedValue([
        {
          id: '1',
          nombre: 'Bubble Sort',
          categoria: 'Ordenamiento',
          dificultad: 'Facil',
          complejidadTiempo: 'O(n²)',
          complejidadEspacio: 'O(1)',
          descripcion: longDescription,
          activo: true,
          tags: [],
        },
      ]);
      mockPrismaService.algoritmo.count.mockResolvedValue(1);

      const result = await service.getLibrary({});

      expect(result.algoritmos[0].descripcion).toHaveLength(140);
    });
  });

  describe('getAlgorithm', () => {
    it('should return algorithm detail with full description and pseudocode', async () => {
      const algoritmo = {
        id: 'algo-1',
        nombre: 'Bubble Sort',
        descripcion: 'Descripción completa del algoritmo',
        dificultad: 'Facil',
        complejidadTiempo: 'O(n²)',
        complejidadEspacio: 'O(1)',
        categoria: 'Ordenamiento',
        tags: ['basico'],
        pseudocodigo: [{ numero: 1, codigo: '  Comparar adyacentes' }],
      };
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(algoritmo);

      const result = await service.getAlgorithm('algo-1');

      expect(result).toEqual({
        id: algoritmo.id,
        nombre: algoritmo.nombre,
        descripcion: algoritmo.descripcion,
        dificultad: algoritmo.dificultad,
        complejidadTiempo: algoritmo.complejidadTiempo,
        complejidadEspacio: algoritmo.complejidadEspacio,
        categoria: algoritmo.categoria,
        tags: algoritmo.tags,
        pseudocode: [{ line: 1, text: 'Comparar adyacentes', indent: 1 }],
      });
    });

    it('should throw NotFoundException when algorithm does not exist', async () => {
      mockPrismaService.algoritmo.findUnique.mockResolvedValue(null);

      await expect(service.getAlgorithm('missing-id')).rejects.toThrow(
        'Algoritmo no encontrado',
      );
    });
  });
});
