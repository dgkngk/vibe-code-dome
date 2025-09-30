import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.ts';
import { User } from '../types.ts';
import { getCurrentUser } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const fetchUser = async () => {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error: any) {
          console.error('Failed to fetch user on auth init/refresh:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            tokenPreview: token ? `${token.substring(0, 20)}...` : 'no token'
          });
          // Do not setToken(null) here; let interceptor handle 401 logout
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      const response = await api.post<{ access_token: string; token_type: string }>('/auth/token', params);
      const { access_token } = response.data;
      setToken(access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      await api.post('/auth/register', { email, password, username });
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          console.error('401 detected - logging out (possible invalid/expired token):', {
            url: error.config?.url,
            tokenPreview: token ? `${token.substring(0, 20)}...` : 'no token',
            errorData: error.response?.data
          });
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logout, token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
