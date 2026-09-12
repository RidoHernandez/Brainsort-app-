import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PseudocodeLine } from '../simulations/engines/engine.interface';
import {
  OfflineModuleDto,
  OfflineModuleDownloadDto,
} from './dto/offline-module.dto';

@Injectable()
export class OfflineService {
  constructor(private prisma: PrismaService) {}

  async getOfflineModules(usuarioId: string): Promise<OfflineModuleDto[]> {
    void usuarioId;

    const algoritmos = await this.prisma.algoritmo.findMany({
      where: { activo: true },
    });

    // Simular módulos descargados por el usuario (en una implementación real, esto vendría de una tabla de descargas)
    const descargadosIds = new Set<string>(); // TODO: Implementar tracking de descargas

    return algoritmos.map((algoritmo) => {
      const pseudocode = this.getPseudocode(algoritmo.nombre);
      const tamanoKB = this.calculateModuleSize(
        {
          meta: {
            nombre: algoritmo.nombre,
            descripcion: algoritmo.descripcion,
          },
        },
        pseudocode,
      );

      return {
        algoritmoId: algoritmo.id,
        nombre: algoritmo.nombre,
        tamanoKB,
        version: '1.0.0', // TODO: Implementar versioning
        descargado: descargadosIds.has(algoritmo.id),
      };
    });
  }

  async downloadModule(algoritmoId: string): Promise<OfflineModuleDownloadDto> {
    const algoritmo = await this.prisma.algoritmo.findUnique({
      where: { id: algoritmoId },
    });

    if (!algoritmo) {
      throw new NotFoundException('Algoritmo no encontrado');
    }

    const pseudocode = this.getPseudocode(algoritmo.nombre);

    // Obtener ejercicios
    const ejercicios = await this.prisma.ejercicioPrediccion.findMany({
      where: { algoritmoId },
    });

    return {
      algoritmoId: algoritmo.id,
      version: '1.0.0',
      meta: {
        id: algoritmo.id,
        nombre: algoritmo.nombre,
        descripcion: algoritmo.descripcion,
        dificultad: algoritmo.dificultad,
        complejidadTiempo: algoritmo.complejidadTiempo,
        complejidadEspacio: algoritmo.complejidadEspacio,
        categoria: algoritmo.categoria,
      },
      pseudocode,
      ejercicios: ejercicios.map((ejercicio) => ({
        id: ejercicio.id,
        tipo: ejercicio.tipo,
        pregunta: ejercicio.pregunta,
        dificultad: ejercicio.dificultad,
        opciones: ejercicio.opciones,
        contenido: ejercicio.contenido,
        respuestaCorrecta: ejercicio.respuestaCorrecta,
        feedbackPositivo: ejercicio.feedbackPositivo,
        feedbackNegativo: ejercicio.feedbackNegativo,
      })),
    };
  }

  private calculateModuleSize(
    engine: { meta: unknown },
    pseudocode: PseudocodeLine[],
  ): number {
    // Calcular tamaño aproximado en KB basado en el contenido del engine
    const metaSize = JSON.stringify(engine.meta).length;
    const pseudocodeSize = JSON.stringify(pseudocode).length;
    const totalBytes = metaSize + pseudocodeSize;
    return Math.ceil(totalBytes / 1024);
  }

  private getPseudocode(nombre: string): PseudocodeLine[] {
    const pseudocodeByAlgorithm: Record<string, PseudocodeLine[]> = {
      'Bubble Sort': [
        { line: 1, text: 'Repetir hasta ordenar el arreglo', indent: 0 },
        { line: 2, text: 'Para cada par adyacente', indent: 1 },
        { line: 3, text: 'Comparar elementos vecinos', indent: 2 },
        { line: 4, text: 'Intercambiar si estan desordenados', indent: 2 },
      ],
      'Selection Sort': [
        { line: 1, text: 'Para cada posicion del arreglo', indent: 0 },
        { line: 2, text: 'Buscar el menor elemento restante', indent: 1 },
        { line: 3, text: 'Comparar contra el minimo actual', indent: 2 },
        { line: 4, text: 'Intercambiar con la posicion actual', indent: 1 },
      ],
      'Insertion Sort': [
        { line: 1, text: 'Recorrer desde el segundo elemento', indent: 0 },
        { line: 2, text: 'Guardar el valor actual como clave', indent: 1 },
        {
          line: 3,
          text: 'Desplazar elementos mayores a la derecha',
          indent: 1,
        },
        { line: 4, text: 'Insertar la clave en su posicion', indent: 1 },
      ],
      Stack: [
        { line: 1, text: 'Crear pila vacia', indent: 0 },
        { line: 2, text: 'Push agrega en la cima', indent: 1 },
        { line: 3, text: 'Pop remueve desde la cima', indent: 1 },
      ],
      Queue: [
        { line: 1, text: 'Crear cola vacia', indent: 0 },
        { line: 2, text: 'Enqueue agrega al final', indent: 1 },
        { line: 3, text: 'Dequeue remueve del frente', indent: 1 },
      ],
      'Linked List': [
        { line: 1, text: 'Crear nodo inicial', indent: 0 },
        { line: 2, text: 'Enlazar cada nodo con el siguiente', indent: 1 },
        { line: 3, text: 'Recorrer siguiendo referencias', indent: 1 },
      ],
    };

    return (
      pseudocodeByAlgorithm[nombre] ?? [
        { line: 1, text: 'Ejecutar algoritmo seleccionado', indent: 0 },
      ]
    );
  }
}
