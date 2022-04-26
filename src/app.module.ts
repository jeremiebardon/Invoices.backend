// Nest
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { MailerModule } from './mailer/mailer.module';
import { SharedModule } from './shared/shared.module';

// Config
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import serverConfig from './config/server.config';
import sendgridConfig from './config/sendgrid.config';
import clientConfig from './config/client.config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ProfileModule,
    MailerModule,
    ConfigModule.forRoot({
      load: [
        jwtConfig,
        databaseConfig,
        serverConfig,
        sendgridConfig,
        clientConfig,
      ],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database'),
    }),
    SharedModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
