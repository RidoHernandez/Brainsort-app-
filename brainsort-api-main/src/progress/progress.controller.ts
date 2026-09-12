import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProgressService } from './progress.service';

@ApiTags('progreso')
@Controller('progreso')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener progreso del usuario actual',
    description:
      'Retorna el progreso completo del usuario incluyendo puntos, nivel, racha, ranking, insignias y estadísticas',
  })
  async getUserProgress(@Request() req) {
    const usuarioId = req.user.id;
    return this.progressService.getUserProgress(usuarioId);
  }

  @Get('ranking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener leaderboard',
    description: 'Retorna el top N del ranking ordenado por puntos',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  async getRanking(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    const parsedLimit = Number(limit);
    const parsedOffset = Number(offset);

    return this.progressService.getRanking(
      Number.isFinite(parsedLimit) ? parsedLimit : 20,
      Number.isFinite(parsedOffset) ? parsedOffset : 0,
    );
  }
}
