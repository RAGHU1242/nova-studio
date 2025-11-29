import { RequestHandler } from 'express';
import { z } from 'zod';
import { RegisterRequest, LoginRequest, AuthResponse, UserProfileResponse } from '@shared/api';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyPassword,
  hashPassword,
  AuthRequest,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from '../middleware/auth';
import {
  createUser,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  initializeFirebase,
} from '../lib/firebase';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Initialize Firebase on first load
initializeFirebase();

/**
 * Register endpoint
 * POST /api/auth/register
 */
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    // Validate input
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      res.status(400).json({ error: `Validation error: ${errors}` });
      return;
    }

    const { name, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user ID
    const userId = `user_${Date.now()}`;

    // Create user in Firestore
    const userData = await createUser(userId, {
      name,
      email,
      password: hashedPassword,
      walletAddress: null,
      avatarUrl: null,
      wins: 0,
      losses: 0,
      totalStaked: 0,
      totalEarnings: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Generate tokens
    const accessToken = generateAccessToken(userId, email, name);
    const refreshToken = generateRefreshToken(userId);

    // Set HttpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_EXPIRY * 1000, // Convert to ms
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });

    // Return response (excluding password)
    const response: AuthResponse = {
      token: accessToken, // Include for backward compatibility with client
      user: {
        id: userId,
        name,
        email,
        walletAddress: null,
        avatarUrl: null,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Login endpoint
 * POST /api/auth/login
 */
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    // Validate input
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      res.status(400).json({ error: `Validation error: ${errors}` });
      return;
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, email, user.name);
    const refreshToken = generateRefreshToken(user.id);

    // Set HttpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_EXPIRY * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_EXPIRY * 1000,
    });

    // Return response (excluding password)
    const response: AuthResponse = {
      token: accessToken, // For backward compatibility
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress || undefined,
        avatarUrl: user.avatarUrl || undefined,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get current user endpoint
 * GET /api/users/me
 * Requires authentication
 */
export const handleGetCurrentUser: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await getUserById(req.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return user profile (excluding password)
    const response: UserProfileResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress || undefined,
      avatarUrl: user.avatarUrl || undefined,
      wins: user.wins,
      losses: user.losses,
      totalStaked: user.totalStaked,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Logout endpoint
 * POST /api/auth/logout
 */
export const handleLogout: RequestHandler = (req, res) => {
  try {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Refresh token endpoint
 * POST /api/auth/refresh
 */
export const handleRefreshToken: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: 'Missing refresh token' });
      return;
    }

    // Verify refresh token (basic verification)
    const parts = refreshToken.split('.');
    if (parts.length !== 3) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Decode to get userId
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const userId = payload.userId;

    if (!userId) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Get user to generate new access token
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email, user.name);

    // Set new access token cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ACCESS_TOKEN_EXPIRY * 1000,
    });

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
