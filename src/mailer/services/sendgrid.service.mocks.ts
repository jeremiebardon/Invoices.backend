import { MockType } from '@shared/mocks/mockType.mocks';

export const createMockSendgrid = (): MockType<any> => ({
  sendConfirmEmail: jest.fn(),
  sendResetEmail: jest.fn(),
  // ...
});
