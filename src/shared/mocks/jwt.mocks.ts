export const createMockJwt = () => ({
  sign: jest.fn(),
  verify: jest.fn(),
});
