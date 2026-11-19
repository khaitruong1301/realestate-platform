import { PropertyStatus } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../lib/async-handler.js';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const createInquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email().optional(),
  message: z.string().trim().min(5).max(2000),
});

export const inquiryRouter = Router();

/** Khách (không cần đăng nhập) gửi yêu cầu tư vấn cho 1 tin đăng */
inquiryRouter.post(
  '/properties/:id/inquiries',
  asyncHandler(async (req, res) => {
    const data = createInquirySchema.parse(req.body);
    const property = await prisma.property.findFirst({
      where: { id: req.params.id, status: PropertyStatus.PUBLISHED },
      select: { id: true },
    });
    if (!property) throw HttpError.notFound('Không tìm thấy bất động sản');
    const inquiry = await prisma.inquiry.create({ data: { ...data, propertyId: property.id } });
    res.status(201).json(inquiry);
  }),
);

/** Môi giới xem yêu cầu tư vấn của các tin mình đăng (admin xem tất cả) */
inquiryRouter.get(
  '/inquiries',
  requireAuth,
  requireRole('AGENT', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const where = req.user!.role === 'ADMIN' ? {} : { property: { agentId: req.user!.id } };
    const items = await prisma.inquiry.findMany({
      where,
      include: { property: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ items });
  }),
);
