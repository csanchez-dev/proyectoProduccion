// src/types/express.d.ts
import { Request } from 'express';
import { TipoUsuario } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        rol: TipoUsuario;
      };
    }
  }
}