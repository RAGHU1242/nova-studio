import { describe, it, expect, beforeAll } from 'vitest';
import {
  initializeFirebase,
  createUser,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  updateUserStats,
} from './firebase';
import { hashPassword, verifyPassword } from '../middleware/auth';

// Note: These tests assume Firebase Emulator is running
// Run with: pnpm run dev:emulator (in another terminal)

describe('Firebase CRUD Operations', () => {
  beforeAll(() => {
    // Initialize Firebase
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
    initializeFirebase();
  });

  describe('User CRUD', () => {
    const testUserId = `test_user_${Date.now()}`;
    const testEmail = `test_${Date.now()}@example.com`;

    it('should create a user', async () => {
      const user = await createUser(testUserId, {
        name: 'Test User',
        email: testEmail,
        password: 'hashed_password',
        walletAddress: null,
        avatarUrl: null,
        wins: 0,
        losses: 0,
        totalStaked: 0,
        totalEarnings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(user.id).toBe(testUserId);
      expect(user.name).toBe('Test User');
      expect(user.email).toBe(testEmail);
      expect(user.wins).toBe(0);
    });

    it('should retrieve user by ID', async () => {
      const user = await getUserById(testUserId);

      expect(user).not.toBeNull();
      expect(user?.name).toBe('Test User');
      expect(user?.email).toBe(testEmail);
    });

    it('should retrieve user by email', async () => {
      const user = await getUserByEmail(testEmail);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(testUserId);
      expect(user?.name).toBe('Test User');
    });

    it('should update user profile', async () => {
      const updated = await updateUserProfile(testUserId, {
        name: 'Updated Name',
        walletAddress: '0x1234567890',
      });

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.walletAddress).toBe('0x1234567890');
    });

    it('should update user stats', async () => {
      await updateUserStats(testUserId, {
        wins: 5,
        losses: 2,
        totalEarnings: 100,
      });

      const user = await getUserById(testUserId);
      expect(user?.wins).toBe(5);
      expect(user?.losses).toBe(2);
      expect(user?.totalEarnings).toBe(100);
    });

    it('should return null for non-existent user', async () => {
      const user = await getUserById('non_existent_user_id');
      expect(user).toBeNull();
    });

    it('should return null for non-existent email', async () => {
      const user = await getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      // Hash should not be the same as original
      expect(hash).not.toBe(password);
      // Hash should be a bcrypt hash (starts with $2a$, $2b$, or $2y$)
      expect(hash).toMatch(/^\$2[aby]\$/);
    });

    it('should verify correct password', async () => {
      const password = 'MyPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'MyPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should produce different hashes for same password (salt)', async () => {
      const password = 'SamePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Hashes should be different due to random salt
      expect(hash1).not.toBe(hash2);
      // But both should verify against the same password
      expect(await verifyPassword(password, hash1)).toBe(true);
      expect(await verifyPassword(password, hash2)).toBe(true);
    });
  });
});
