import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { executeWithTimeout } from './engines/registry';
import { CreateSimulationDto } from './dto/create-simulation.dto';
import { SimulationStepDto } from './dto/simulation-step.dto';
import { BadgesService } from '../badges/badges.service';
import {
  PseudocodeLine,
  SimulationMarker,
  SimulationStep,
} from './engines/engine.interface';

type VisualizationRole = {
  label?: string;
  color: string;
};

type VisualizationConfig = {
  roles?: Record<string, VisualizationRole>;
  lineLabels?: Record<string, string[]>;
  recursion?: {
    waitingRole?: string;
    waitingLabel?: string;
  };
};

type RawPseudocodeLine = Partial<PseudocodeLine> & {
  numero?: number;
  codigo?: string;
};

@Injectable()
export class SimulationsService {
  constructor(
    private prisma: PrismaService,
    private badgesService: BadgesService,
  ) {}

  /**
   * CO3 — Genera simulación del algoritmo.
   *
   * Retorna la estructura completa según 04-contratos-api.md §4:
   * { simulacion, pseudocode, totalPasos, pasos }
   *
   * Ref: 04-contratos-api.md §4, 01-backend-api.md §2.4
   */
  async createSimulation(
    createSimulationDto: CreateSimulationDto,
    usuarioId: string,
  ): Promise<{
    simulacion: {
      velocidadReproduccion: number;
      estadoActual: string;
      pasoActual: number;
    };
    pseudocode: PseudocodeLine[];
    totalPasos: number;
    pasos: SimulationStepDto[];
  }> {
    const { algoritmoId, conjuntoDeDatos } = createSimulationDto;

    // 1. Validar que el algoritmo existe y obtener pseudocódigo
    const algoritmo = await this.prisma.algoritmo.findUnique({
      where: { id: algoritmoId, activo: true },
    });

    if (!algoritmo) {
      throw new NotFoundException('Algoritmo no encontrado');
    }

    // 2. Validar datos
    this.validateData(conjuntoDeDatos);

    // 3. Generar arreglo aleatorio si es Predeterminado
    let data = conjuntoDeDatos.valores;
    if (conjuntoDeDatos.tipoOrigen === 'Predeterminado') {
      data = this.generateRandomArray();
    }

    // 4. Ejecutar el engine con timeout
    let steps;
    try {
      steps = await executeWithTimeout(algoritmo.nombre, data);
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error al ejecutar la simulación',
      );
    }

    // 5. Crear SesionSimulacion
    await this.prisma.sesionSimulacion.create({
      data: {
        usuarioId,
        algoritmoId,
        pasosCompletados: 0,
        totalPasos: steps.length,
        completada: false,
        fechaInicio: new Date(),
      },
    });

    // 6. Retornar simulación completa según contrato CO3
    return {
      simulacion: {
        velocidadReproduccion: 1.0,
        estadoActual: 'Pausa',
        pasoActual: 0,
      },
      pseudocode: this.normalizePseudocode(
        algoritmo.pseudocodigo as unknown as RawPseudocodeLine[],
      ),
      totalPasos: steps.length,
      pasos: steps.map((step) => ({
        numeroPaso: step.numeroPaso,
        tipoOperacion: step.tipoOperacion,
        indicesActivos: step.indicesActivos,
        estadoArray: step.estadoArray,
        lineaPseudocodigo: step.lineaPseudocodigo,
        marcadores: this.buildMarkers(
          step,
          algoritmo.visualizacion as VisualizationConfig | null,
        ),
        nodosArbol: step.nodosArbol,
      })),
    };
  }

  private normalizePseudocode(
    lines: RawPseudocodeLine[] | null,
  ): PseudocodeLine[] {
    return (lines ?? []).map((line, index) => {
      const text = line.text ?? line.codigo ?? '';
      const leadingSpaces = text.match(/^ */)?.[0].length ?? 0;

      return {
        line: line.line ?? line.numero ?? index + 1,
        text,
        indent: line.indent ?? Math.floor(leadingSpaces / 2),
      };
    });
  }

  private buildMarkers(
    step: SimulationStep,
    visualizacion: VisualizationConfig | null,
  ): SimulationMarker[] {
    const config = visualizacion ?? {};
    const roles = config.roles ?? {};
    const activeRole = roles.activo ?? { color: '#F5A623' };
    const waitingRoleName = config.recursion?.waitingRole ?? 'esperaRecursion';
    const waitingRole = roles[waitingRoleName] ?? { color: '#6B7280' };
    const labelsByLine = config.lineLabels ?? {};
    const lineLabels = labelsByLine[String(step.lineaPseudocodigo)] ?? [];
    const markers: SimulationMarker[] = [...(step.marcadores ?? [])];

    step.indicesActivos.forEach((index, position) => {
      markers.push({
        index,
        label: lineLabels[position] ?? `v${position + 1}`,
        role: 'activo',
        color: activeRole.color,
      });
    });

    step.contexto?.waitingIndices?.forEach((index) => {
      if (step.indicesActivos.includes(index)) return;
      if (markers.some((marker) => marker.index === index)) return;
      markers.push({
        index,
        label: config.recursion?.waitingLabel ?? waitingRole.label ?? 'espera',
        role: waitingRoleName,
        color: waitingRole.color,
      });
    });

    return markers;
  }

  private validateData(
    conjuntoDeDatos: CreateSimulationDto['conjuntoDeDatos'],
  ): void {
    const { valores, tamano } = conjuntoDeDatos;

    // Validar que no haya valores nulos
    if (valores.some((v) => v === null || v === undefined)) {
      throw new BadRequestException('Los valores no pueden ser nulos');
    }

    // Validar que todos sean números
    if (valores.some((v) => !Number.isInteger(v) || v < 0 || v > 999)) {
      throw new BadRequestException(
        'Los valores deben ser enteros positivos entre 0 y 999',
      );
    }

    // Validar que tamaño coincida con valores.length
    if (tamano !== valores.length) {
      throw new BadRequestException(
        'El tamaño debe coincidir con la cantidad de valores',
      );
    }
  }

  private generateRandomArray(): number[] {
    const size = Math.floor(Math.random() * (15 - 8 + 1)) + 8; // 8-15 elementos
    const array: number[] = [];

    for (let i = 0; i < size; i++) {
      array.push(Math.floor(Math.random() * 100)); // Valores entre 0-99
    }

    // Verificar que no esté pre-ordenado (no debe estar ordenado ascendente)
    const isSorted = array.every((val, i, arr) => !i || arr[i - 1] <= val);
    if (isSorted) {
      // Si está ordenado, mezclarlo
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    return array;
  }

  /**
   * Actualiza el progreso de una sesión de simulación.
   * Compara pasosCompletados contra el totalPasos de la sesión.
   */
  async updateSessionProgress(
    sesionId: string,
    pasosCompletados: number,
  ): Promise<void> {
    const sesion = await this.prisma.sesionSimulacion.findUnique({
      where: { id: sesionId },
    });

    if (!sesion) {
      throw new NotFoundException('Sesión de simulación no encontrada');
    }

    const completada = pasosCompletados >= sesion.totalPasos;

    await this.prisma.sesionSimulacion.update({
      where: { id: sesionId },
      data: {
        pasosCompletados,
        completada,
        fechaFin: completada ? new Date() : null,
      },
    });

    // Verificar insignias solo cuando la sesión se completa
    if (completada) {
      await this.badgesService.checkAndAward(sesion.usuarioId);
    }
  }
}
