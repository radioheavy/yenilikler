// src/utils/jwt.ts
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { User } from '../entities/User';
import { UnauthorizedError } from './errors';
import logger from './logger';  // Günlüğe kaydetme için bir logger kullanıyoruz

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

const tokenOptions: SignOptions = {
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',  // JWT'nin süresi
};

export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, tokenOptions);
}

export function verifyToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.error('Invalid token', err);
        reject(new UnauthorizedError('Invalid token'));
      } else {
        resolve(decoded as TokenPayload);
      }
    });
  });
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    logger.error('Error decoding token', error);
    return null;
  }
}
