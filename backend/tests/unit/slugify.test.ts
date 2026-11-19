import { describe, expect, it } from 'vitest';
import { slugify, uniqueSlug } from '../../src/lib/slugify.js';

describe('slugify', () => {
  it('bỏ dấu tiếng Việt và chữ đ', () => {
    expect(slugify('Căn hộ Đẹp Quận 1')).toBe('can-ho-dep-quan-1');
  });
  it('gộp ký tự đặc biệt và bỏ gạch ở 2 đầu', () => {
    expect(slugify('  --Nhà phố!!! 100m²  ')).toBe('nha-pho-100m');
  });
  it('giới hạn 80 ký tự', () => {
    expect(slugify('a'.repeat(200))).toHaveLength(80);
  });
  it('uniqueSlug thêm hậu tố và luôn khác nhau', () => {
    const a = uniqueSlug('Biệt thự');
    expect(a).toMatch(/^biet-thu-[0-9a-f]{6}$/);
    expect(uniqueSlug('Biệt thự')).not.toBe(a);
  });
  it('uniqueSlug có giá trị mặc định khi tiêu đề rỗng sau khi chuẩn hoá', () => {
    expect(uniqueSlug('!!!')).toMatch(/^bat-dong-san-/);
  });
});
