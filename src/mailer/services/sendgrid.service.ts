import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';

import { lastValueFrom } from 'rxjs';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { sendgridErrors } from '@shared/errors/business-errors/sendgrid.errors';

@Injectable()
export class SendgridService {
  private readonly mailTemplate = {
    reset: 'd-49f224d4717c4d04ac0c894c438d6d76',
    confirm: 'd-08b1101406ae402480cd8c27bbf43586',
  };

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async sendConfirmEmail(
    email: string,
    confirmAccountToken: string,
  ): Promise<void> {
    const confirmAccountTokenUrl = `${this.configService.get<string>(
      'client.url',
    )}/confirm-account/${confirmAccountToken}`;

    try {
      await this.sendMail('confirm', [email], {
        confirmAccountTokenUrl,
      });
    } catch (err) {
      throw new InternalServerErrorException(
        sendgridErrors.CannotSendConfirmEmail,
      );
    }
  }

  async sendResetEmail(email: string, resetToken: string): Promise<void> {
    const resetTokenUrl = `${this.configService.get<string>(
      'client.url',
    )}/reset-password/${resetToken}`;

    try {
      await this.sendMail('reset', [email], { resetTokenUrl });
    } catch (err) {
      throw new InternalServerErrorException(
        sendgridErrors.CannotSendResetTokenEmail,
      );
    }
  }

  private async sendMail(
    templateId: string,
    sendTo: string[],
    templateData?: Record<any, unknown>,
    from = 'jerembardon@gmail.com',
  ): Promise<AxiosResponse<any>> {
    const headers = {
      Authorization: `Bearer ${this.configService.get<string>(
        'sendgrid.apiKey',
      )}`,
    };

    const params = {
      from: { email: from },
      template_id: this.mailTemplate[templateId],
      personalizations: [
        {
          to: sendTo.map((to) => ({ email: to })),
          dynamic_template_data: templateData,
        },
      ],
    };

    return await lastValueFrom(
      this.httpService.post('https://api.sendgrid.com/v3/mail/send', params, {
        headers,
      }),
    );
  }
}
