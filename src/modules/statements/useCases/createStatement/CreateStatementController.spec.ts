import request from 'supertest';
import { Connection, getConnection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('CreateStatementController', () => {
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

  it('should be able to create a new deposit statement', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    const authentication = await request(app).post('/api/v1/sessions').send({
      email: 'test@email.com',
      password: '123456',
    });

    const { token } = authentication.body;

    const response = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 999.00,
        description: "Salary",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement = response.body;

    expect(response.status).toBe(201);
    expect(statement).toHaveProperty('id');
    expect(statement.amount).toBe(999.00);
    expect(statement.type).toBe('deposit');
  });

  it('should be able to create a new withdrawal statement', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    const authentication = await request(app).post('/api/v1/sessions').send({
      email: 'test@email.com',
      password: '123456',
    });

    const { token } = authentication.body;

    await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 999.00,
        description: "Salary",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 50.00,
        description: "Food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement = response.body;

    expect(response.status).toBe(201);
    expect(statement).toHaveProperty('id');
    expect(statement.amount).toBe(50.00);
    expect(statement.type).toBe('withdraw');
  });

  it('should not be able to create a new withdrawal statement if there is not enough money', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'Test user',
      email: 'test@email.com',
      password: '123456',
    });

    const authentication = await request(app).post('/api/v1/sessions').send({
      email: 'test@email.com',
      password: '123456',
    });

    const { token } = authentication.body;

    const response = await request(app).post('/api/v1/statements/withdraw')
      .send({
        amount: 50.00,
        description: "Food",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });
});
