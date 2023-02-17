import request from 'supertest';
import { Connection, getConnection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('ShowUserProfileController', () => {
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

  it('should be able to show logged in user profile', async () => {
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

    const profile = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(profile.status).toBe(200);
    expect(profile.body).toHaveProperty('id');
    expect(profile.body.email).toBe('test@email.com');
  });
});
