import request from 'supertest';
import { expect, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import app from '../../index.js';
import { faker } from '@faker-js/faker';

const bankAccNumber = faker.finance.accountNumber(15)

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
    bank_account_number: '111111222222',
    balance: 5000.00
  };

  const mockAccountSuccess = {
    user_id: 1,
    bank_name: 'BRI',
    bank_account_number: bankAccNumber,
    balance: 5000.00
  };

  const mockAccountBalanceNaN = {
    user_id: 1,
    bank_name: 'BRI',
    bank_account_number: bankAccNumber,
    balance: "5000zzz"
  };
  
  const mockAccountBalanceNegative = {
    user_id: 1,
    bank_name: 'BRI',
    bank_account_number: bankAccNumber,
    balance: -5000.00
  };

  const mockAccountInvalidUserId = {
    user_id: 1111,
    bank_name: 'BRI',
    bank_account_number: '5562623623623',
    balance: 5000.00
  };

  it('should add a new account successfully', async () => {

  const res = await request(app).post('/api/v1/accounts').send(mockAccountSuccess);

  console.log(res.body); // Debug response

  expect(res.statusCode).toBe(201); // Ensure correct status code
  expect(res.body.status).toBe('success'); // Validate response status
});


  it('should return 400 if validation fails', async () => {
    const invalidAccount = { bank_name: '' }; // Invalid input

    const res = await request(app).post('/api/v1/accounts').send(invalidAccount);

    console.log(res.body)

    expect(res.statusCode).toBe(400);
  });

  it('should return 409 if bank account number is already taken', async () => {
    mockPrisma.account.create.mockRejectedValueOnce({ code: 'P2002' }); // Simulate conflict error

    const res = await request(app).post('/api/v1/accounts').send(mockAccount409);

    console.log(res.body)

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe(`Bank account number ${mockAccount409.bank_account_number} has already taken`);
  });

  it('should return 400 NaN balance', async () => {
    
    const res = await request(app).post('/api/v1/accounts').send(mockAccountBalanceNaN);

    console.log(res.body)

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Balance must be a positive number");
  })

  it('should return 400 negative balance', async () => {
    
    const res = await request(app).post('/api/v1/accounts').send(mockAccountBalanceNegative);

    console.log(res.body)

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Balance must be a positive number");
  })

  it('should return 409 user id not found', async () => {
    mockPrisma.account.create.mockRejectedValueOnce({ code: 'P2003' }); // Simulate conflict error

    const res = await request(app).post('/api/v1/accounts').send(mockAccountInvalidUserId);

    console.log(res.body)

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe(`No user with user_id ${mockAccountInvalidUserId.user_id}`);
  });
});
