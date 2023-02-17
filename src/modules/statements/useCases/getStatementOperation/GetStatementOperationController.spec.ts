import request from 'supertest';
import { Connection, getConnection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('GetStatementOperationController', () => {
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

  it("should be able to get a user's statement by id", async () => {
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

    const statementResponse = await request(app).post('/api/v1/statements/deposit')
      .send({
        amount: 999.00,
        description: 'Salary',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = statementResponse.body;

    const response = await request(app).get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statement = response.body;

    expect(response.status).toBe(200);
    expect(statement.id).toBe(id);
    expect(statement.amount).toBe('999.00');
    expect(statement.description).toBe('Salary');
    expect(statement.type).toBe('deposit');
  });

  it("should not be able to get a user's nonexistent statement", async () => {
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

    const response = await request(app).get(`/api/v1/statements/952d461f-883e-45f1-b0cb-45c6db34c6db`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(404);
  });
});
