import request from "supertest";
import { describe, expect, jest } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import app from "../../index.js";

const mockPrisma = {
  transactions: {
    findMany: jest.fn(),
  },
};

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('GET /api/v1/transactions', () => {
    afterEach(() => {
        jest.clearAllMocks(); // clear mocks between tests
    });
    it('should show all transactions', async () => {
        const res = await request(app).get('/api/v1/transactions')

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
    });
});