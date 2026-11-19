import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth } from '../../middleware/auth.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import * as authService from './auth.service.js';

export const authRouter = Router();

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    res.status(201).json(await authService.register(registerSchema.parse(req.body)));
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    res.json(await authService.login(loginSchema.parse(req.body)));
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: await authService.getMe(req.user!.id) });
  }),
);
