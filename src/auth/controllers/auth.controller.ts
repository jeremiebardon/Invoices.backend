import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ForgetPasswordDto } from '@auth/dto/forget-password.dto';
import { ResetPasswordDto } from '@auth/dto/reset-password.dto';
import { User } from '@users/models/user.entity';
import { AuthService } from '@auth/services/auth.service';
import { CreateUserDto } from '@auth/dto/create-user.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guards';
import { LocalAuthGuard } from '@auth/guards/local-auth.guards';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(LocalAuthGuard)
  @ApiTags('auth')
  @ApiOperation({ description: 'Login an user with his password and email' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Req() req: Request): Promise<User> {
    return this.authService.login(req.user as User);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(JwtAuthGuard)
  @ApiTags('auth')
  @ApiOperation({ description: 'Retrieve user information' })
  @Get('me')
  async me(@Req() req): Promise<User> {
    return this.authService.me(req.user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('auth')
  @ApiOperation({ description: 'Register an user with his password and email' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.register(createUserDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('auth')
  @ApiOperation({ description: 'Send email confirmation again' })
  @Post('resend-confirm')
  async resendConfirm(@Body('email') email: string): Promise<User> {
    return this.authService.resendConfirm(email);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('auth')
  @ApiOperation({ description: 'Confirm user account' })
  @Post('confirm/:confirmToken')
  async confirm(@Param('confirmToken') confirmToken: string): Promise<User> {
    return this.authService.confirmUser(confirmToken);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('auth')
  @ApiOperation({ description: 'Ask to reset password if forgotten' })
  @Post('forget-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgetPasswordDto,
  ): Promise<User> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('auth')
  @ApiOperation({ description: 'Reset password' })
  @Post('reset-password/:resetToken')
  async resetPassword(
    @Param('resetToken') resetToken: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<User> {
    return this.authService.resetPassword(
      resetToken,
      resetPasswordDto.password,
    );
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiTags('auth')
  @ApiOperation({ description: 'Check if reset token is still available' })
  @Get('reset-password/:resetToken')
  async checkResetLink(@Param('resetToken') resetToken: string): Promise<User> {
    return this.authService.checkResetLink(resetToken);
  }
}
