import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';
import { signToken } from '../src/middleware/auth.js';

/** Xoá sạch dữ liệu giữa các test */
export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Inquiry", "PropertyImage", "Property", "User" RESTART IDENTITY CASCADE',
  );
}

export async function createUser(role: Role = Role.USER, email = `${role.toLowerCase()}-${Date.now()}@test.vn`) {
  const user = await prisma.user.create({
    data: { email, fullName: `Test ${role}`, role, passwordHash: await bcrypt.hash('Password123!', 4) },
  });
  return { user, token: signToken(user) };
}

export const validProperty = {
  title: 'Căn hộ 2 phòng ngủ Quận 7 view đẹp',
  description: 'Căn hộ thoáng mát, nội thất cơ bản, gần trường học và chợ.',
  type: 'APARTMENT',
  listingType: 'SALE',
  price: 3_500_000_000,
  area: 70.5,
  bedrooms: 2,
  bathrooms: 2,
  address: '123 Nguyễn Thị Thập',
  district: 'Quận 7',
  city: 'Hồ Chí Minh',
  images: [{ url: 'https://example.com/a.jpg', position: 0 }],
};
