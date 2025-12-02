import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QuestionsModule } from './questions/questions.module';
import { AdminModule } from './admin/admin.module';
import { GameModule } from './game/game.module';
import { SeederModule } from './seeder/seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    QuestionsModule,
    AdminModule,
    GameModule,
    SeederModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
