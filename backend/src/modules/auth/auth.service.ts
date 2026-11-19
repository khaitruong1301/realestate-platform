import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { z } from 'zod';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { signToken } from '../../middleware/auth.js';
import type { loginSchema, registerSchema } from './auth.schema.js';

export function toPublicUser(user: User) {
  const { passwordHash: _ignored, ...rest } = user;
  return rest;
}

export async function register(input: z.infer<typeof registerSchema>) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw HttpError.conflict('Email đã được sử dụng');

  const user = await prisma.user.create({
    data: {
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
      passwordHash: await bcrypt.hash(input.password, 10),
    },
  });
  return { user: toPublicUser(user), token: signToken(user) };
}

export async function login(input: z.infer<typeof loginSchema>) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Cùng 1 thông báo cho cả 2 trường hợp để không lộ email nào tồn tại
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw HttpError.unauthorized('Email hoặc mật khẩu không đúng');
  }
  return { user: toPublicUser(user), token: signToken(user) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw HttpError.notFound('Người dùng không tồn tại');
  return toPublicUser(user);
}
