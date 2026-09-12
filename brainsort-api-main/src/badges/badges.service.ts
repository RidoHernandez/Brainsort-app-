import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface BadgeRule {
  criterio: string;
  meetsRequirement: (data: any) => boolean;
}

@Injectable()
export class BadgesService {
  private badgesCache: any[] = [];
  private cacheTimestamp: Date | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  private badgeRules: Map<string, BadgeRule> = new Map([
    [
      'Completar 1 simulación',
      {
        criterio: 'Completar 1 simulación',
        meetsRequirement: (data) => data.simulacionesCompletadas >= 1,
      },
    ],
    [
      'Visualizar 3 algoritmos',
      {
        criterio: 'Visualizar 3 algoritmos',
        meetsRequirement: (data) => data.algoritmosVistos >= 3,
      },
    ],
    [
      'rachaDías >= 7',
      {
        criterio: 'rachaDías >= 7',
        meetsRequirement: (data) => data.rachaDias >= 7,
      },
    ],
    [
      'Completar todos los algoritmos de Ordenamiento',
      {
        criterio: 'Completar todos los algoritmos de Ordenamiento',
        meetsRequirement: (data) =>
          data.algoritmosCompletadosOrdenamiento >= data.totalOrdenamiento,
      },
    ],
  ]);

  constructor(private prisma: PrismaService) {
    this.loadBadgesCache();
  }

  private async loadBadgesCache() {
    const badges = await this.prisma.insignia.findMany();
    this.badgesCache = badges;
    this.cacheTimestamp = new Date();
  }

  private isCacheValid(): boolean {
    if (!this.cacheTimestamp) return false;
    const now = new Date();
    return now.getTime() - this.cacheTimestamp.getTime() < this.CACHE_TTL;
  }

  private async getBadgesFromCache(): Promise<any[]> {
    if (!this.isCacheValid()) {
      await this.loadBadgesCache();
    }
    return this.badgesCache;
  }

  invalidateCache() {
    this.cacheTimestamp = null;
  }

  async getAllBadges(): Promise<any[]> {
    const badges = await this.getBadgesFromCache();
    return badges.map((badge) => ({
      id: badge.id,
      nombre: badge.nombre,
      descripcion: badge.descripcion,
      imagen: badge.imagen,
      criterioDesbloqueo: badge.criterioDesbloqueo,
      desbloqueada: false,
    }));
  }

  async getUserBadges(usuarioId: string): Promise<any[]> {
    const allBadges = await this.getBadgesFromCache();
    const progreso = await this.prisma.progresoUsuario.findUnique({
      where: { usuarioId },
    });

    if (!progreso) {
      throw new NotFoundException('Progreso no encontrado');
    }

    const userInsignias = await this.prisma.progresoInsignia.findMany({
      where: { progresoId: progreso.id },
      include: {
        insignia: true,
      },
    });

    const userBadgeIds = new Set(userInsignias.map((ui) => ui.insigniaId));

    return allBadges.map((badge) => ({
      id: badge.id,
      nombre: badge.nombre,
      descripcion: badge.descripcion,
      imagen: badge.imagen,
      criterioDesbloqueo: badge.criterioDesbloqueo,
      desbloqueada: userBadgeIds.has(badge.id),
      fechaObtencion: userBadgeIds.has(badge.id)
        ? userInsignias.find((ui) => ui.insigniaId === badge.id)?.fechaObtencion
        : undefined,
    }));
  }

  async checkAndAward(usuarioId: string): Promise<void> {
    const progreso = await this.prisma.progresoUsuario.findUnique({
      where: { usuarioId },
    });

    if (!progreso) {
      throw new NotFoundException('Progreso no encontrado');
    }

    const allBadges = await this.getBadgesFromCache();
    const userInsignias = await this.prisma.progresoInsignia.findMany({
      where: { progresoId: progreso.id },
    });
    const userBadgeIds = new Set(userInsignias.map((ui) => ui.insigniaId));

    // Obtener datos para evaluación de reglas
    const simulacionesCompletadas = await this.prisma.sesionSimulacion.count({
      where: { usuarioId, completada: true },
    });

    const sesionesAlgoritmos = await this.prisma.sesionSimulacion.findMany({
      where: { usuarioId },
      select: { algoritmoId: true },
    });
    const algoritmosVistos = new Set(
      sesionesAlgoritmos.map((s) => s.algoritmoId),
    ).size;

    const algoritmosOrdenamiento = await this.prisma.algoritmo.count({
      where: { categoria: 'Ordenamiento' },
    });

    const sesionesOrdenamiento = await this.prisma.sesionSimulacion.findMany({
      where: {
        usuarioId,
        completada: true,
        algoritmo: { categoria: 'Ordenamiento' },
      },
      select: { algoritmoId: true },
    });
    const algoritmosCompletadosOrdenamiento = new Set(
      sesionesOrdenamiento.map((s) => s.algoritmoId),
    ).size;

    const data = {
      simulacionesCompletadas,
      algoritmosVistos,
      rachaDias: progreso.rachaDias,
      algoritmosCompletadosOrdenamiento,
      totalOrdenamiento: algoritmosOrdenamiento,
    };

    for (const badge of allBadges) {
      if (userBadgeIds.has(badge.id)) continue; // Ya tiene la insignia

      const rule = this.badgeRules.get(badge.criterioDesbloqueo);
      if (rule && rule.meetsRequirement(data)) {
        // Otorgar insignia
        await this.prisma.progresoInsignia.create({
          data: {
            progresoId: progreso.id,
            insigniaId: badge.id,
            fechaObtencion: new Date(),
          },
        });
      }
    }
  }
}
