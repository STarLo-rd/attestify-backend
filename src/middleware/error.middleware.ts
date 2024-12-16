import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(err);

  if (err instanceof AuthError) {
    res.status(err.status).json({
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
};