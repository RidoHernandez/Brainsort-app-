import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaAlgoritmo, Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import {
  AlgorithmLibraryCardDto,
  AlgorithmDetailResponseDto,
  LibraryResponseDto,
  PseudocodeLineDto,
} from './dto/algorithm-response.dto';

const DESCRIPCION_TARJETA_MAX = 140;

const CATEGORIAS_ORDEN: CategoriaAlgoritmo[] = [
  CategoriaAlgoritmo.Ordenamiento,
  CategoriaAlgoritmo.Busqueda,
  CategoriaAlgoritmo.EstructurasLineales,
  CategoriaAlgoritmo.EstructurasArboles,
];

@Injectable()
export class AlgorithmsService {
  constructor(private readonly prisma: PrismaService) {}

  private truncarDescripcion(texto: string): string {
    if (texto.length <= DESCRIPCION_TARJETA_MAX) {
      return texto;
    }
    return texto.slice(0, DESCRIPCION_TARJETA_MAX);
  }

  private aTarjeta(
    row: Prisma.AlgoritmoGetPayload<Record<string, never>>,
  ): AlgorithmLibraryCardDto {
    return {
      id: row.id,
      nombre: row.nombre,
      descripcion: this.truncarDescripcion(row.descripcion),
      dificultad: row.dificultad,
      complejidadTiempo: row.complejidadTiempo,
      complejidadEspacio: row.complejidadEspacio,
      categoria: row.categoria,
      tags: row.tags,
    };
  }

  private normalizarPseudocodigo(raw: unknown): PseudocodeLineDto[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((linea, index) => {
        if (!linea || typeof linea !== 'object') {
          return null;
        }

        const item = linea as Record<string, unknown>;
        const line =
          typeof item.line === 'number'
            ? item.line
            : typeof item.numero === 'number'
              ? item.numero
              : index + 1;
        const text =
          typeof item.text === 'string'
            ? item.text
            : typeof item.codigo === 'string'
              ? item.codigo
              : '';
        const indent =
          typeof item.indent === 'number'
            ? item.indent
            : text.match(/^\s*/)?.[0].length
              ? Math.floor((text.match(/^\s*/)?.[0].length ?? 0) / 2)
              : 0;

        return {
          line,
          text: text.trimStart(),
          indent,
        };
      })
      .filter((linea): linea is PseudocodeLineDto => Boolean(linea));
  }

  async getLibrary(query: any): Promise<LibraryResponseDto> {
    const where: Prisma.AlgoritmoWhereInput = {
      activo: true,
    };

    if (query.categoria) {
      where.categoria = query.categoria;
    }

    const nombre = query.nombre?.trim();
    if (nombre) {
      where.nombre = {
        contains: nombre,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    if (query.tags) {
      const tagsArray = Array.isArray(query.tags)
        ? query.tags
        : query.tags.split(',').map((t: string) => t.trim());

      if (tagsArray.length > 0) {
        where.tags = {
          hasSome: tagsArray,
        };
      }
    }

    const algoritmos = await this.prisma.algoritmo.findMany({
      where,
      orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
    });

    const totalAlgoritmos = await this.prisma.algoritmo.count({ where });

    return {
      categorias: CATEGORIAS_ORDEN,
      totalAlgoritmos,
      algoritmos: algoritmos.map((a) => this.aTarjeta(a)),
    };
  }

  /**
   * CO2 — Obtiene el detalle completo de un algoritmo con pseudocódigo.
   * La descripción se retorna completa (sin truncar).
   * El pseudocódigo se obtiene de la base de datos (CDR-009).
   *
   * Ref: 04-contratos-api.md §3 CO2, 01-backend-api.md §2.3
   */
  async getAlgorithm(id: string): Promise<AlgorithmDetailResponseDto> {
    const algoritmo = await this.prisma.algoritmo.findUnique({
      where: { id },
    });

    if (!algoritmo) {
      throw new NotFoundException('Algoritmo no encontrado');
    }

    return {
      id: algoritmo.id,
      nombre: algoritmo.nombre,
      descripcion: algoritmo.descripcion, // Descripción completa, sin truncar
      dificultad: algoritmo.dificultad,
      complejidadTiempo: algoritmo.complejidadTiempo,
      complejidadEspacio: algoritmo.complejidadEspacio,
      categoria: algoritmo.categoria,
      tags: algoritmo.tags,
      pseudocode: this.normalizarPseudocodigo(algoritmo.pseudocodigo),
    };
  }
}
