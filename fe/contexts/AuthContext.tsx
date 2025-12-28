'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { api, getAuthToken, setAuthToken, removeAuthToken, getDefaultHeaders } from '../lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'super_admin';
  google_id?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      // Call backend logout API
      await fetch(api.logout, {
        method: 'POST',
        headers: getDefaultHeaders(true),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }

    // Clear all auth data from localStorage
    removeAuthToken();
    localStorage.removeItem('user');

    // Clear all cookies by setting them to expire
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Clear all user cart data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('pasaloo_cart_')) {
        localStorage.removeItem(key);
      }
    });

    setUser(null);
  }, []);

  const login = useCallback((token: string, userData: User) => {
    setAuthToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const checkAuth = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      // No token means not authenticated - clear any stale data
      removeAuthToken();
      localStorage.removeItem('user');
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(api.me, {
        method: 'GET',
        headers: getDefaultHeaders(true),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        // Token invalid, clear everything
        removeAuthToken();
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // On error, clear everything - don't trust stale data
      removeAuthToken();
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        checkAuth,
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

