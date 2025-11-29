import { createContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { AuthResponse, LoginRequest, RegisterRequest } from '@shared/api';

export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'algobattle_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Initialize from localStorage on mount (fallback from cookie)
  // Note: HttpOnly cookies are automatically sent by the browser on each request,
  // so we don't store the token in state. We keep a user object in localStorage for quick access.
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error restoring user state:', err);
        localStorage.removeItem(USER_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include', // Important: include cookies
        });

        if (response.ok) {
          const userData = await response.json();
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            walletAddress: userData.walletAddress,
            avatarUrl: userData.avatarUrl,
          });
          localStorage.setItem(USER_KEY, JSON.stringify({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            walletAddress: userData.walletAddress,
            avatarUrl: userData.avatarUrl,
          }));
        }
      } catch (err) {
        console.debug('Session verification failed (expected if not logged in)', err);
      }
    };

    verifySession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const request: LoginRequest = { email, password };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data: AuthResponse = await response.json();

      // Store user in state and localStorage for quick access
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        walletAddress: data.user.walletAddress,
        avatarUrl: data.user.avatarUrl,
      };

      setUser(userData);
      setToken(data.token); // Keep token in state for backward compatibility
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const request: RegisterRequest = { email, password, name };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data: AuthResponse = await response.json();

      // Store user in state and localStorage for quick access
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        walletAddress: data.user.walletAddress,
        avatarUrl: data.user.avatarUrl,
      };

      setUser(userData);
      setToken(data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to clear cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear client-side state
      setUser(null);
      setToken(null);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
