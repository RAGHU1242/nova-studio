import { RequestHandler } from "express";
import { generateToken } from "../middleware/auth";
import { RegisterRequest, LoginRequest, AuthResponse } from "@shared/api";

// Mock user storage (in production, this would use Firestore)
const users: Map<string, any> = new Map();

/**
 * Hash password (mock - in production use bcrypt)
 */
function hashPassword(password: string): string {
  return Buffer.from(password).toString("base64");
}

/**
 * Verify password (mock - in production use bcrypt)
 */
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Register endpoint
 */
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body as RegisterRequest;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({ error: "Missing required fields: name, email, password" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    // Check if user exists (mock)
    for (const user of users.values()) {
      if (user.email === email) {
        res.status(409).json({ error: "Email already registered" });
        return;
      }
    }

    // Create user
    const userId = `user_${Date.now()}`;
    const hashedPassword = hashPassword(password);

    const userData = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      wins: 0,
      losses: 0,
      totalStaked: 0,
      walletAddress: null,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(userId, userData);

    // Generate token
    const token = generateToken(userId, email);

    const response: AuthResponse = {
      token,
      user: {
        id: userId,
        name,
        email,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Login endpoint
 */
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: "Missing required fields: email, password" });
      return;
    }

    // Find user (mock)
    let user = null;
    for (const u of users.values()) {
      if (u.email === email) {
        user = u;
        break;
      }
    }

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate token
    const token = generateToken(user.id, email);

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        avatarUrl: user.avatarUrl,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get current user (requires auth)
 */
export const handleGetCurrentUser: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = users.get(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
      avatarUrl: user.avatarUrl,
      wins: user.wins,
      losses: user.losses,
      totalStaked: user.totalStaked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
