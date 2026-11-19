import { toQueryString } from './properties';

describe('toQueryString', () => {
  it('bỏ giá trị rỗng/undefined', () => {
    expect(toQueryString({ q: 'quận 7', type: '', city: undefined, page: 2 })).toBe('?q=qu%E1%BA%ADn+7&page=2');
  });
  it('trả chuỗi rỗng khi không có filter', () => expect(toQueryString({})).toBe(''));
});
