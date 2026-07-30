// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from 'react';
import Backendless from 'backendless';
import { User as BackendlessUser } from 'backendless'; // Type for Backendless User

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  emailVerified?: boolean;
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
      try {
        // Asynchronously check if the cached local session token is still valid on Backendless servers
        const isValidSession = await Backendless.UserService.isValidLogin();
        if (!mountedRef.current) return;

        if (isValidSession) {
          const currentUser = await Backendless.UserService.getCurrentUser() as BackendlessUser | null;
          if (currentUser && mountedRef.current) {
            const role = currentUser.role || 'user';
            const appUser: User = {
              id: currentUser.objectId || '',
              email: currentUser.email || '',
              name: currentUser.name || '',
              role,
              created_at: currentUser.created || new Date().toISOString(),
              emailVerified: currentUser.emailVerified,
              ...currentUser,
            };
            setUser(appUser);
            setIsAdmin(role === 'admin');
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAdmin(false);
            setIsAuthenticated(false);
          }
        } else {
          // Token expired or invalid, reset local auth states
          setUser(null);
          setIsAdmin(false);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verifying Backendless user session:', error);
        setUser(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
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
      const currentUser = await Backendless.UserService.getCurrentUser() as BackendlessUser | null;
      if (!currentUser) {
        setUser(null);
        setIsAdmin(false);
        setIsAuthenticated(false);
        return;
      }
      const role = currentUser.role || 'user';
      const appUser: User = {
        id: currentUser.objectId || '',
        email: currentUser.email || '',
        name: currentUser.name || '',
        role,
        created_at: currentUser.created || new Date().toISOString(),
        emailVerified: currentUser.emailVerified,
        ...currentUser,
      };
      setUser(appUser);
      setIsAdmin(role === 'admin');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error reloading Backendless user:', error);
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
      const loggedInUser = await Backendless.UserService.login(email, password, true);
      const role = loggedInUser.role || 'user';
      const appUser: User = {
        id: loggedInUser.objectId || '',
        email: loggedInUser.email || '',
        name: loggedInUser.name || '',
        role,
        created_at: loggedInUser.created || new Date().toISOString(),
        emailVerified: loggedInUser.emailVerified,
        ...loggedInUser,
      };
      setUser(appUser);
      setIsAdmin(role === 'admin');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Backendless sign-in error:', error);
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
      const user = new Backendless.User();
      user.email = email;
      user.password = password;
      user.name = name;
      user.role = role;
      Object.assign(user, additionalData);

      const registeredUser = await Backendless.UserService.register(user);

      // Optionally resend email confirmation if your Backendless setup requires it:
      // await Backendless.UserService.resendEmailConfirmation(email);

      // Automatically log in user after signup
      await Backendless.UserService.login(email, password, true);

      const appUser: User = {
        id: registeredUser.objectId || '',
        email: registeredUser.email || '',
        name: registeredUser.name || '',
        role: registeredUser.role || role,
        created_at: registeredUser.created || new Date().toISOString(),
        emailVerified: registeredUser.emailVerified,
        ...registeredUser,
      };

      setUser(appUser);
      setIsAdmin(role === 'admin');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Backendless sign-up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await Backendless.UserService.logout();
      setUser(null);
      setIsAdmin(false);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Backendless sign-out error:', error);
      throw error;
    } finally {
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
