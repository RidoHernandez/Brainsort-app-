import { Module } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [PrismaModule, BadgesModule],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
