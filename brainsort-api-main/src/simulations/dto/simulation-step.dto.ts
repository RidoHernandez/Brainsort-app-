import { ApiProperty } from '@nestjs/swagger';
import {
  TipoOperacion,
  SimulationMarker,
  SimulationTreeNode,
} from '../../simulations/engines/engine.interface';

export class SimulationStepDto {
  @ApiProperty({ description: 'Número del paso en la simulación' })
  numeroPaso: number;

  @ApiProperty({
    description: 'Tipo de operación realizada',
    enum: ['comparacion', 'intercambio', 'insercion', 'final', 'idle'],
  })
  tipoOperacion: TipoOperacion;

  @ApiProperty({
    type: [Number],
    description: 'Índices del array siendo modificados o comparados',
  })
  indicesActivos: number[];

  @ApiProperty({ type: [Number], description: 'Estado del array en este paso' })
  estadoArray: number[];

  @ApiProperty({
    description: 'Línea de pseudocódigo correspondiente (base 1)',
  })
  lineaPseudocodigo: number;

  @ApiProperty({
    required: false,
    description:
      'Marcadores visuales enriquecidos desde la configuración del algoritmo',
  })
  marcadores?: SimulationMarker[];

  @ApiProperty({
    required: false,
    description: 'Nodos explícitos para visualizaciones de árbol',
  })
  nodosArbol?: SimulationTreeNode[];
}
