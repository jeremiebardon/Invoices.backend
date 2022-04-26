import { Test, TestingModule } from '@nestjs/testing';

import { SendgridService } from '@mailer/services/sendgrid.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { createMockConfigService } from '@shared/mocks/config.mocks';
import { InternalServerErrorException } from '@nestjs/common';
import { sendgridErrors } from '@shared/errors/business-errors/sendgrid.errors';

describe('AuthService', () => {
  let service: SendgridService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendgridService,
        { provide: ConfigService, useValue: createMockConfigService() },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(() => of(null)),
          },
        },
      ],
    }).compile();

    service = module.get<SendgridService>(SendgridService);
    configService = module.get<ConfigService>(ConfigService);
  });

  const sendMailFunction = jest.spyOn(
    SendgridService.prototype as any,
    'sendMail',
  );

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  beforeEach(() => {
    jest.spyOn(configService, 'get').mockImplementation(() => 'CLIENT-URL');
  });

  describe('.sendConfirmEmail', () => {
    it('should send email', async () => {
      sendMailFunction.mockImplementation(() => ({}));
      await service.sendConfirmEmail('user@gmail.com', 'token');

      expect(sendMailFunction).toHaveBeenCalledWith(
        'confirm',
        ['user@gmail.com'],
        {
          confirmAccountTokenUrl: 'CLIENT-URL/confirm-account/token',
        },
      );
    });

    it('should throw an error', async () => {
      sendMailFunction.mockRejectedValue(() => 'error');

      try {
        await service.sendConfirmEmail('user@gmail.com', 'token');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(err.response).toEqual(sendgridErrors.CannotSendConfirmEmail);
      }
    });
  });

  describe('.sendResetEmail', () => {
    it('should send reset', async () => {
      sendMailFunction.mockImplementation(() => true);
      await service.sendResetEmail('user@gmail.com', 'token');

      expect(sendMailFunction).toHaveBeenCalledWith(
        'reset',
        ['user@gmail.com'],
        {
          resetTokenUrl: 'CLIENT-URL/reset-password/token',
        },
      );
    });

    it('should throw an error', async () => {
      sendMailFunction.mockRejectedValue(() => 'error');

      try {
        await service.sendResetEmail('user@gmail.com', 'token');
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
        expect(err.response).toEqual(sendgridErrors.CannotSendResetTokenEmail);
      }
    });
  });
});
