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
          
          console.log('🔑 Token do Firebase obtido, enviando para backend...');
          
          // Enviar para o backend Go
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          console.log('📡 Resposta do backend recebida:', response.status, response.statusText);

          if (response.ok) {
            const responseText = await response.text();
            console.log('📄 Texto bruto da resposta:', responseText);
            
            try {
              const userData = JSON.parse(responseText);
              console.log('✅ JSON parseado com sucesso:', userData);
              setBackendToken(idToken);
              setUser(user);
              setBackendAuthenticated(true);
            } catch (parseError) {
              console.error('❌ Erro ao fazer parse do JSON:', parseError);
              console.error('📄 Resposta que causou erro:', responseText);
              throw parseError;
            }
          } else {
            const errorText = await response.text();
            console.error('❌ Erro na resposta do backend:', response.status, errorText);
            setUser(null);
            setBackendToken(null);
            setBackendAuthenticated(false);
          }
        } catch (error) {
          console.error('💥 Erro geral na autenticação:', error);
          setUser(null);
          setBackendToken(null);
          setBackendAuthenticated(false);
        }
      } else {
        console.log('👤 Usuário não está logado');
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
      console.log('🚀 Iniciando login com Google...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Login com Google bem-sucedido');
      
      // O onAuthStateChanged já vai lidar com o backend
      return result.user;
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
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
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
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