import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Bọc handler async để lỗi tự chuyển tới error middleware (Express 4) */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
