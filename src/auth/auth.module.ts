import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from '@auth/services/auth.service';

import { UsersModule } from '@users/users.module';
import { MailerModule } from '@mailer/mailer.module';

import { AuthController } from '@auth/controllers/auth.controller';

import { LocalStrategy } from '@auth/strategy/local.strategy';
import { JwtStrategy } from '@auth/strategy/jwt.strategy';

import { User } from '@users/models/user.entity';
import { SharedModule } from '@shared/shared.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    MailerModule,
    SharedModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('jwt'),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
