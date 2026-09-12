import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiagnosticsService {
  constructor(private prisma: PrismaService) {}

  async getPreguntas() {
    // Retornar preguntas omitiendo la respuesta correcta
    const preguntas = await this.prisma.preguntaDiagnostico.findMany({
      select: {
        id: true,
        pregunta: true,
        opciones: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    return preguntas;
  }

  async evaluar(usuarioId: string, respuestasUsuario: number[]) {
    const preguntas = await this.prisma.preguntaDiagnostico.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (respuestasUsuario.length !== preguntas.length) {
      throw new BadRequestException(
        'El número de respuestas no coincide con las preguntas',
      );
    }

    let correctas = 0;
    preguntas.forEach((p, index) => {
      if (p.indiceCorrecto === respuestasUsuario[index]) {
        correctas++;
      }
    });

    const puntaje =
      preguntas.length > 0
        ? Math.round((correctas / preguntas.length) * 100)
        : 0;

    // Guardar resultado
    await this.prisma.resultadoDiagnostico.upsert({
      where: { usuarioId },
      update: { puntaje, fechaEvaluacion: new Date() },
      create: { usuarioId, puntaje },
    });

    // Generar Ruta de Aprendizaje (Lógica V1)
    // Obtener los algoritmos existentes
    const algoritmos = await this.prisma.algoritmo.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
    });

    const getAlgoId = (nameQuery: string) => {
      return algoritmos.find((a) =>
        a.nombre.toLowerCase().includes(nameQuery.toLowerCase()),
      )?.id;
    };

    const linearSearch = getAlgoId('linear search');
    const binarySearch = getAlgoId('binary search');
    const stack = getAlgoId('stack');
    const queue = getAlgoId('queue');
    const linkedList = getAlgoId('linked list');
    const deque = getAlgoId('deque');
    const bubble = getAlgoId('bubble sort');
    const insertion = getAlgoId('insertion sort');
    const selection = getAlgoId('selection sort');
    const merge = getAlgoId('merge sort');
    const quick = getAlgoId('quick sort');
    const priorityQueue = getAlgoId('priority queue');
    const heapSort = getAlgoId('heap sort');
    const segmentTree = getAlgoId('segment tree');

    let algoritmosId: string[] = [];
    if (puntaje < 40) {
      // Principiante
      algoritmosId = [
        linearSearch,
        stack,
        queue,
        bubble,
        insertion,
        binarySearch,
        linkedList,
        deque,
        selection,
        merge,
        quick,
        priorityQueue,
        heapSort,
        segmentTree,
      ].filter((id): id is string => !!id);
    } else if (puntaje <= 75) {
      // Intermedio
      algoritmosId = [
        binarySearch,
        linkedList,
        deque,
        selection,
        merge,
        quick,
        priorityQueue,
        heapSort,
        segmentTree,
        linearSearch,
        stack,
        queue,
        bubble,
        insertion,
      ].filter((id): id is string => !!id);
    } else {
      // Avanzado
      algoritmosId = [
        merge,
        quick,
        priorityQueue,
        heapSort,
        segmentTree,
        binarySearch,
        linkedList,
        deque,
        selection,
        linearSearch,
        stack,
        queue,
        bubble,
        insertion,
      ].filter((id): id is string => !!id);
    }

    if (algoritmosId.length === 0) {
      algoritmosId = algoritmos.map((a) => a.id);
    }

    const ruta = await this.prisma.rutaAprendizaje.upsert({
      where: { usuarioId },
      update: { algoritmosId },
      create: { usuarioId, algoritmosId },
    });

    return {
      puntaje,
      rutaGenerada: ruta.id,
      algoritmosSugeridos: algoritmosId.length,
    };
  }
}
