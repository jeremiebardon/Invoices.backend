import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@auth/controllers/auth.controller';
import { AuthService } from '@auth/services/auth.service';
import { createMockAuthService } from '@auth/services/auth.service.mocks';
import { User } from '@users/models/user.entity';
import { Request } from 'express';
import { CreateUserDto } from '@auth/dto/create-user.dto';
import { ForgetPasswordDto } from '@auth/dto/forget-password.dto';
import { ResetPasswordDto } from '@auth/dto/reset-password.dto';

const user = {
  id: 1,
  email: 'email@email.com',
  password: 'password',
  isActive: true,
} as any as User;

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AuthService, useValue: createMockAuthService() }],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('.login', () => {
    const request = {
      user: { email: 'email@email.com', password: 'password' },
    } as any as Request;

    it('should login user', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(user);
      const result = await controller.login(request);

      expect(result).toEqual(user);
    });
  });

  describe('.me', () => {
    const request = {
      user: { id: 1, email: 'email@email.com', password: 'password' },
    } as any as Request;
    it('should login user', async () => {
      jest.spyOn(authService, 'me').mockResolvedValue(user);

      const result = await controller.me(request);

      expect(result).toEqual(user);
    });
  });

  describe('.register', () => {
    it('should register user', async () => {
      const registerDto = new CreateUserDto();
      jest.spyOn(authService, 'register').mockResolvedValue(user);

      await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('.resendConfirm', () => {
    it('should resend confirm email', async () => {
      const email = 'email@email.com';
      jest.spyOn(authService, 'resendConfirm').mockResolvedValue(user);

      await controller.resendConfirm(email);

      expect(authService.resendConfirm).toHaveBeenCalledWith(email);
    });
  });

  describe('.confirm', () => {
    it('should confirm user', async () => {
      const token = 'email@email.com';
      jest.spyOn(authService, 'resendConfirm').mockResolvedValue(user);

      await controller.confirm(token);

      expect(authService.confirmUser).toHaveBeenCalledWith(token);
    });
  });

  describe('.forgetPassword', () => {
    it('should send forget email password', async () => {
      const forgotDto = new ForgetPasswordDto();
      jest.spyOn(authService, 'forgotPassword').mockResolvedValue(user);

      await controller.forgotPassword(forgotDto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotDto.email);
    });
  });

  describe('.resetPassword', () => {
    it('should send reset password password', async () => {
      const param = 'reset token';
      const body = new ResetPasswordDto();
      jest.spyOn(authService, 'resetPassword').mockResolvedValue(user);

      await controller.resetPassword(param, body);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        'reset token',
        body.password,
      );
    });
  });

  describe('.checkResetLink', () => {
    it('should send reset password password', async () => {
      const token = 'Tolkien';
      jest.spyOn(authService, 'checkResetLink').mockResolvedValue(user);

      await controller.checkResetLink(token);

      expect(authService.checkResetLink).toHaveBeenCalledWith('Tolkien');
    });
  });
});
