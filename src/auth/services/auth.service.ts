import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { Connection, Repository } from 'typeorm';

import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from '@auth/dto/create-user.dto';

import { User } from '@users/models/user.entity';
import { Profile } from '@profile/models/profile.entity';

import { SendgridService } from '@mailer/services/sendgrid.service';

import { CONFIRM_TOKEN_EXPIRE, RESET_TOKEN_EXPIRE } from '@auth/auth.config';

import { authErrors } from '@shared/errors/business-errors/auth.errors';
import { userErrors } from '@shared/errors/business-errors/user.errors';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private sendgridService: SendgridService,
    private connection: Connection,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });
    const credentials = await bcrypt.compare(pass, user?.password);

    if (!credentials || !user) {
      throw new UnprocessableEntityException(authErrors.InvalidCredentials);
    }

    if (!user.isActive) {
      throw new ForbiddenException(authErrors.NotActive);
    }

    return user;
  }

  async login(user: User): Promise<User> {
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return { ...user, token } as any as User;
  }

  async register(userData: CreateUserDto): Promise<User> {
    const { password, email, firstName, lastName } = userData;
    const queryRunner = this.connection.createQueryRunner();

    const findUser = await this.userRepository.findOne({ email });

    if (findUser) {
      throw new UnprocessableEntityException(authErrors.AlreadyExist);
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashedPassword = bcrypt.hashSync(password, 15);
      const confirmAccountToken = randomBytes(48).toString('hex');
      const confirmAccountExpired = new Date(Date.now() + CONFIRM_TOKEN_EXPIRE);

      const user = await queryRunner.manager.save(User, {
        password: hashedPassword,
        email,
        confirmAccountToken,
        confirmAccountExpired,
      });

      await queryRunner.manager.save(Profile, {
        user: user,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
      });

      await this.sendgridService.sendConfirmEmail(email, confirmAccountToken);
      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  async confirmUser(confirmAccountToken: string): Promise<User> {
    const user = await this.userRepository.findOne({ confirmAccountToken });

    if (!user) {
      throw new NotFoundException(userErrors.NotFound);
    }

    if (user.isActive) {
      throw new UnprocessableEntityException(userErrors.AlreadyConfirmed);
    }

    const dateNow = new Date().getTime();
    const expiresTokenDate = user.confirmAccountExpired.getTime();

    if (expiresTokenDate < dateNow) {
      throw new ForbiddenException(authErrors.ConfirmTokenExpire);
    }

    const updatedUser = await this.userRepository.save({
      id: user.id,
      isActive: true,
      confirmAccountExpired: new Date(Date.now()),
    });

    return updatedUser;
  }

  async resendConfirm(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException(userErrors.NotFound);
    }

    if (user.isActive) {
      throw new UnprocessableEntityException(userErrors.AlreadyConfirmed);
    }

    const confirmAccountToken = randomBytes(48).toString('hex');
    const confirmAccountExpired = new Date(Date.now() + CONFIRM_TOKEN_EXPIRE);

    const updatedUser = await this.userRepository.save({
      id: user.id,
      confirmAccountToken,
      confirmAccountExpired,
    });

    await this.sendgridService.sendConfirmEmail(
      user.email,
      updatedUser.confirmAccountToken,
    );

    return updatedUser;
  }

  async forgotPassword(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new NotFoundException(userErrors.NotFound);
    }

    const resetToken = randomBytes(48).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRE);

    const updatedUser = await this.userRepository.save({
      id: user.id,
      resetToken,
      resetPasswordExpires,
    });

    this.sendgridService.sendResetEmail(
      updatedUser.email,
      updatedUser.resetToken,
    );

    return updatedUser;
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<User> {
    const user = await this.checkResetLink(resetToken);

    if (!user) {
      throw new NotFoundException(userErrors.NotFound);
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 15);

    await this.userRepository.save({
      id: user.id,
      password: hashedPassword,
      resetPasswordExpires: new Date(Date.now()),
    });

    return user;
  }

  async checkResetLink(resetToken: string): Promise<User> {
    const user = await this.userRepository.findOne({ resetToken });

    if (!user) {
      throw new NotFoundException(userErrors.NotFound);
    }

    const dateNow = new Date().getTime();
    const resetPasswordExpiresDate = user.resetPasswordExpires.getTime();

    if (resetPasswordExpiresDate < dateNow) {
      throw new UnprocessableEntityException(authErrors.ResetTokenExpire);
    }

    return user;
  }

  async me(user: User): Promise<User> {
    return await this.userRepository.findOne(user.id);
  }
}
