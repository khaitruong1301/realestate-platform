import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { createPropertySchema, listPropertiesQuerySchema, updatePropertySchema } from './property.schema.js';
import * as propertyService from './property.service.js';

export const propertyRouter = Router();

propertyRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await propertyService.listProperties(listPropertiesQuerySchema.parse(req.query)));
  }),
);

propertyRouter.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    res.json(await propertyService.getProperty(req.params.idOrSlug!));
  }),
);

propertyRouter.post(
  '/',
  requireAuth,
  requireRole('AGENT', 'ADMIN'),
  asyncHandler(async (req, res) => {
    res.status(201).json(await propertyService.createProperty(createPropertySchema.parse(req.body), req.user!));
  }),
);

propertyRouter.patch(
  '/:id',
  requireAuth,
  requireRole('AGENT', 'ADMIN'),
  asyncHandler(async (req, res) => {
    res.json(await propertyService.updateProperty(req.params.id!, updatePropertySchema.parse(req.body), req.user!));
  }),
);

propertyRouter.delete(
  '/:id',
  requireAuth,
  requireRole('AGENT', 'ADMIN'),
  asyncHandler(async (req, res) => {
    await propertyService.deleteProperty(req.params.id!, req.user!);
    res.status(204).end();
  }),
);
