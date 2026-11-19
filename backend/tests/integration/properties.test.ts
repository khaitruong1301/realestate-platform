import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { createUser, resetDb, validProperty } from '../helpers.js';

const app = createApp();
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('Properties API', () => {
  beforeEach(resetDb);

  describe('POST /api/properties', () => {
    it('AGENT tạo tin thành công, price/area là number, có slug', async () => {
      const { token } = await createUser('AGENT');
      const res = await request(app).post('/api/properties').set(auth(token)).send(validProperty);
      expect(res.status).toBe(201);
      expect(res.body.price).toBe(3_500_000_000);
      expect(res.body.area).toBe(70.5);
      expect(res.body.slug).toMatch(/^can-ho-2-phong-ngu-quan-7/);
      expect(res.body.images).toHaveLength(1);
    });

    it('401 khi chưa đăng nhập, 403 khi là USER', async () => {
      expect((await request(app).post('/api/properties').send(validProperty)).status).toBe(401);
      const { token } = await createUser('USER');
      expect((await request(app).post('/api/properties').set(auth(token)).send(validProperty)).status).toBe(403);
    });

    it('400 khi dữ liệu sai (giá âm, thiếu title)', async () => {
      const { token } = await createUser('AGENT');
      const { title: _t, ...noTitle } = validProperty;
      const res = await request(app).post('/api/properties').set(auth(token)).send({ ...noTitle, price: -1 });
      expect(res.status).toBe(400);
      expect(res.body.error.details).toHaveProperty('title');
      expect(res.body.error.details).toHaveProperty('price');
    });
  });

  describe('GET /api/properties', () => {
    beforeEach(async () => {
      const { token } = await createUser('AGENT');
      const items = [
        { ...validProperty, title: 'Căn hộ giá rẻ Quận 7 cho gia đình', price: 2e9 },
        { ...validProperty, title: 'Nhà phố Phú Nhuận 4 tầng mặt tiền', type: 'HOUSE', price: 12e9, district: 'Phú Nhuận' },
        { ...validProperty, title: 'Cho thuê căn hộ studio Quận 7 rẻ', listingType: 'RENT', price: 9e6 },
        { ...validProperty, title: 'Tin nháp chưa đăng không được hiện', status: 'DRAFT' },
      ];
      for (const p of items) await request(app).post('/api/properties').set(auth(token)).send(p);
    });

    it('chỉ trả tin PUBLISHED kèm phân trang', async () => {
      const res = await request(app).get('/api/properties');
      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(3);
      expect(res.body.pagination).toEqual({ page: 1, limit: 12, total: 3, totalPages: 1 });
    });

    it('lọc theo listingType, type, khoảng giá', async () => {
      expect((await request(app).get('/api/properties?listingType=RENT')).body.items).toHaveLength(1);
      expect((await request(app).get('/api/properties?type=HOUSE')).body.items).toHaveLength(1);
      const range = await request(app).get('/api/properties?listingType=SALE&minPrice=1000000000&maxPrice=5000000000');
      expect(range.body.items).toHaveLength(1);
      expect(range.body.items[0].price).toBe(2e9);
    });

    it('tìm theo từ khoá không phân biệt hoa thường', async () => {
      const res = await request(app).get('/api/properties').query({ q: 'phú nhuận' });
      expect(res.body.items).toHaveLength(1);
    });

    it('sắp xếp giá tăng dần', async () => {
      const prices = (await request(app).get('/api/properties?sort=price_asc')).body.items.map(
        (p: { price: number }) => p.price,
      );
      expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b));
    });

    it('400 khi minPrice > maxPrice', async () => {
      expect((await request(app).get('/api/properties?minPrice=10&maxPrice=1')).status).toBe(400);
    });
  });

  describe('GET / PATCH / DELETE /api/properties/:id', () => {
    it('xem chi tiết theo id hoặc slug, 404 khi không có', async () => {
      const { token } = await createUser('AGENT');
      const created = (await request(app).post('/api/properties').set(auth(token)).send(validProperty)).body;
      const byId = await request(app).get(`/api/properties/${created.id}`);
      expect(byId.status).toBe(200);
      expect(byId.body.agent).toHaveProperty('fullName');
      expect((await request(app).get(`/api/properties/${created.slug}`)).status).toBe(200);
      expect((await request(app).get('/api/properties/khong-ton-tai')).status).toBe(404);
    });

    it('chỉ chủ tin hoặc ADMIN được sửa/xoá', async () => {
      const owner = await createUser('AGENT', 'owner@test.vn');
      const other = await createUser('AGENT', 'other@test.vn');
      const admin = await createUser('ADMIN', 'admin@test.vn');
      const { id } = (await request(app).post('/api/properties').set(auth(owner.token)).send(validProperty)).body;

      expect((await request(app).patch(`/api/properties/${id}`).set(auth(other.token)).send({ price: 1e9 })).status).toBe(403);

      const updated = await request(app).patch(`/api/properties/${id}`).set(auth(owner.token)).send({ price: 1e9 });
      expect(updated.status).toBe(200);
      expect(updated.body.price).toBe(1e9);

      expect((await request(app).delete(`/api/properties/${id}`).set(auth(other.token))).status).toBe(403);
      expect((await request(app).delete(`/api/properties/${id}`).set(auth(admin.token))).status).toBe(204);
      expect((await request(app).get(`/api/properties/${id}`)).status).toBe(404);
    });
  });

  describe('Inquiries', () => {
    it('khách gửi yêu cầu tư vấn, môi giới xem được', async () => {
      const agent = await createUser('AGENT');
      const { id } = (await request(app).post('/api/properties').set(auth(agent.token)).send(validProperty)).body;

      const inquiry = await request(app)
        .post(`/api/properties/${id}/inquiries`)
        .send({ name: 'Anh Nam', phone: '0912345678', message: 'Tôi muốn xem nhà cuối tuần' });
      expect(inquiry.status).toBe(201);

      const bad = await request(app).post(`/api/properties/${id}/inquiries`).send({ name: 'A', phone: '123', message: '' });
      expect(bad.status).toBe(400);

      const list = await request(app).get('/api/inquiries').set(auth(agent.token));
      expect(list.status).toBe(200);
      expect(list.body.items).toHaveLength(1);
      expect(list.body.items[0].property.id).toBe(id);
    });
  });
});
