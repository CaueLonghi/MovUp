import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { API_CONFIG } from '../config/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('auth_token');
      if (token) {
        // Se houver token, verificar se é válido e buscar dados do usuário
        // Por enquanto, vamos apenas verificar se o token existe
        // Você pode adicionar uma chamada à API para validar o token e buscar dados do usuário
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text);
        return { success: false, error: 'Resposta inválida do servidor' };
      }

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Erro ao fazer login' };
      }

      // Salvar token no cookie
      if (data.token) {
        Cookies.set('auth_token', data.token, { expires: 2 }); // Expira em 2 dias
      }

      // Buscar dados do usuário (você pode ajustar isso conforme sua API)
      // Por enquanto, vamos usar os dados básicos
      const userData = {
        email: email,
        // Você pode fazer uma chamada adicional para buscar mais dados do usuário
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, error: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.' };
      }
      return { success: false, error: 'Erro de conexão. Tente novamente.' };
    }
  };

  const register = async (nome, email, birthday, senha) => {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.register}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, birthday, senha }),
      });

      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text);
        return { success: false, error: 'Resposta inválida do servidor' };
      }

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Erro ao criar conta' };
      }

      // Após registro bem-sucedido, fazer login automaticamente
      const loginResult = await login(email, senha);
      return loginResult;
    } catch (error) {
      console.error('Erro no registro:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, error: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.' };
      }
      return { success: false, error: 'Erro de conexão. Tente novamente.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    Cookies.remove('auth_token');
  };

  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    const token = Cookies.get('auth_token');
    return !!token;
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
