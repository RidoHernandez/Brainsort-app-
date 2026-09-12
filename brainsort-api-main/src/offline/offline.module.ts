import { Module } from '@nestjs/common';
import { OfflineService } from './offline.service';
import { OfflineController } from './offline.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OfflineController],
  providers: [OfflineService],
  exports: [OfflineService],
})
export class OfflineModule {}
