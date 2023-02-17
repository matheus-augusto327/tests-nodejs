import request from 'supertest';
import { Connection, getConnection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('GetBalanceController', () => {
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

  it("should be able to get a user's balance", async () => {
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

    const response = await request(app).get('/api/v1/statements/balance')
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { statement, balance } = response.body;

    expect(response.status).toBe(200);
    expect(statement.length).toBe(1);
    expect(balance).toBe(999.00);
  });

});
