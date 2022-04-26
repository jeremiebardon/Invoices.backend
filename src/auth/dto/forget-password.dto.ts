import { IsNotEmpty } from 'class-validator';

export class ForgetPasswordDto {
  @IsNotEmpty()
  readonly email: string;
}
