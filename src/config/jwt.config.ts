import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || '4E5d8e58E878d95',
  signOptions: { expiresIn: '2h' },
}));
