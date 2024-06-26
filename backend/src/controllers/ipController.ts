import { Request, Response } from 'express';

export const getIp = (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'Unknown';
  res.json({ ip });
};