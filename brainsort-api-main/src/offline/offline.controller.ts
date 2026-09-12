import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OfflineService } from './offline.service';

@ApiTags('modules')
@Controller('modules/offline')
export class OfflineController {
  constructor(private readonly offlineService: OfflineService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista módulos disponibles para descarga offline',
    description:
      'Retorna todos los algoritmos disponibles para descarga offline con información de tamaño y estado',
  })
  async getOfflineModules(@Request() req) {
    const usuarioId = req.user.id;
    return this.offlineService.getOfflineModules(usuarioId);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Descargar módulo offline',
    description:
      'Retorna el JSON completo del módulo (meta, pseudocode, ejercicios) para uso offline',
  })
  @ApiParam({ name: 'id', description: 'ID del algoritmo' })
  async downloadModule(@Param('id') id: string) {
    return this.offlineService.downloadModule(id);
  }
}
