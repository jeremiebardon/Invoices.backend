import { registerAs } from '@nestjs/config';

export default registerAs('client', () => ({
  url: process.env.FRONTEND_URL || 'http://localhost:4200',
}));
