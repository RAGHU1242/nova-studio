import { createContext, ReactNode, useState, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock login function - simulates API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Validate inputs
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Mock user data
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        name: email.split("@")[0],
      };

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      try {
        // Mock register function - simulates API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Validate inputs
        if (!email || !password || !name) {
          throw new Error("All fields are required");
        }

        // Mock user data
        const mockUser: User = {
          id: `user-${Date.now()}`,
          email,
          name,
        };

        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
