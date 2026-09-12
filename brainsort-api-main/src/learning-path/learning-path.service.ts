import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearningPathService {
  constructor(private prisma: PrismaService) {}

  async getRutaUsuario(usuarioId: string) {
    const ruta = await this.prisma.rutaAprendizaje.findUnique({
      where: { usuarioId },
    });

    if (!ruta) {
      throw new NotFoundException(
        'El usuario no tiene una ruta asignada. Debe realizar el diagnóstico.',
      );
    }

    // Obtener detalles de los algoritmos de la ruta
    const algoritmos = await this.prisma.algoritmo.findMany({
      where: { id: { in: ruta.algoritmosId } },
      select: {
        id: true,
        nombre: true,
        descripcion: true,
        dificultad: true,
        categoria: true,
        tags: true,
      },
    });

    // Ordenar los algoritmos según el orden de la ruta
    const algoritmosOrdenados = ruta.algoritmosId
      .map((id) => algoritmos.find((a) => a.id === id))
      .filter(Boolean);

    // Obtener el último diagnóstico si existe
    const diagnostico = await this.prisma.resultadoDiagnostico.findUnique({
      where: { usuarioId },
    });

    return {
      id: ruta.id,
      createdAt: ruta.createdAt,
      algoritmos: algoritmosOrdenados,
      diagnostico: diagnostico
        ? {
            puntaje: diagnostico.puntaje,
            fechaEvaluacion: diagnostico.fechaEvaluacion,
          }
        : null,
    };
  }
}
