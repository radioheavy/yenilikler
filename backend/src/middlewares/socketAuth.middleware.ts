// src/middlewares/socketAuth.middleware.ts
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { verifyToken } from '../utils/jwt';
import logger from '../utils/logger';

export const socketAuthMiddleware = async (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    const decoded = await verifyToken(token);
    socket.data.user = decoded;
    next();
  } catch (error) {
    logger.error('WebSocket authentication error:', error);
    next(new Error('Authentication error'));
  }
};