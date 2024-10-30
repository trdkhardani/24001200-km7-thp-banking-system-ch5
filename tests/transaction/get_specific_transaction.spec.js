import request from 'supertest';
import { describe, expect, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import app from '../../index.js';

const mockPrisma = {
  transaction: {
    findUnique: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('GET /api/v1/transactions/{transactionId}', () => {
  afterEach(() => {
    jest.clearAllMocks(); // clear mocks between tests
  });

  it('should show specific transaction', async () => {

    const res = await request(app).get('/api/v1/transactions/1');
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('should show 404 not found', async () => {

    const invalidTransactId = 1000
    const res = await request(app).get(`/api/v1/transactions/${invalidTransactId}`);
    
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(`Transaction with id ${invalidTransactId} not found`);
  });
});
