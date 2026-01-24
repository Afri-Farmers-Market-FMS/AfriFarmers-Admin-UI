import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, checkBackendConnection } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Viewer';
  avatar?: string;
  phone?: string;
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBackendAvailable: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<{ requiresTwoFactor?: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check backend and restore session on mount
    const initAuth = async () => {
      setIsLoading(true);
      
      // Check if backend is available
      const backendConnected = await checkBackendConnection();
      setIsBackendAvailable(backendConnected);
      
      if (backendConnected) {
        // Try to get current user from backend
        try {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            const userData: User = {
              id: currentUser.id || currentUser._id,
              name: currentUser.name,
              email: currentUser.email,
              role: currentUser.role,
              avatar: currentUser.avatar
            };
            setUser(userData);
            localStorage.setItem('afm_user', JSON.stringify(userData));
          }
        } catch {
          // Token might be invalid, clear it
          localStorage.removeItem('afm_user');
        }
      } else {
        // Fallback: Check local storage
        const storedUser = localStorage.getItem('afm_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        const userData: User = {
          id: currentUser.id || currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          avatar: currentUser.avatar,
          phone: currentUser.phone,
          twoFactorEnabled: currentUser.twoFactorEnabled
        };
        setUser(userData);
        localStorage.setItem('afm_user', JSON.stringify(userData));
      }
    } catch {
      // Ignore errors
    }
  };

  const login = async (email: string, password: string, twoFactorCode?: string): Promise<{ requiresTwoFactor?: boolean }> => {
    // Don't set isLoading for the context when doing 2FA - only for full login
    // This prevents the PublicRoute from re-rendering during 2FA flow
    if (!twoFactorCode) {
      // Only show loading for initial login attempt, not for 2FA verification step
    }
    setError(null);
    
    console.log('🔐 AuthContext.login called with:', email);
    
    try {
      // Check backend availability first
      const backendConnected = await checkBackendConnection();
      console.log('🔌 Backend connected for login:', backendConnected);
      setIsBackendAvailable(backendConnected);
      
      if (backendConnected) {
        // Login via backend
        console.log('📤 Calling authService.login...');
        const { user: userData, token, requiresTwoFactor } = await authService.login(email, password, twoFactorCode);
        
        // If 2FA is required, return early WITHOUT changing context loading state
        if (requiresTwoFactor) {
          console.log('🔐 2FA required, returning to login form');
          return { requiresTwoFactor: true };
        }
        
        console.log('📥 Login response - user:', userData, 'token received:', !!token);
        const newUser: User = {
          id: userData.id || userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          avatar: userData.avatar,
          phone: userData.phone,
          twoFactorEnabled: userData.twoFactorEnabled
        };
        setUser(newUser);
        localStorage.setItem('afm_user', JSON.stringify(newUser));
        console.log('✅ User saved to state and localStorage');
        return {};
      } else {
        // Demo mode: allow mock login when backend is down
        // In production, you might want to throw an error instead
        const mockRoles: Record<string, User['role']> = {
          'admin@afrifarmers.rw': 'Super Admin',
          'john@afrifarmers.rw': 'Admin',
          'jane@afrifarmers.rw': 'Viewer'
        };
        
        const role = mockRoles[email] || 'Viewer';
        const newUser: User = {
          id: '1',
          name: email.split('@')[0],
          email,
          role,
          avatar: undefined
        };
        setUser(newUser);
        localStorage.setItem('afm_user', JSON.stringify(newUser));
        console.warn('⚠️ Using demo login - backend not available');
        return {};
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('afm_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      isBackendAvailable,
      login, 
      logout,
      refreshUser,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
