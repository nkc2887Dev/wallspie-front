'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: number;
  email?: string;
  name: string;
  user_type: number;
  is_owner: number;
  is_guest?: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  createGuest: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createGuest = async () => {
    try {
      const response = await api.createGuest();
      if (response.data) {
        api.setToken(response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to create guest:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenExpiration = () => {
    // Clear tokens and user data
    api.setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('redirectAfterLogin');
    setUser(null);
    // Create new guest user
    createGuest();
  };

  useEffect(() => {
    // Set up unauthorized callback for token expiration
    api.setOnUnauthorized(handleTokenExpiration);

    // Check for existing token and load user
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.setToken(token);
      loadUser();
    } else {
      // Auto-create guest user if no token
      createGuest();
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await api.getProfile();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      // Token might be expired, create guest
      createGuest();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    if (response.data) {
      api.setToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser(response.data.user);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await api.register({ email, password, name });
    if (response.data) {
      api.setToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      setUser(response.data.user);
    }
  };

  const logout = () => {
    api.setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('redirectAfterLogin');
    setUser(null);
    // Create new guest user
    createGuest();
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const isAuthenticated = !!user && !user.is_guest;
  const isAdmin = user?.user_type === 1;
  const isOwner = user?.is_owner === 1;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isOwner,
        isLoading,
        login,
        register,
        createGuest,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
