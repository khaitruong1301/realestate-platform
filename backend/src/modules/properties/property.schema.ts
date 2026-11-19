import { ListingType, PropertyStatus, PropertyType } from '@prisma/client';
import { z } from 'zod';

const imageSchema = z.object({ url: z.string().url(), position: z.number().int().min(0).default(0) });

export const createPropertySchema = z.object({
  title: z.string().trim().min(10).max(200),
  description: z.string().trim().min(20).max(10000),
  type: z.nativeEnum(PropertyType),
  listingType: z.nativeEnum(ListingType),
  status: z.nativeEnum(PropertyStatus).default(PropertyStatus.PUBLISHED),
  price: z.number().positive().max(1e14),
  area: z.number().positive().max(1e7),
  bedrooms: z.number().int().min(0).max(100).optional(),
  bathrooms: z.number().int().min(0).max(100).optional(),
  address: z.string().trim().min(3).max(255),
  ward: z.string().trim().max(100).optional(),
  district: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  images: z.array(imageSchema).max(30).default([]),
});

export const updatePropertySchema = createPropertySchema.partial();

export const listPropertiesQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    city: z.string().trim().max(100).optional(),
    district: z.string().trim().max(100).optional(),
    type: z.nativeEnum(PropertyType).optional(),
    listingType: z.nativeEnum(ListingType).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    minArea: z.coerce.number().nonnegative().optional(),
    maxArea: z.coerce.number().nonnegative().optional(),
    bedrooms: z.coerce.number().int().min(0).optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'area_desc']).default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
  })
  .refine((v) => v.minPrice === undefined || v.maxPrice === undefined || v.minPrice <= v.maxPrice, {
    message: 'minPrice phải nhỏ hơn hoặc bằng maxPrice',
    path: ['minPrice'],
  });

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type ListPropertiesQuery = z.infer<typeof listPropertiesQuerySchema>;
