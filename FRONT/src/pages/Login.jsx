import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import movup_logo from '../assets/movup_logo.png';
import '../styles/login-page.css'
import 'primeicons/primeicons.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setErrors({ general: result.error || 'Falha no login' });
      }
    } catch (error) {
      setErrors({ general: 'Ocorreu um erro inesperado' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="page-container mb-0">
      <div className="bg-white flex align-items-center justify-content-center flex-column login-page">
        <img src={movup_logo} alt="" className='img-logo' />
        <Card className="w-full max-w-md card-login">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-black mb-2">Bem-vindo de Volta</h1>
            <p className="text-black-alpha-80">Entre na sua conta MovUp</p>
          </div>

          {errors.general && (
            <Message 
              severity="error" 
              text={errors.general} 
              className="mb-3 w-full"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="field">
              <label htmlFor="email" className="block text-black font-semibold mb-2">
                Email
              </label>
              <InputText
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                placeholder="Digite seu email"
                aria-describedby="email-error"
              />
              {errors.email && (
                <small id="email-error" className="p-error block mt-1">
                  {errors.email}
                </small>
              )}
            </div>

            <div className="field">
              <label htmlFor="password" className="block text-black font-semibold mb-2">
                Senha
              </label>
              <Password
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                placeholder="Digite sua senha"
                aria-describedby="password-error"
                feedback={false}
                toggleMask
              />
              {errors.password && (
                <small id="password-error" className="p-error block mt-1">
                  {errors.password}
                </small>
              )}
            </div>

            <Button
              type="submit"
              label={isLoading ? 'Entrando...' : 'Entrar'}
              icon={isLoading ? 'pi pi-spinner pi-spin' : ''}
              className="bg-black border-none login-button"
              disabled={isLoading}
            />
          </form>

          <div className="text-center mt-4">
            <p className="text-black-alpha-80">
              Não tem uma conta?{' '}
              <Link 
                to="/register" 
                className="text-black font-semibold hover:underline"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>

          <div className="text-center mt-3">
            <Link 
              to="/forgot-password" 
              className="text-black-alpha-70 hover:text-black text-sm"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
