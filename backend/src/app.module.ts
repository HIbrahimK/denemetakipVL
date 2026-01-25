import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SchoolsModule } from './schools/schools.module';
import { ImportModule } from './import/import.module';
import { QueueModule } from './queue/queue.module';
import { ExamsModule } from './exams/exams.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 900000, // 15 minutes
      limit: 100, // 100 requests per 15 min
    }]),
    PrismaModule,
    AuthModule,
    SchoolsModule,
    ImportModule,
    QueueModule,
    ExamsModule,
  ],
})
export class AppModule { }
