import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { LearningPathService } from './learning-path.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Ruta Aprendizaje')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ruta-aprendizaje')
export class LearningPathController {
  constructor(private readonly learningPathService: LearningPathService) {}

  @Get('me')
  async getMiRuta(@Request() req) {
    return this.learningPathService.getRutaUsuario(req.user.id);
  }
}
