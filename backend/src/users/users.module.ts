import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController, ProfileController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [UsersController, ProfileController],
    providers: [UsersService, PrismaService],
    exports: [UsersService],
})
export class UsersModule { }
