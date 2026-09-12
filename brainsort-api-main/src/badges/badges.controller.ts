import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BadgesService } from './badges.service';

@ApiTags('insignias')
@Controller('insignias')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todas las insignias disponibles',
    description:
      'Retorna todas las insignias del sistema con sus criterios de desbloqueo',
  })
  async getAllBadges() {
    return this.badgesService.getAllBadges();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener insignias del usuario',
    description:
      'Retorna las insignias desbloqueadas por el usuario con fecha de obtención',
  })
  async getUserBadges(@Request() req) {
    const usuarioId = req.user.id;
    return this.badgesService.getUserBadges(usuarioId);
  }
}
