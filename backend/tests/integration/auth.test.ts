import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { resetDb } from '../helpers.js';

const app = createApp();
const account = { email: 'Khach@Test.vn', password: 'Password123!', fullName: 'Khách Hàng' };

describe('Auth API', () => {
  beforeEach(resetDb);

  it('đăng ký thành công, trả token và không lộ passwordHash', async () => {
    const res = await request(app).post('/api/auth/register').send(account);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.email).toBe('khach@test.vn'); // email được lowercase
    expect(res.body.user.role).toBe('USER');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  it('409 khi email đã tồn tại', async () => {
    await request(app).post('/api/auth/register').send(account);
    const res = await request(app).post('/api/auth/register').send(account);
    expect(res.status).toBe(409);
  });

  it('400 khi mật khẩu quá ngắn', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...account, password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toHaveProperty('password');
  });

  it('đăng nhập đúng -> 200, sai mật khẩu -> 401', async () => {
    await request(app).post('/api/auth/register').send(account);
    const ok = await request(app).post('/api/auth/login').send({ email: account.email, password: account.password });
    expect(ok.status).toBe(200);
    const bad = await request(app).post('/api/auth/login').send({ email: account.email, password: 'sai-mat-khau' });
    expect(bad.status).toBe(401);
  });

  it('GET /me cần token hợp lệ', async () => {
    const reg = await request(app).post('/api/auth/register').send(account);
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${reg.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.fullName).toBe(account.fullName);

    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Authorization', 'Bearer abc')).status).toBe(401);
  });
});
