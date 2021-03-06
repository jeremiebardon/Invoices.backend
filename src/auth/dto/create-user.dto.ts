import { Profile } from '@profile/models/profile.entity';

import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly password: string;

  readonly firstName: string;
  readonly lastName: string;
  readonly profile?: Profile;
}
