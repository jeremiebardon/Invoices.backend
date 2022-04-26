export const createMockConfigService = () => ({
  get: jest.fn((key: string) => {
    switch (key) {
      case 'FILES':
        return './fakedata/';
        break;
      case 'PORT':
        return '9999';
        break;
      default:
        return null;
    }
  }),
});
