import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  addresses?: Array<{
    _id?: string;
    label: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    isDefault?: boolean;
  }>;
  profileImage?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || '/api';
const AUTH_STORAGE_KEY = "vasstra_auth_token";
const USER_STORAGE_KEY = "vasstra_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        phone: data.user.phone,
        address: data.user.address,
        addresses: data.user.addresses,
        createdAt: data.user.createdAt,
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signup = async (email: string, password: string, name: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Signup failed' };
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        phone: data.user.phone,
        createdAt: data.user.createdAt,
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return { success: false, error: responseData.error || 'Failed to update profile' };
      }

      const updatedUser: User = {
        ...user,
        ...responseData.user,
      } as User;

      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, token, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
