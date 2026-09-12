import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DiagnosticsService } from './diagnostics.service';

describe('DiagnosticsService', () => {
  let service: DiagnosticsService;

  const mockPrismaService = {
    preguntaDiagnostico: {
      findMany: jest.fn(),
    },
    resultadoDiagnostico: {
      upsert: jest.fn(),
    },
    algoritmo: {
      findMany: jest.fn(),
    },
    rutaAprendizaje: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiagnosticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DiagnosticsService>(DiagnosticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPreguntas', () => {
    it('debe retornar preguntas sin exponer la respuesta correcta', async () => {
      const preguntas = [
        { id: 'p1', pregunta: '¿Qué hace Bubble Sort?', opciones: ['A', 'B'] },
      ];
      mockPrismaService.preguntaDiagnostico.findMany.mockResolvedValue(
        preguntas,
      );

      const result = await service.getPreguntas();

      expect(result).toEqual(preguntas);
      expect(
        mockPrismaService.preguntaDiagnostico.findMany,
      ).toHaveBeenCalledWith({
        select: { id: true, pregunta: true, opciones: true },
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('evaluar', () => {
    const preguntas = [
      { id: 'p1', indiceCorrecto: 0 },
      { id: 'p2', indiceCorrecto: 2 },
    ];

    const algoritmos = [
      { id: 'algo-bubble', nombre: 'Bubble Sort' },
      { id: 'algo-selection', nombre: 'Selection Sort' },
      { id: 'algo-insertion', nombre: 'Insertion Sort' },
    ];

    it('debe calcular puntaje y generar ruta estandar con desempeno suficiente', async () => {
      mockPrismaService.preguntaDiagnostico.findMany.mockResolvedValue(
        preguntas,
      );
      mockPrismaService.resultadoDiagnostico.upsert.mockResolvedValue({
        id: 'resultado-1',
      });
      mockPrismaService.algoritmo.findMany.mockResolvedValue(algoritmos);
      mockPrismaService.rutaAprendizaje.upsert.mockResolvedValue({
        id: 'ruta-1',
      });

      const result = await service.evaluar('user-1', [0, 1]);

      expect(result).toEqual({
        puntaje: 50,
        rutaGenerada: 'ruta-1',
        algoritmosSugeridos: 3,
      });
      expect(
        mockPrismaService.resultadoDiagnostico.upsert,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuarioId: 'user-1' },
          update: expect.objectContaining({ puntaje: 50 }),
          create: { usuarioId: 'user-1', puntaje: 50 },
        }),
      );
      expect(mockPrismaService.rutaAprendizaje.upsert).toHaveBeenCalledWith({
        where: { usuarioId: 'user-1' },
        update: {
          algoritmosId: ['algo-selection', 'algo-bubble', 'algo-insertion'],
        },
        create: {
          usuarioId: 'user-1',
          algoritmosId: ['algo-selection', 'algo-bubble', 'algo-insertion'],
        },
      });
    });

    it('debe lanzar BadRequestException si no coinciden respuestas y preguntas', async () => {
      mockPrismaService.preguntaDiagnostico.findMany.mockResolvedValue(
        preguntas,
      );

      await expect(service.evaluar('user-1', [0])).rejects.toThrow(
        BadRequestException,
      );
      expect(
        mockPrismaService.resultadoDiagnostico.upsert,
      ).not.toHaveBeenCalled();
    });

    it('debe usar todos los algoritmos activos si faltan nombres esperados', async () => {
      mockPrismaService.preguntaDiagnostico.findMany.mockResolvedValue([]);
      mockPrismaService.resultadoDiagnostico.upsert.mockResolvedValue({
        id: 'resultado-1',
      });
      mockPrismaService.algoritmo.findMany.mockResolvedValue([
        { id: 'algo-custom', nombre: 'Algoritmo personalizado' },
      ]);
      mockPrismaService.rutaAprendizaje.upsert.mockResolvedValue({
        id: 'ruta-1',
      });

      const result = await service.evaluar('user-1', []);

      expect(result.puntaje).toBe(0);
      expect(result.algoritmosSugeridos).toBe(1);
      expect(mockPrismaService.rutaAprendizaje.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { algoritmosId: ['algo-custom'] },
        }),
      );
    });
  });
});
