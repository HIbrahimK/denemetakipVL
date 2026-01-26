import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SchoolsModule } from './schools/schools.module';
import { ImportModule } from './import/import.module';
import { QueueModule } from './queue/queue.module';
import { ExamsModule } from './exams/exams.module';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    SchoolsModule,
    ImportModule,
    QueueModule,
    ExamsModule,
    StudentsModule,
    UsersModule,
  ],
})
export class AppModule { }
