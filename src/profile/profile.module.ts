import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from '@profile/models/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
})
export class ProfileModule {}
