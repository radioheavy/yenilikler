// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { UnauthorizedError } from './errors';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
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
    return null;
  }
}