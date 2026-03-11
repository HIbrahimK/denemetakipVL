import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccessLogsController } from './access-logs.controller';
import { AccessLogsService } from './access-logs.service';

@Module({
  imports: [PrismaModule],
  controllers: [AccessLogsController],
  providers: [AccessLogsService],
  exports: [AccessLogsService],
})
export class AccessLogsModule {}