import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Tipuri pentru autentificare
interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

// Crearea contextului
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pentru folosirea contextului
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth trebuie folosit în interiorul AuthProvider');
  }
  return context;
};

// Provider pentru context
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Configurarea axios cu interceptori
  useEffect(() => {
    // Interceptor pentru request-uri - adaugă token-ul
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor pentru response-uri - gestionează erorile de autentificare
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirat sau invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Verifică dacă utilizatorul este autentificat la încărcarea aplicației
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verifică validitatea token-ului
          const response = await axios.get('/api/auth/me');
          if (response.data.success) {
            setUser(response.data.data);
          } else {
            // Token invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Eroare la verificarea autentificării:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Funcția de login
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data.data;
        
        // Salvează în localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Actualizează state-ul
        setToken(newToken);
        setUser(newUser);
      } else {
        throw new Error(response.data.message || 'Eroare la autentificare');
      }
    } catch (error: any) {
      console.error('Eroare la login:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Eroare la autentificare'
      );
    } finally {
      setLoading(false);
    }
  };

  // Funcția de logout
  const logout = async (): Promise<void> => {
    try {
      // Încearcă să facă logout pe server
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Eroare la logout pe server:', error);
    } finally {
      // Curăță datele locale indiferent de rezultatul de pe server
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};