import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SendgridService } from '@mailer/services/sendgrid.service';

@Module({
  imports: [HttpModule],
  providers: [SendgridService],
  exports: [SendgridService],
})
export class MailerModule {}
