// backend/src/types/express.d.ts

import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Example: Adding a custom property to the Request interface
    }
  }
}
