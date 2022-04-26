import { Request, Response } from 'express';

export const createMockJwt = () => ({
  sign: jest.fn(),
  verify: jest.fn(),
});

export const requestMock = {
  query: {},
} as unknown as Request;

export const responseMock = {
  status: jest.fn((x) => x),
  send: jest.fn((x) => x),
} as unknown as Response;
