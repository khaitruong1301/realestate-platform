import { randomBytes } from 'node:crypto';

/** Chuyển tiêu đề tiếng Việt thành slug ASCII: "Căn hộ Quận 1" -> "can-ho-quan-1" */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Slug duy nhất: thêm hậu tố ngẫu nhiên 6 ký tự */
export function uniqueSlug(input: string): string {
  const base = slugify(input) || 'bat-dong-san';
  return `${base}-${randomBytes(3).toString('hex')}`;
}
