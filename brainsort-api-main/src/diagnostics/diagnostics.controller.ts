import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DiagnosticsService } from './diagnostics.service';
import { EvaluateDiagnosticDto } from './dto/evaluate-diagnostic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Diagnostico')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('diagnostico')
export class DiagnosticsController {
  constructor(private readonly diagnosticsService: DiagnosticsService) {}

  @Get('preguntas')
  async getPreguntas() {
    return this.diagnosticsService.getPreguntas();
  }

  @Post('evaluar')
  async evaluar(@Request() req, @Body() dto: EvaluateDiagnosticDto) {
    return this.diagnosticsService.evaluar(req.user.id, dto.respuestas);
  }
}
