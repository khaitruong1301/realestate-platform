import { formatArea, formatPrice } from './format';

describe('formatPrice', () => {
  it('đơn vị tỷ', () => expect(formatPrice(5_200_000_000)).toBe('5,2 tỷ'));
  it('đơn vị triệu', () => expect(formatPrice(850_000_000)).toBe('850 triệu'));
  it('giá thuê có /tháng', () => expect(formatPrice(9_000_000, 'RENT')).toBe('9 triệu/tháng'));
  it('số nhỏ hiển thị đồng', () => expect(formatPrice(500_000)).toBe('500.000 đ'));
});

describe('formatArea', () => {
  it('thêm m² và dấu phẩy thập phân', () => expect(formatArea(70.5)).toBe('70,5 m²'));
});
