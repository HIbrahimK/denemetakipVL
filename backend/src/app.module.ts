import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SchoolsModule } from './schools/schools.module';
import { ImportModule } from './import/import.module';
import { QueueModule } from './queue/queue.module';
import { ExamsModule } from './exams/exams.module';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';
import { ParentsModule } from './parents/parents.module';
import { ReportsModule } from './reports/reports.module';
import { SearchModule } from './search/search.module';
import { MessagesModule } from './messages/messages.module';
import { StudyModule } from './study/study.module';
import { GroupsModule } from './groups/groups.module';
import { SubjectsModule } from './subjects/subjects.module';
import { HealthController } from './health.controller';
import { AchievementsModule } from './achievements/achievements.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
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
    ParentsModule,
    ReportsModule,
    SearchModule,
    MessagesModule,
    StudyModule,
    GroupsModule,
    SubjectsModule,
    AchievementsModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }

