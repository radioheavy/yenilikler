import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.http(`${req.method} ${req.path}`);
  next();
};
