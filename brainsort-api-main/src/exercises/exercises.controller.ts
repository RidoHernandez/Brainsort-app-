import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExercisesService } from './exercises.service';
import { AnswerExerciseDto } from './dto/answer-exercise.dto';

@ApiTags('ejercicios')
@Controller('ejercicios')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get(':algoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista ejercicios de un algoritmo',
    description:
      'Retorna todos los ejercicios de predicción asociados a un algoritmo',
  })
  @ApiParam({ name: 'algoId', description: 'ID del algoritmo' })
  async getExercisesByAlgorithm(@Param('algoId') algoId: string) {
    return this.exercisesService.getExercisesByAlgorithm(algoId);
  }

  @Post(':id/responder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Evaluar respuesta del usuario',
    description:
      'Evalúa la respuesta del usuario a un ejercicio, actualiza progreso y retorna resultado',
  })
  @ApiParam({ name: 'id', description: 'ID del ejercicio' })
  async answerExercise(
    @Param('id') id: string,
    @Body() answerExerciseDto: AnswerExerciseDto,
    @Request() req,
  ) {
    const usuarioId = req.user.id;
    return this.exercisesService.answerExercise(
      id,
      answerExerciseDto,
      usuarioId,
    );
  }
}
