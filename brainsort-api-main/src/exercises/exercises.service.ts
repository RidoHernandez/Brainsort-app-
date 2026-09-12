import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnswerExerciseDto } from './dto/answer-exercise.dto';
import { ExerciseResultDto } from './dto/exercise-result.dto';
import { BadgesService } from '../badges/badges.service';

@Injectable()
export class ExercisesService {
  constructor(
    private prisma: PrismaService,
    private badgesService: BadgesService,
  ) {}

  async getExercisesByAlgorithm(algoritmoId: string) {
    const ejercicios = await this.prisma.ejercicioPrediccion.findMany({
      where: { algoritmoId },
      include: { algoritmo: true },
    });

    return ejercicios.map((ejercicio) => ({
      id: ejercicio.id,
      algoritmoId: ejercicio.algoritmoId,
      tipo: ejercicio.tipo,
      pregunta: ejercicio.pregunta,
      dificultad: ejercicio.dificultad,
      opciones: ejercicio.opciones,
      contenido: ejercicio.contenido,
      algoritmo: {
        id: ejercicio.algoritmo.id,
        nombre: ejercicio.algoritmo.nombre,
      },
    }));
  }

  async answerExercise(
    ejercicioId: string,
    answerExerciseDto: AnswerExerciseDto,
    usuarioId: string,
  ): Promise<ExerciseResultDto> {
    const ejercicio = await this.prisma.ejercicioPrediccion.findUnique({
      where: { id: ejercicioId },
    });

    if (!ejercicio) {
      throw new NotFoundException('Ejercicio no encontrado');
    }

    const isCorrect = this.compareAnswers(
      answerExerciseDto.respuesta,
      ejercicio.respuestaCorrecta,
    );

    // Obtener o crear progreso del usuario
    let progreso = await this.prisma.progresoUsuario.findUnique({
      where: { usuarioId },
    });

    if (!progreso) {
      progreso = await this.prisma.progresoUsuario.create({
        data: {
          usuarioId,
          puntosTotales: 0,
          nivelActual: 1,
          rachaDias: 0,
          posicionRanking: 0,
        },
      });
    }

    let puntosGanados = 0;
    let feedback: string;

    if (isCorrect) {
      feedback = ejercicio.feedbackPositivo;
      puntosGanados = this.calculatePoints(ejercicio.dificultad);
      progreso.puntosTotales += puntosGanados;
    } else {
      feedback = ejercicio.feedbackNegativo;
    }

    // Actualizar racha si es primera actividad del día
    await this.updateStreak(progreso);

    // Recalcular nivel
    progreso.nivelActual = this.calculateLevel(progreso.puntosTotales);

    // Guardar respuesta
    await this.prisma.respuestaEjercicio.create({
      data: {
        usuarioId,
        ejercicioId,
        respuesta: answerExerciseDto.respuesta,
        correcto: isCorrect,
        puntosGanados,
        fechaRespuesta: new Date(),
      },
    });

    // Actualizar progreso
    progreso.ultimaActividad = new Date();
    await this.prisma.progresoUsuario.update({
      where: { usuarioId },
      data: {
        puntosTotales: progreso.puntosTotales,
        nivelActual: progreso.nivelActual,
        rachaDias: progreso.rachaDias,
        ultimaActividad: progreso.ultimaActividad,
      },
    });

    // Recalcular ranking
    const posicionRanking = await this.calculateRanking(progreso.puntosTotales);

    // Actualizar ranking en progreso
    await this.prisma.progresoUsuario.update({
      where: { usuarioId },
      data: { posicionRanking },
    });

    // Verificar insignias post-correcto
    if (isCorrect) {
      await this.badgesService.checkAndAward(usuarioId);
    }

    return {
      correcto: isCorrect,
      feedback,
      feedbackPositivo: isCorrect ? feedback : undefined,
      feedbackNegativo: isCorrect ? undefined : feedback,
      puntosGanados,
      rachaDias: progreso.rachaDias,
      posicionRanking,
      nivelActual: progreso.nivelActual,
      puntosTotales: progreso.puntosTotales,
    };
  }

  private compareAnswers(userAnswer: string, correctAnswer: string): boolean {
    const parsedUser = this.tryParseJson(userAnswer);
    const parsedCorrect = this.tryParseJson(correctAnswer);

    if (parsedUser.ok && parsedCorrect.ok) {
      return (
        JSON.stringify(parsedUser.value) === JSON.stringify(parsedCorrect.value)
      );
    }

    // Normalizar respuestas para comparación (trim, lowercase, sin espacios extra)
    const normalizedUser = userAnswer.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedCorrect = correctAnswer
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
    return normalizedUser === normalizedCorrect;
  }

  private tryParseJson(
    value: string,
  ): { ok: true; value: unknown } | { ok: false } {
    try {
      return { ok: true, value: JSON.parse(value) };
    } catch {
      return { ok: false };
    }
  }

  private calculatePoints(dificultad: string): number {
    switch (dificultad) {
      case 'Facil':
        return 10;
      case 'Medio':
        return 20;
      case 'Dificil':
        return 30;
      default:
        return 10;
    }
  }

  private async updateStreak(progreso: any): Promise<void> {
    const now = new Date();
    const ultimaActividad = progreso.ultimaActividad
      ? new Date(progreso.ultimaActividad)
      : null;

    if (!ultimaActividad) {
      // Primera actividad
      progreso.rachaDias = 1;
      return;
    }

    const daysDiff = this.getDaysDifference(ultimaActividad, now);

    if (daysDiff === 0) {
      // Mismo día, no actualizar racha
      return;
    } else if (daysDiff === 1) {
      // Día siguiente, incrementar racha
      progreso.rachaDias += 1;
    } else {
      // Más de un día sin actividad, reiniciar racha
      progreso.rachaDias = 1;
    }
  }

  private getDaysDifference(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffTime = date2.getTime() - date1.getTime();
    return Math.floor(diffTime / oneDay);
  }

  /**
   * Calcula el nivel del usuario usando la fórmula cuadrática del spec.
   * Referencia: gamification-xp-progression.spec.md §3.1
   * Fórmula: nivel = floor((-1 + sqrt(1 + 4*XP/50)) / 2), clamped [1, 32]
   */
  private calculateLevel(puntosTotales: number): number {
    if (puntosTotales <= 0) return 1;
    const nivel = Math.floor(
      (-1 + Math.sqrt(1 + (4 * puntosTotales) / 50)) / 2,
    );
    return Math.min(Math.max(nivel, 1), 32);
  }

  private async calculateRanking(puntosTotales: number): Promise<number> {
    const usuariosConMasPuntos = await this.prisma.progresoUsuario.count({
      where: {
        puntosTotales: { gt: puntosTotales },
      },
    });

    return usuariosConMasPuntos + 1;
  }
}
