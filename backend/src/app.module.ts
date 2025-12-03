import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './questions/questions.module';
import { AdminModule } from './admin/admin.module';
import { GameModule } from './game/game.module';
import { SeederModule } from './seeder/seeder.module';
import { StartupModule } from './startup/startup.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    StartupModule, // Must be first to generate credentials before other modules
    PrismaModule,
    AuthModule,
    QuestionsModule,
    AdminModule,
    GameModule,
    SeederModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
