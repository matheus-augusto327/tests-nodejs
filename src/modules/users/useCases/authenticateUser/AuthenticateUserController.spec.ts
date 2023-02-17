import request from 'supertest';
import { Connection, getConnection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('AuthenticateUserController', () => {
  beforeAll(async () => {
    connection = await createConnection('test-connection');

    await connection.query('DROP TABLE IF EXISTS statements');
    await connection.query('DROP TABLE IF EXISTS users');
    await connection.query('DROP TABLE IF EXISTS migrations');

    await connection.runMigrations();
  });

  beforeEach(async () => {
    await connection.query('DELETE FROM statements');
    await connection.query('DELETE FROM users');
  });

  afterAll(async () => {
    const mainConnection = getConnection();

    await connection.close();
    await mainConnection.close();
  });

  it('should be able to authenticate a user', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@email.com',
      password: '123456',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to authenticate inexistent user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@email.com',
      password: '123456',
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to authenticate user with wrong password', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'test@email.com',
      password: '123',
    });

    expect(response.status).toBe(401);
  });
});
