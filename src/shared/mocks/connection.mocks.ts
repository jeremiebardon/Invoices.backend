import { QueryRunner } from 'typeorm';

const qr = {
  manager: {},
} as QueryRunner;

Object.assign(qr.manager, {
  save: jest.fn(),
});

qr.connect = jest.fn();
qr.release = jest.fn();
qr.startTransaction = jest.fn();
qr.commitTransaction = jest.fn();
qr.rollbackTransaction = jest.fn();

class ConnectionMock {
  createQueryRunner(): QueryRunner {
    return qr;
  }
}

export default ConnectionMock;
