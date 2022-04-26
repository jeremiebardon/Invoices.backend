import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './models/user.entity';
import { ProfileModule } from '@profile/profile.module';
import { Profile } from '@profile/models/profile.entity';

@Module({
  imports: [ProfileModule, TypeOrmModule.forFeature([User, Profile])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
