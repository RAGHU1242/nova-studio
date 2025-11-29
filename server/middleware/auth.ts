import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

// Token expiry times
export const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password using bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate access token (JWT)
 */
export function generateAccessToken(userId: string, email: string, name: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      email,
      name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY,
      type: 'access',
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Generate refresh token (JWT)
 */
export function generateRefreshToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_EXPIRY,
      type: 'refresh',
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', REFRESH_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): { userId: string; email: string; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());

    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }

    if (decoded.type !== 'access') {
      return null; // Wrong token type
    }

    return { userId: decoded.userId, email: decoded.email, name: decoded.name };
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', REFRESH_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());

    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }

    if (decoded.type !== 'refresh') {
      return null; // Wrong token type
    }

    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

/**
 * Auth middleware to verify access token from cookie or Authorization header
 * Supports both:
 * - HttpOnly cookie: accessToken (preferred, more secure)
 * - Authorization header: Bearer <token>
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    let token: string | null = null;

    // Try to get token from HttpOnly cookie first (preferred)
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }
    // Fallback to Authorization header for API clients
    else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7);
    }

    if (!token) {
      res.status(401).json({ error: 'Missing authentication token' });
      return;
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Refresh token endpoint helper
 * Used to refresh expired access tokens
 */
export function refreshAccessToken(refreshToken: string, userId: string, email: string, name: string): string | null {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded || decoded.userId !== userId) {
    return null;
  }

  return generateAccessToken(userId, email, name);
}
