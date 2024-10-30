import request from 'supertest';
import { describe, expect, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import app from '../../index.js';

const mockPrisma = {
  account: {
    delete: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('DELETE /api/v1/accounts/{accountId}', () => {
  afterEach(() => {
    jest.clearAllMocks(); // clear mocks between tests
  });

  
  it('should delete a specific account', async () => {
    
    const res = await request(app).delete('/api/v1/accounts/3');
    
    console.log(res.body)
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });
  
  it('should show 404 not found', async () => {
    mockPrisma.account.delete.mockRejectedValueOnce({ code: 'P2025' }); // Simulate conflict error
    
    const invalidAccId = 1000;
    const res = await request(app).delete(`/api/v1/accounts/${invalidAccId}`);
    
    console.log(res.body)

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe(`Account with id ${invalidAccId} not found`);
  });
});
