// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from 'react';
import { apiClient, getAuthToken, setAuthSession } from '../lib/apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  semester?: number;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  reloadUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: string,
    additionalData?: Record<string, any>
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const fetchCurrentUser = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me: User = await apiClient.get('/auth/me');
        if (mountedRef.current && me) {
          setUser(me);
          setIsAdmin(me.role === 'admin');
          setIsAuthenticated(true);
        } else {
          setAuthSession(null, null);
        }
      } catch (error) {
        console.error('Error verifying user session:', error);
        // Clear token on error since it might be expired or invalid
        setAuthSession(null, null);
        if (mountedRef.current) {
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reloadUser = async () => {
    setLoading(true);
    try {
      const me: User = await apiClient.get('/auth/me');
      setUser(me);
      setIsAdmin(me.role === 'admin');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error reloading user:', error);
      setAuthSession(null, null);
      setUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await apiClient.post('/auth/signin', { email, password });
      setAuthSession(data.access_token, data.user);
      setUser(data.user);
      setIsAdmin(data.user.role === 'admin');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: string,
    additionalData: Record<string, any> = {}
  ) => {
    setLoading(true);
    try {
      const payload = {
        email,
        password,
        name,
        role,
        semester: additionalData.semester || 1,
        college: additionalData.college || "",
        college_address: additionalData.collegeAddress || additionalData.college_address || "",
      };

      // Signup now returns {message, email, requires_verification} — does NOT issue token
      await apiClient.post('/auth/signup', payload);

      // Redirect to verification page; do NOT log user in yet
      window.location.href = `/verify?email=${encodeURIComponent(email)}`;
    } catch (error) {
      console.error('Sign-up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Best-effort sign out on backend, then clear locally
      await apiClient.post('/auth/signout', {}).catch(() => {});
    } finally {
      setAuthSession(null, null);
      setUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isAuthenticated,
        reloadUser,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
