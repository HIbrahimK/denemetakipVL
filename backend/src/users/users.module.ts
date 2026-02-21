import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController, ProfileController } from './users.controller';

@Module({
  controllers: [UsersController, ProfileController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
