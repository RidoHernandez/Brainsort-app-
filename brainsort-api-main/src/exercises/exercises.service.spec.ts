import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesService } from './exercises.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadgesService } from '../badges/badges.service';
import { NotFoundException } from '@nestjs/common';

describe('ExercisesService', () => {
  let service: ExercisesService;

  const mockPrismaService = {
    ejercicioPrediccion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    progresoUsuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    respuestaEjercicio: {
      create: jest.fn(),
    },
  };

  const mockBadgesService = {
    checkAndAward: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: BadgesService, useValue: mockBadgesService },
      ],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── getExercisesByAlgorithm ──────────────────────────────────────────────

  describe('getExercisesByAlgorithm', () => {
    it('debe retornar ejercicios formateados para un algoritmo', async () => {
      mockPrismaService.ejercicioPrediccion.findMany.mockResolvedValue([
        {
          id: 'ejr-1',
          pregunta: '¿Cuál es el resultado del paso 3?',
          dificultad: 'Facil',
          algoritmo: { id: 'algo-1', nombre: 'Bubble Sort' },
        },
        {
          id: 'ejr-2',
          pregunta: '¿Qué elementos se intercambian?',
          dificultad: 'Medio',
          algoritmo: { id: 'algo-1', nombre: 'Bubble Sort' },
        },
      ]);

      const result = await service.getExercisesByAlgorithm('algo-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'ejr-1',
        pregunta: '¿Cuál es el resultado del paso 3?',
        dificultad: 'Facil',
        algoritmo: { id: 'algo-1', nombre: 'Bubble Sort' },
      });
      // No debe exponer respuestaCorrecta ni feedback
      expect(result[0]).not.toHaveProperty('respuestaCorrecta');
      expect(result[0]).not.toHaveProperty('feedbackPositivo');
    });

    it('debe retornar lista vacía si el algoritmo no tiene ejercicios', async () => {
      mockPrismaService.ejercicioPrediccion.findMany.mockResolvedValue([]);

      const result = await service.getExercisesByAlgorithm(
        'algo-sin-ejercicios',
      );

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ─── answerExercise ───────────────────────────────────────────────────────

  describe('answerExercise', () => {
    const mockEjercicio = {
      id: 'ejr-1',
      algoritmoId: 'algo-1',
      pregunta: '¿Resultado del paso 3?',
      respuestaCorrecta: '[2, 5, 8, 1]',
      feedbackPositivo: '¡Correcto! El arreglo queda [2, 5, 8, 1]',
      feedbackNegativo: 'Incorrecto. Revisa el paso de intercambio.',
      dificultad: 'Facil',
    };

    const mockProgreso = {
      id: 'prog-1',
      usuarioId: 'user-1',
      puntosTotales: 50,
      nivelActual: 1,
      rachaDias: 0,
      posicionRanking: 5,
      ultimaActividad: null,
    };

    it('debe retornar correcto=true y sumar puntos con respuesta correcta', async () => {
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue(
        mockEjercicio,
      );
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(3);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      const result = await service.answerExercise(
        'ejr-1',
        { respuesta: '[2, 5, 8, 1]' },
        'user-1',
      );

      expect(result.correcto).toBe(true);
      expect(result.puntosGanados).toBe(10); // Facil = 10 pts
      expect(result.feedback).toBe(mockEjercicio.feedbackPositivo);
      expect(result.puntosTotales).toBe(60); // 50 + 10
    });

    it('debe retornar correcto=false y 0 puntos con respuesta incorrecta', async () => {
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue(
        mockEjercicio,
      );
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(3);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      const result = await service.answerExercise(
        'ejr-1',
        { respuesta: '[5, 2, 8, 1]' }, // Respuesta incorrecta
        'user-1',
      );

      expect(result.correcto).toBe(false);
      expect(result.puntosGanados).toBe(0);
      expect(result.feedback).toBe(mockEjercicio.feedbackNegativo);
      expect(result.puntosTotales).toBe(50); // Sin cambio
    });

    it('debe lanzar NotFoundException si el ejercicio no existe', async () => {
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue(null);

      await expect(
        service.answerExercise(
          'ejr-inexistente',
          { respuesta: 'algo' },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe calcular puntos correctamente según dificultad: Facil=10, Medio=20, Dificil=30', async () => {
      const casos = [
        { dificultad: 'Facil', esperado: 10 },
        { dificultad: 'Medio', esperado: 20 },
        { dificultad: 'Dificil', esperado: 30 },
      ];

      for (const caso of casos) {
        jest.clearAllMocks();
        mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue({
          ...mockEjercicio,
          dificultad: caso.dificultad,
          respuestaCorrecta: 'respuesta',
        });
        mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
          ...mockProgreso,
        });
        mockPrismaService.progresoUsuario.update.mockResolvedValue({});
        mockPrismaService.progresoUsuario.count.mockResolvedValue(0);
        mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

        const result = await service.answerExercise(
          'ejr-1',
          { respuesta: 'respuesta' },
          'user-1',
        );

        expect(result.puntosGanados).toBe(caso.esperado);
      }
    });

    it('debe comparar respuestas ignorando mayúsculas y espacios extra', async () => {
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue({
        ...mockEjercicio,
        respuestaCorrecta: '  [2, 5, 8, 1]  ',
      });
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(0);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      const result = await service.answerExercise(
        'ejr-1',
        { respuesta: '[2, 5, 8, 1]' }, // Sin espacios extra
        'user-1',
      );

      expect(result.correcto).toBe(true);
    });

    it('debe guardar la respuesta en respuestaEjercicio', async () => {
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue(
        mockEjercicio,
      );
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(0);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      await service.answerExercise(
        'ejr-1',
        { respuesta: '[2, 5, 8, 1]' },
        'user-1',
      );

      expect(mockPrismaService.respuestaEjercicio.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          usuarioId: 'user-1',
          ejercicioId: 'ejr-1',
          respuesta: '[2, 5, 8, 1]',
          correcto: true,
        }),
      });
    });

    it('debe llamar checkAndAward solo cuando la respuesta es correcta', async () => {
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue(
        mockEjercicio,
      );
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(0);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      await service.answerExercise(
        'ejr-1',
        { respuesta: '[2, 5, 8, 1]' },
        'user-1',
      );
      expect(mockBadgesService.checkAndAward).toHaveBeenCalledWith('user-1');

      jest.clearAllMocks();
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue(
        mockEjercicio,
      );
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(0);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      await service.answerExercise(
        'ejr-1',
        { respuesta: 'incorrecta' },
        'user-1',
      );
      expect(mockBadgesService.checkAndAward).not.toHaveBeenCalled();
    });

    it('debe crear ProgresoUsuario si no existe y luego continuar', async () => {
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue(
        mockEjercicio,
      );
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue(null); // No existe
      mockPrismaService.progresoUsuario.create.mockResolvedValue({
        ...mockProgreso,
        puntosTotales: 0,
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(0);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      const result = await service.answerExercise(
        'ejr-1',
        { respuesta: '[2, 5, 8, 1]' },
        'user-nuevo',
      );

      expect(mockPrismaService.progresoUsuario.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          usuarioId: 'user-nuevo',
          puntosTotales: 0,
          nivelActual: 1,
          rachaDias: 0,
        }),
      });
      expect(result).toHaveProperty('correcto');
    });

    it('debe incrementar la racha si la última actividad fue ayer', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-17T12:00:00Z'));
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue(
        mockEjercicio,
      );
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
        rachaDias: 2,
        ultimaActividad: new Date('2026-05-16T12:00:00Z'),
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(0);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      const result = await service.answerExercise(
        'ejr-1',
        { respuesta: '[2, 5, 8, 1]' },
        'user-1',
      );

      expect(result.rachaDias).toBe(3);
      jest.useRealTimers();
    });

    it('debe mantener la racha si ya hubo actividad el mismo día', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-17T18:00:00Z'));
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue(
        mockEjercicio,
      );
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
        rachaDias: 4,
        ultimaActividad: new Date('2026-05-17T08:00:00Z'),
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(0);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      const result = await service.answerExercise(
        'ejr-1',
        { respuesta: '[2, 5, 8, 1]' },
        'user-1',
      );

      expect(result.rachaDias).toBe(4);
      jest.useRealTimers();
    });

    it('debe reiniciar la racha si pasaron más de dos días', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2026-05-17T12:00:00Z'));
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue(
        mockEjercicio,
      );
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
        rachaDias: 5,
        ultimaActividad: new Date('2026-05-14T12:00:00Z'),
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(0);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      const result = await service.answerExercise(
        'ejr-1',
        { respuesta: '[2, 5, 8, 1]' },
        'user-1',
      );

      expect(result.rachaDias).toBe(1);
      jest.useRealTimers();
    });

    it('debe recalcular nivel cuando los puntos cruzan el umbral', async () => {
      mockPrismaService.ejercicioPrediccion.findUnique.mockResolvedValue({
        ...mockEjercicio,
        dificultad: 'Dificil',
      });
      mockPrismaService.progresoUsuario.findUnique.mockResolvedValue({
        ...mockProgreso,
        puntosTotales: 290,
      });
      mockPrismaService.progresoUsuario.update.mockResolvedValue({});
      mockPrismaService.progresoUsuario.count.mockResolvedValue(0);
      mockPrismaService.respuestaEjercicio.create.mockResolvedValue({});

      const result = await service.answerExercise(
        'ejr-1',
        { respuesta: '[2, 5, 8, 1]' },
        'user-1',
      );

      expect(result.puntosTotales).toBe(320);
      expect(result.nivelActual).toBe(2);
    });
  });
});
