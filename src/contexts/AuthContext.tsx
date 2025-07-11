import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/api/v1';


interface CurrentUser {
  profile: any;
  id: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  full_name?: string;
  phone?: string;
}

interface AuthContextType {
  user: CurrentUser | null;
  userRole: 'customer' | 'vendor' | 'admin' | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any; user?: CurrentUser }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (email: string, newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [userRole, setUserRole] = useState<'customer' | 'vendor' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userData = response.data;
      setUser(userData);
      setUserRole(userData.profile.role);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      await axios.post('/auth/register', {
        email,
        password,
        fullName: metadata?.fullName || '',
        role: metadata?.role || '' // fallback if not provided
      });
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error details:', error.response?.data);
      return { error: error.response?.data?.message || 'Sign up failed' };
    }
  };


 const signIn = async (email: string, password: string) => {
  try {
    const res = await axios.post('/auth/login', { email, password });
    const token = res.data.accessToken;
    localStorage.setItem('token', token);

    const userData = res.data.user;
    setUser(userData);
    setUserRole(userData.profile.role); // ✅ set role immediately

    return { error: null, user: userData };
  } catch (error: any) {
    return { error: error.response?.data?.message || 'Login failed' };
  }
};



  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setUserRole(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await axios.post('/auth/forgot-password', { email });
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Failed to send reset email' };
    }
  };

  const updatePassword = async (email: string, newPassword: string) => {
    try {
      await axios.post('/auth/reset-password', { email, newPassword });
      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Password update failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, userRole, loading, signUp, signIn, signOut, resetPassword, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
