import request from 'supertest';
import { describe, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import app from '../../index.js';

const mockPrisma = {
  transaction: {
    create: jest.fn(),
  },
  account: {
    update: jest.fn(),
  }
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('POST /api/v1/transactions', () => {
    const mockTransactionSuccess = {
        source_account_id: 1,
        destination_account_id: 2,
        amount: 1000
    }

    const mockTransactionInvalidSource = {
        source_account_id: 1111,
        destination_account_id: 1,
        amount: 1000
    }

    const mockTransactionInvalidDest = {
        source_account_id: 1,
        destination_account_id: 1111,
        amount: 1000
    }
    
    const mockTransactionSameAccId = {
        source_account_id: 1,
        destination_account_id: 1,
        amount: 1000
    }

    const mockTransactionInsuffBal = {
        source_account_id: 2,
        destination_account_id: 1,
        amount: 1000000
    }


    it('should add a new transaction and updated balance of each accounts', async () => {
        const res = await request(app).post('/api/v1/transactions').send(mockTransactionSuccess)

        expect(res.statusCode).toBe(201);
    })

    it('should return 409 invalid source account id', async () => {
        const res = await request(app).post('/api/v1/transactions').send(mockTransactionInvalidSource)

        expect(res.statusCode).toBe(409);
        expect(res.body.status).toBe('failed');
        expect(res.body.message).toBe(`Invalid account id`);
    })

    it('should return 409 invalid destination account id', async () => {
        const res = await request(app).post('/api/v1/transactions').send(mockTransactionInvalidDest)

        expect(res.statusCode).toBe(409);
        expect(res.body.status).toBe('failed');
        expect(res.body.message).toBe(`Invalid account id`);
    })

    it('should return 409 same account id', async () => {
        const res = await request(app).post('/api/v1/transactions').send(mockTransactionSameAccId)

        expect(res.statusCode).toBe(409);
        expect(res.body.status).toBe('failed');
        expect(res.body.message).toBe(`Cannot do transaction between same account`);
    })

    it('should return 409 insufficient balance from source account', async () => {
        const res = await request(app).post('/api/v1/transactions').send(mockTransactionInsuffBal)

        expect(res.statusCode).toBe(409);
        expect(res.body.status).toBe('failed');
        expect(res.body.message).toBe(`Insufficient balance`);
    })
})