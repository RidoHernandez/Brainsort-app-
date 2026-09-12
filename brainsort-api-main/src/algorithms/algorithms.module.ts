import { Module } from '@nestjs/common';
import {
  AlgorithmsController,
  AlgorithmDetailController,
} from './algorithms.controller';
import { AlgorithmsService } from './algorithms.service';

@Module({
  controllers: [AlgorithmsController, AlgorithmDetailController],
  providers: [AlgorithmsService],
})
export class AlgorithmsModule {}
