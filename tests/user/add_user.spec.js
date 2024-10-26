import request from 'supertest';
import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import app from '../../index.js';

const mockPrisma = {
  user: {
    create: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('POST /api/v1/users', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    identity_type: 'ID_CARD',
    identity_number: '123456789',
    address: '123 Test Street',
  };

  const mockUserSuccess = {
    name: 'John Doe',
    email: 'john_stavolz@example.com',
    password: 'john123',
    identity_type: 'PASSPORT',
    identity_number: '676767312',
    address: '123 Test Street',
  };

  it('should register a new user successfully', async () => {

  const res = await request(app).post('/api/v1/users').send(mockUserSuccess);

  console.log(res.body); // Debug response

  expect(res.statusCode).toBe(201); // Ensure correct status code
//   expect(res.body.status).toBe('success'); // Validate response status
//   expect(bcrypt.hash).toHaveBeenCalledWith(mockUserSuccess.password, 10);
});


  it('should return 400 if validation fails', async () => {
    const invalidUser = { email: '' }; // Invalid input

    const res = await request(app).post('/api/v1/users').send(invalidUser);

    expect(res.statusCode).toBe(400);
  });

  it('should return 409 if email is already taken', async () => {
    mockPrisma.user.create.mockRejectedValueOnce({ code: 'P2002' }); // Simulate conflict error

    const res = await request(app).post('/api/v1/users').send(mockUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Email has already been taken');
  });
});
