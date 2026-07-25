import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'admin';
    jti: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}