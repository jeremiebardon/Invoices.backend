import { MockType } from '@shared/mocks/mockType.mocks';

export const createMockAuthService = (): MockType<any> => ({
  validateUser: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  confirmUser: jest.fn(),
  resendConfirm: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  checkResetLink: jest.fn(),
  me: jest.fn(),
});
