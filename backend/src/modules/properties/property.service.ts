import { Prisma, PropertyStatus, type Property, type PropertyImage, type User } from '@prisma/client';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { uniqueSlug } from '../../lib/slugify.js';
import type { AuthUser } from '../../middleware/auth.js';
import type { CreatePropertyInput, ListPropertiesQuery, UpdatePropertyInput } from './property.schema.js';

type PropertyWithRelations = Property & {
  images: PropertyImage[];
  agent?: Pick<User, 'id' | 'fullName' | 'phone' | 'email'>;
};

const agentSelect = { select: { id: true, fullName: true, phone: true, email: true } } as const;

/** Decimal -> number để JSON trả về là số, không phải chuỗi */
export function serializeProperty(p: PropertyWithRelations) {
  return {
    ...p,
    price: p.price.toNumber(),
    area: p.area.toNumber(),
    images: [...p.images].sort((a, b) => a.position - b.position),
  };
}

const ORDER_BY: Record<ListPropertiesQuery['sort'], Prisma.PropertyOrderByWithRelationInput> = {
  newest: { createdAt: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
  area_desc: { area: 'desc' },
};

export async function listProperties(query: ListPropertiesQuery) {
  const where: Prisma.PropertyWhereInput = {
    status: PropertyStatus.PUBLISHED,
    type: query.type,
    listingType: query.listingType,
    city: query.city ? { equals: query.city, mode: 'insensitive' } : undefined,
    district: query.district ? { equals: query.district, mode: 'insensitive' } : undefined,
    bedrooms: query.bedrooms !== undefined ? { gte: query.bedrooms } : undefined,
    price: { gte: query.minPrice, lte: query.maxPrice },
    area: { gte: query.minArea, lte: query.maxArea },
    OR: query.q
      ? [
          { title: { contains: query.q, mode: 'insensitive' } },
          { address: { contains: query.q, mode: 'insensitive' } },
          { district: { contains: query.q, mode: 'insensitive' } },
        ]
      : undefined,
  };

  const [items, total] = await prisma.$transaction([
    prisma.property.findMany({
      where,
      include: { images: true },
      orderBy: ORDER_BY[query.sort],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    items: items.map(serializeProperty),
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

export async function getProperty(idOrSlug: string) {
  const property = await prisma.property.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], status: { not: PropertyStatus.HIDDEN } },
    include: { images: true, agent: agentSelect },
  });
  if (!property) throw HttpError.notFound('Không tìm thấy bất động sản');
  return serializeProperty(property);
}

export async function createProperty(input: CreatePropertyInput, user: AuthUser) {
  const { images, ...data } = input;
  const property = await prisma.property.create({
    data: {
      ...data,
      slug: uniqueSlug(data.title),
      agentId: user.id,
      images: { create: images },
    },
    include: { images: true, agent: agentSelect },
  });
  return serializeProperty(property);
}

async function assertCanModify(id: string, user: AuthUser) {
  const existing = await prisma.property.findUnique({ where: { id }, select: { agentId: true } });
  if (!existing) throw HttpError.notFound('Không tìm thấy bất động sản');
  if (user.role !== 'ADMIN' && existing.agentId !== user.id) {
    throw HttpError.forbidden('Bạn chỉ được sửa tin của mình');
  }
}

export async function updateProperty(id: string, input: UpdatePropertyInput, user: AuthUser) {
  await assertCanModify(id, user);
  const { images, ...data } = input;
  const property = await prisma.property.update({
    where: { id },
    data: {
      ...data,
      // Gửi images = thay toàn bộ danh sách ảnh
      images: images ? { deleteMany: {}, create: images } : undefined,
    },
    include: { images: true, agent: agentSelect },
  });
  return serializeProperty(property);
}

export async function deleteProperty(id: string, user: AuthUser) {
  await assertCanModify(id, user);
  await prisma.property.delete({ where: { id } });
}
