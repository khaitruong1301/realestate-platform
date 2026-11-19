import type { Property } from '../api/types';

export const makeProperty = (overrides: Partial<Property> = {}): Property => ({
  id: 'p1',
  title: 'Căn hộ 2PN view sông Quận 2',
  slug: 'can-ho-2pn-view-song-quan-2-abc123',
  description: 'Mô tả căn hộ',
  type: 'APARTMENT',
  listingType: 'SALE',
  status: 'PUBLISHED',
  price: 5_200_000_000,
  area: 75,
  bedrooms: 2,
  bathrooms: 2,
  address: '1 Đường A',
  ward: null,
  district: 'Thủ Đức',
  city: 'Hồ Chí Minh',
  images: [{ id: 'i1', url: 'https://example.com/a.jpg', position: 0 }],
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

export const mockFetchJson = (body: unknown, status = 200) =>
  // Mỗi lần gọi trả Response MỚI (body của Response chỉ đọc được 1 lần)
  vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  );
