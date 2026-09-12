import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SyncProgressDto, SyncResponseDto } from './dto/sync-progress.dto';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async syncProgress(
    usuarioId: string,
    syncProgressDto: SyncProgressDto,
  ): Promise<SyncResponseDto> {
    const { sesiones } = syncProgressDto;
    let sincronizados = 0;
    let puntosActualizados = 0;

    for (const sesion of sesiones) {
      // Verificar que el algoritmo existe
      const algoritmo = await this.prisma.algoritmo.findUnique({
        where: { id: sesion.algoritmoId },
      });

      if (!algoritmo) {
        continue; // Saltar sesiones de algoritmos que no existen
      }

      // Verificar si ya existe una sesión con el mismo algoritmoId y fechaInicio
      const existingSesion = await this.prisma.sesionSimulacion.findFirst({
        where: {
          usuarioId,
          algoritmoId: sesion.algoritmoId,
          fechaInicio: sesion.fechaInicio,
        },
      });

      if (existingSesion) {
        continue; // Saltar sesiones ya sincronizadas
      }

      // Crear la sesión de simulación
      await this.prisma.sesionSimulacion.create({
        data: {
          usuarioId,
          algoritmoId: sesion.algoritmoId,
          pasosCompletados: sesion.pasosCompletados,
          totalPasos: sesion.pasosCompletados, // Asumimos que completó todos los pasos
          completada: sesion.completada,
          fechaInicio: sesion.fechaInicio,
          fechaFin: sesion.fechaFin,
        },
      });

      sincronizados++;

      // Si la sesión está completada, actualizar puntos del usuario
      if (sesion.completada) {
        const puntos = this.calculatePoints(algoritmo.dificultad);
        puntosActualizados += puntos;

        await this.updateUserProgress(usuarioId, puntos);
      }
    }

    return {
      sincronizados,
      puntosActualizados,
    };
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

  private async updateUserProgress(
    usuarioId: string,
    puntosGanados: number,
  ): Promise<void> {
    const progreso = await this.prisma.progresoUsuario.findUnique({
      where: { usuarioId },
    });

    if (!progreso) {
      throw new NotFoundException('Progreso no encontrado');
    }

    // Actualizar puntos
    progreso.puntosTotales += puntosGanados;

    // Recalcular nivel
    progreso.nivelActual = this.calculateLevel(progreso.puntosTotales);

    // Recalcular ranking
    progreso.posicionRanking = await this.calculateRanking(
      progreso.puntosTotales,
    );

    // Actualizar última actividad
    progreso.ultimaActividad = new Date();

    await this.prisma.progresoUsuario.update({
      where: { usuarioId },
      data: {
        puntosTotales: progreso.puntosTotales,
        nivelActual: progreso.nivelActual,
        posicionRanking: progreso.posicionRanking,
        ultimaActividad: progreso.ultimaActividad,
      },
    });
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
