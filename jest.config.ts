import type { Config } from '@jest/types';

import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config.InitialOptions = {
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePathIgnorePatterns: ['main.ts'],
  rootDir: './',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '<rootDir>/**/*.ts',
    '!<rootDir>/**/*.module.ts',
    '!<rootDir>/**/*.strategy.ts',
    '!<rootDir>/**/*.mocks.ts',
    '!<rootDir>/**/*.dto.ts',
    '!<rootDir>/**/*.entity.ts',
    '!<rootDir>/**/*.config.ts',
    '!<rootDir>/shared/errors/business-errors/**/*',
  ],
  moduleNameMapper: pathsToModuleNameMapper(
    {
      '@auth/*': ['src/auth/*'],
      '@config/*': ['src/config/*'],
      '@shared/*': ['src/shared/*'],
      '@users/*': ['src/users/*'],
      '@mailer/*': ['src/mailer/*'],
      '@profile/*': ['src/profile/*'],
    },
    {
      prefix: '<rootDir>/',
    },
  ),
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],
};

export default config;
