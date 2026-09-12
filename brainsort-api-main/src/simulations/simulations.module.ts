import { Module } from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { SimulationsController } from './simulations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [PrismaModule, BadgesModule],
  controllers: [SimulationsController],
  providers: [SimulationsService],
  exports: [SimulationsService],
})
export class SimulationsModule {}
