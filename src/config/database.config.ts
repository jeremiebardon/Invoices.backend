import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrationsTableName: 'custom_migration_table',
  migrations: ['migration/*.{.ts,.js}'],
  cli: {
    migrationsDir: 'migration',
  },
  autoLoadEntities: true,
  synchronize: true,
}));
