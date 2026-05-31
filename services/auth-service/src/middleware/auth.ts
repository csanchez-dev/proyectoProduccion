import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Expected shape of JWT payload (adjust as needed)
interface JwtPayload {
  sub: string; // user id
  iat: number;
  exp: number;
  role?: string;
}

/**
 * Express middleware to verify JWT sent in the Authorization header.
 * If verification fails, responds with 401 Unauthorized.
 */
export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.split(' ')[1]; // Expect "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'Malformed Authorization header' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret not configured');
    }
    const payload = jwt.verify(token, secret) as JwtPayload;
    // Attach payload to request for downstream handlers
    (req as any).user = payload;
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
