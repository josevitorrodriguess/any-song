import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendToken, setBackendToken] = useState(null);
  const [backendAuthenticated, setBackendAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Obter o token do Firebase
          const idToken = await user.getIdToken();
          
          // Enviar para o backend Go
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          if (response.ok) {
            const userData = await response.json();
            setBackendToken(idToken);
            setUser(user);
            setBackendAuthenticated(true);
          } else {
            console.error('Erro ao autenticar no backend');
            setUser(null);
            setBackendToken(null);
            setBackendAuthenticated(false);
          }
        } catch (error) {
          console.error('Erro ao verificar usuário no backend:', error);
          setUser(null);
          setBackendToken(null);
          setBackendAuthenticated(false);
        }
      } else {
        setUser(null);
        setBackendToken(null);
        setBackendAuthenticated(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setBackendAuthenticated(false);
      const result = await signInWithPopup(auth, googleProvider);
      
      // O onAuthStateChanged já vai lidar com o backend
      return result.user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Fazer logout no backend primeiro
      if (backendToken) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${backendToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
      
      // Depois fazer logout no Firebase
      await signOut(auth);
      setBackendToken(null);
    } catch (error) {
      throw error;
    }
  };

  // Função para fazer requisições autenticadas
  const authenticatedFetch = async (url, options = {}) => {
    if (!backendToken) {
      throw new Error('Usuário não autenticado');
    }

    const headers = {
      'Authorization': `Bearer ${backendToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`, {
      ...options,
      headers,
    });
  };

  const value = {
    user,
    loading,
    backendToken,
    backendAuthenticated,
    signInWithGoogle,
    logout,
    authenticatedFetch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 