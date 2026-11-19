import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';

const app = createApp();

describe('GET /api/health', () => {
  it('trả về ok khi DB kết nối được', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', db: 'up' });
  });

  it('404 cho endpoint không tồn tại', async () => {
    const res = await request(app).get('/api/khong-co');
    expect(res.status).toBe(404);
  });
});
