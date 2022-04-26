import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '@users/models/user.entity';

import { SendgridService } from '@mailer/services/sendgrid.service';
import { AuthService } from '@auth/services/auth.service';
import { JwtService } from '@nestjs/jwt';

import { createMockSendgrid } from '@mailer/services/sendgrid.service.mocks';
import {
  createMockRepository,
  MockRepository,
} from '@shared/mocks/repository.mocks';
import { createMockJwt } from '@shared/mocks/jwt.mocks';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { authErrors } from '@shared/errors/business-errors/auth.errors';
import { userErrors } from '@shared/errors/business-errors/user.errors';
import ConnectionMock from '@shared/mocks/connection.mocks';

const user = {
  id: 1,
  email: 'email@email.com',
  password: 'password',
  isActive: true,
} as any as User;

describe('AuthService', () => {
  let service: AuthService;
  let sendgridService: SendgridService;
  let connection: Connection;
  let jwtService: JwtService;
  let userRepository: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: createMockJwt() },
        { provide: SendgridService, useValue: createMockSendgrid() },
        { provide: Connection, useClass: ConnectionMock },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<MockRepository>(getRepositoryToken(User));
    sendgridService = module.get<SendgridService>(SendgridService);
    connection = module.get<Connection>(Connection);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('.validateUser', () => {
    it('should return user if password is valid', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      userRepository.findOne.mockReturnValue(user);

      const validateUser = await service.validateUser(
        'email@gmail.com',
        'password',
      );

      expect(validateUser).toEqual(user);
    });

    it('should throw exception if compare password is invalid', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);
      userRepository.findOne.mockReturnValue(user);

      try {
        await service.validateUser('email@gmail.com', 'password');
      } catch (err) {
        expect(err).toBeInstanceOf(UnprocessableEntityException);
        expect(err.response).toEqual(authErrors.InvalidCredentials);
      }
    });

    it('should throw exception if user does not exist', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

      userRepository.findOne.mockReturnValue(null);

      try {
        await service.validateUser('email@gmail.com', 'password');
      } catch (err) {
        expect(err).toBeInstanceOf(UnprocessableEntityException);
        expect(err.response).toEqual(authErrors.InvalidCredentials);
      }
    });

    it('should throw exception if user is not active', async () => {
      const inactiveUser = { ...user, isActive: false };

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      userRepository.findOne.mockReturnValue(inactiveUser);

      try {
        await service.validateUser('email@gmail.com', 'password');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.response).toEqual(authErrors.NotActive);
      }
    });
  });

  describe('.login', () => {
    it('should sign user in', async () => {
      jest.spyOn(jwtService, 'sign').mockImplementation(() => 'token');
      const response = await service.login(user);

      expect(response).toEqual({ ...user, token: 'token' });
    });
  });

  describe('.register', () => {
    describe('when user is created', () => {
      beforeEach(() => {
        jest.spyOn(bcrypt, 'hashSync').mockImplementation(() => 'myHash');
      });

      it('should create an user', async () => {
        const queryRunner = connection.createQueryRunner();
        const createdUser = {
          email: 'email@email.com',
          firstName: 'User',
          lastName: 'Last',
          password: 'password',
        };

        jest
          .spyOn(queryRunner.manager, 'save')
          .mockResolvedValueOnce(createdUser);

        const register = await service.register(createdUser);

        expect(register).toEqual(createdUser);
        expect(queryRunner.release).toHaveBeenCalled();
      });

      it('should send an email when user is created', async () => {
        const queryRunner = connection.createQueryRunner();
        const createdUser = {
          email: 'email@email.com',
          firstName: 'User',
          lastName: 'Last',
          password: 'password',
        };

        jest.spyOn(sendgridService, 'sendConfirmEmail');
        jest
          .spyOn(queryRunner.manager, 'save')
          .mockResolvedValueOnce(createdUser);

        await service.register(createdUser);

        expect(sendgridService.sendConfirmEmail).toHaveBeenCalled();
      });

      it('should rollback if error append', async () => {
        const queryRunner = connection.createQueryRunner();
        const createdUser = {
          email: 'email@email.com',
          firstName: 'User',
          lastName: 'Last',
          password: 'password',
        };

        jest.spyOn(queryRunner.manager, 'save').mockRejectedValueOnce('error');

        try {
          await service.register(createdUser);
        } catch (err) {
          expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
          expect(err).toBeInstanceOf(InternalServerErrorException);
        }
      });
    });
  });

  describe('.confirmUser', () => {
    it('should throw not found exception if user does not exist', async () => {
      userRepository.findOne.mockReturnValue(null);

      try {
        await service.confirmUser('token');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.response).toEqual(userErrors.NotFound);
      }
    });

    it('should throw unprocessable entity exception if user is active', async () => {
      userRepository.findOne.mockReturnValue(user);

      try {
        await service.confirmUser('token');
      } catch (err) {
        expect(err).toBeInstanceOf(UnprocessableEntityException);
        expect(err.response).toEqual(userErrors.AlreadyConfirmed);
      }
    });

    it('should throw forbidden exception if user is active', async () => {
      const confirmAccountExpired = new Date(Date.now() - 1);

      const inactiveUser = {
        ...user,
        isActive: false,
        confirmAccountExpired,
      };

      userRepository.findOne.mockReturnValue(inactiveUser);

      try {
        await service.confirmUser('token');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.response).toEqual(authErrors.ConfirmTokenExpire);
      }
    });

    it('should update user infos', async () => {
      const confirmAccountExpired = new Date(Date.now() + 1);

      const inactiveUser = {
        ...user,
        isActive: false,
        confirmAccountExpired,
      };

      const updatedUser = {
        ...user,
        isActive: true,
        confirmAccountExpired,
      };

      userRepository.findOne.mockReturnValue(inactiveUser);
      userRepository.save.mockReturnValue(updatedUser);

      const result = await service.confirmUser('token');

      expect(result).toEqual(updatedUser);
    });
  });

  describe('.resendConfirm', () => {
    it('should not send if user does not exist', async () => {
      userRepository.findOne.mockReturnValue(null);

      try {
        await service.resendConfirm('email@email.com');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.response).toEqual(userErrors.NotFound);
      }
    });

    it('should not send if user is already active', async () => {
      userRepository.findOne.mockReturnValue(user);

      try {
        await service.resendConfirm('email@email.com');
      } catch (err) {
        expect(err).toBeInstanceOf(UnprocessableEntityException);
        expect(err.response).toEqual(userErrors.AlreadyConfirmed);
      }
    });

    it('should call send confirm email ', async () => {
      const inactiveUser = {
        ...user,
        isActive: false,
      };

      const savedUser = {
        ...user,
        confirmAccountToken: 'IksuwHms9',
        confirmAccountExpired: new Date(Date.now() + 1),
      };

      userRepository.findOne.mockReturnValue(inactiveUser);
      userRepository.save.mockReturnValue(savedUser);

      await service.resendConfirm('email@email.com');

      expect(sendgridService.sendConfirmEmail).toHaveBeenCalledWith(
        savedUser.email,
        'IksuwHms9',
      );
    });

    it('should save user', async () => {
      const inactiveUser = {
        ...user,
        isActive: false,
      };

      const savedUser = {
        ...user,
        confirmAccountToken: 'IksuwHms9',
        confirmAccountExpired: new Date(Date.now() + 1),
      };

      userRepository.findOne.mockReturnValue(inactiveUser);
      userRepository.save.mockReturnValue(savedUser);

      const result = await service.resendConfirm('email@email.com');

      expect(result).toEqual(savedUser);
    });
  });

  describe('.forgotPassword', () => {
    it('should not send if user does not exist', async () => {
      userRepository.findOne.mockReturnValue(null);

      try {
        await service.forgotPassword('email@email.com');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.response).toEqual(userErrors.NotFound);
      }
    });

    it('should call send reset password ', async () => {
      const inactiveUser = {
        ...user,
        isActive: false,
      };

      const savedUser = {
        ...user,
        resetToken: 'IksuwHms9',
        resetPasswordExpires: new Date(Date.now() + 1),
      };

      userRepository.findOne.mockReturnValue(inactiveUser);
      userRepository.save.mockReturnValue(savedUser);

      await service.forgotPassword('email@email.com');

      expect(sendgridService.sendResetEmail).toHaveBeenCalledWith(
        savedUser.email,
        'IksuwHms9',
      );
    });

    it('should save user', async () => {
      const inactiveUser = {
        ...user,
        isActive: false,
      };

      const savedUser = {
        ...user,
        resetToken: 'IksuwHms9',
        resetPasswordExpires: new Date(Date.now() + 1),
      };

      userRepository.findOne.mockReturnValue(inactiveUser);
      userRepository.save.mockReturnValue(savedUser);

      const result = await service.forgotPassword('email@email.com');

      expect(result).toEqual(savedUser);
    });
  });

  describe('.resetPassword', () => {
    it('should not reset password if user does not exist', async () => {
      jest.spyOn(service, 'checkResetLink').mockImplementation(() => null);

      try {
        await service.resetPassword('reset token', 'new password');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.response).toEqual(userErrors.NotFound);
      }
    });

    it('should call save user', async () => {
      jest.spyOn(service, 'checkResetLink').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue('New password');

      const newUser = {
        id: 1,
        password: 'New password',
        resetPasswordExpires: new Date(Date.now()),
      };

      await service.resetPassword('reset token', 'new password');

      expect(userRepository.save).toHaveBeenCalledWith(newUser);
    });
  });

  describe('.checkResetLink', () => {
    it('should throw not found exception if user does not exist', async () => {
      userRepository.findOne.mockReturnValue(null);

      try {
        await service.checkResetLink('reset token');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.response).toEqual(userErrors.NotFound);
      }
    });

    it('should throw unproceszable entity if reset password token is expired', async () => {
      const activeUser = {
        ...user,
        resetPasswordExpires: new Date(Date.now() - 2),
      };

      userRepository.findOne.mockReturnValue(activeUser);

      try {
        await service.checkResetLink('reset token');
      } catch (err) {
        expect(err).toBeInstanceOf(UnprocessableEntityException);
        expect(err.response).toEqual(authErrors.ResetTokenExpire);
      }
    });

    it('should return user', async () => {
      const activeUser = {
        ...user,
        resetPasswordExpires: new Date(Date.now() + 1),
      };

      userRepository.findOne.mockReturnValue(activeUser);

      const result = await service.checkResetLink('reset token');

      expect(result).toEqual(activeUser);
    });
  });

  describe('.me', () => {
    it('should return my profile', async () => {
      userRepository.findOne.mockReturnValue(user);

      const result = await service.me(user);

      expect(result).toEqual(user);
    });
  });
});
