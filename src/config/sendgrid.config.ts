import { registerAs } from '@nestjs/config';

export default registerAs('sendgrid', () => ({
  apiKey: process.env.SENDGRID_API_KEY,
  confirmTemplate: process.env.SENDGRID_CONFIRM_ACCOUNT_TEMPLATE,
  resetTemplate: process.env.SENDGRID_RESET_PASSWORD_TEMPLATE,
}));
