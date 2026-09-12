import { Module } from '@nestjs/common';
import { AlgorithmsModule } from './algorithms/algorithms.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SimulationsModule } from './simulations/simulations.module';
import { ExercisesModule } from './exercises/exercises.module';
import { ProgressModule } from './progress/progress.module';
import { BadgesModule } from './badges/badges.module';
import { OfflineModule } from './offline/offline.module';
import { SyncModule } from './sync/sync.module';
import { DiagnosticsModule } from './diagnostics/diagnostics.module';
import { LearningPathModule } from './learning-path/learning-path.module';

@Module({
  imports: [
    PrismaModule,
    AlgorithmsModule,
    AuthModule,
    UsersModule,
    SimulationsModule,
    ExercisesModule,
    ProgressModule,
    BadgesModule,
    OfflineModule,
    SyncModule,
    DiagnosticsModule,
    LearningPathModule,
  ],
})
export class AppModule {}
