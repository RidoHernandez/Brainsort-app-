import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SimulationsService } from './simulations.service';
import { CreateSimulationDto } from './dto/create-simulation.dto';

@ApiTags('simulaciones')
@Controller('simulaciones')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'CO3 - Generar simulación de algoritmo',
    description:
      'Genera una simulación paso a paso del algoritmo especificado con los datos proporcionados',
  })
  async createSimulation(
    @Body() createSimulationDto: CreateSimulationDto,
    @Request() req,
  ) {
    const usuarioId = req.user.id;
    const data = await this.simulationsService.createSimulation(
      createSimulationDto,
      usuarioId,
    );
    return data;
  }
}
