/* Seed dữ liệu mẫu: 1 admin, 1 môi giới, 6 tin đăng. Chạy: npm run db:seed */
import 'dotenv/config';
import { ListingType, PrismaClient, PropertyType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { uniqueSlug } from '../src/lib/slugify.js';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@realestate.local' },
    update: {},
    create: { email: 'admin@realestate.local', fullName: 'Quản trị viên', role: Role.ADMIN, passwordHash },
  });
  const agent = await prisma.user.upsert({
    where: { email: 'agent@realestate.local' },
    update: {},
    create: {
      email: 'agent@realestate.local',
      fullName: 'Nguyễn Văn Môi Giới',
      phone: '0901234567',
      role: Role.AGENT,
      passwordHash,
    },
  });

  if ((await prisma.property.count()) > 0) {
    console.log('Đã có dữ liệu, bỏ qua seed tin đăng.');
    return;
  }

  const samples = [
    { title: 'Căn hộ 2PN view sông Sài Gòn, Quận 2', type: PropertyType.APARTMENT, listingType: ListingType.SALE, price: 5_200_000_000, area: 75, bedrooms: 2, bathrooms: 2, district: 'Thủ Đức', city: 'Hồ Chí Minh' },
    { title: 'Nhà phố 4 tầng hẻm xe hơi Phú Nhuận', type: PropertyType.HOUSE, listingType: ListingType.SALE, price: 12_500_000_000, area: 68, bedrooms: 4, bathrooms: 5, district: 'Phú Nhuận', city: 'Hồ Chí Minh' },
    { title: 'Cho thuê căn hộ studio full nội thất Quận 7', type: PropertyType.APARTMENT, listingType: ListingType.RENT, price: 9_000_000, area: 35, bedrooms: 1, bathrooms: 1, district: 'Quận 7', city: 'Hồ Chí Minh' },
    { title: 'Biệt thự sân vườn Thảo Điền hồ bơi riêng', type: PropertyType.VILLA, listingType: ListingType.SALE, price: 65_000_000_000, area: 450, bedrooms: 5, bathrooms: 6, district: 'Thủ Đức', city: 'Hồ Chí Minh' },
    { title: 'Đất nền thổ cư 100m2 gần sân bay Long Thành', type: PropertyType.LAND, listingType: ListingType.SALE, price: 2_100_000_000, area: 100, district: 'Long Thành', city: 'Đồng Nai' },
    { title: 'Cho thuê văn phòng 120m2 mặt tiền Cầu Giấy', type: PropertyType.OFFICE, listingType: ListingType.RENT, price: 45_000_000, area: 120, district: 'Cầu Giấy', city: 'Hà Nội' },
  ];

  for (const [i, s] of samples.entries()) {
    await prisma.property.create({
      data: {
        ...s,
        slug: uniqueSlug(s.title),
        description: `${s.title}. Pháp lý rõ ràng, sổ hồng chính chủ, hỗ trợ vay ngân hàng 70%. Liên hệ để xem nhà.`,
        address: `${10 + i} Đường số ${i + 1}`,
        agentId: agent.id,
        images: { create: [{ url: `https://picsum.photos/seed/realestate${i}/800/600`, position: 0 }] },
      },
    });
  }
  console.log(`✅ Seed xong ${samples.length} tin đăng. Tài khoản: agent@realestate.local / Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
