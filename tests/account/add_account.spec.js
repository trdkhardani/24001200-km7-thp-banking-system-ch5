import request from 'supertest';
import { jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import app from '../../index.js';

const mockPrisma = {
  account: {
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('POST /api/v1/accounts', () => {
  const mockAccount409 = {
    user_id: 1,
    bank_name: 'BNI',
    bank_account_number: '1234567891112',
    balance: 5000.00
  };

  const mockAccountSuccess = {
    user_id: 1,
    bank_name: 'BRI',
    bank_account_number: '12345678911120',
    balance: 5000.00
  };

  it('should add a new account successfully', async () => {

  const res = await request(app).post('/api/v1/accounts').send(mockAccountSuccess);

  console.log(res.body); // Debug response

  expect(res.statusCode).toBe(201); // Ensure correct status code
//   expect(res.body.status).toBe('success'); // Validate response status
//   expect(bcrypt.hash).toHaveBeenCalledWith(mockUserSuccess.password, 10);
});


  it('should return 400 if validation fails', async () => {
    const invalidAccount = { bank_name: '' }; // Invalid input

    const res = await request(app).post('/api/v1/accounts').send(invalidAccount);

    expect(res.statusCode).toBe(400);
  });

  it('should return 409 if bank account number is already taken', async () => {
    mockPrisma.account.create.mockRejectedValueOnce({ code: 'P2002' }); // Simulate conflict error

    const res = await request(app).post('/api/v1/accounts').send(mockAccount409);

    expect(res.statusCode).toBe(409);
    // expect(res.body.message).toBe('Email has already been taken');
  });
});
