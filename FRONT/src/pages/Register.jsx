import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import movup_logo from '../assets/movup_logo.png';
import '../styles/login-page.css'
import 'primeicons/primeicons.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    age: null,
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const genderOptions = [
    { label: 'Masculino', value: 'male' },
    { label: 'Feminino', value: 'female' },
    { label: 'Outro', value: 'other' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gênero é obrigatório';
    }

    if (!formData.age) {
      newErrors.age = 'Idade é obrigatória';
    } else if (formData.age < 13 || formData.age > 120) {
      newErrors.age = 'Idade deve estar entre 13 e 120 anos';
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
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setErrors({ general: result.error || 'Falha no cadastro' });
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

  const handleDropdownChange = (e) => {
    setFormData(prev => ({
      ...prev,
      gender: e.value
    }));
    if (errors.gender) {
      setErrors(prev => ({
        ...prev,
        gender: ''
      }));
    }
  };

  const handleAgeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      age: e.value
    }));
    if (errors.age) {
      setErrors(prev => ({
        ...prev,
        age: ''
      }));
    }
  };

  return (
    <div className="page-container mb-0">
      <div className="bg-white flex align-items-center justify-content-center flex-column login-page">
        <img src={movup_logo} alt="" className='img-logo' />
        <Card className="w-full max-w-md card-login">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-black mb-2">Criar Conta</h1>
            <p className="text-black-alpha-80">Junte-se ao MovUp e comece a analisar suas corridas</p>
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
              <label htmlFor="name" className="block text-black font-semibold mb-2">
                Nome
              </label>
              <InputText
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full ${errors.name ? 'p-invalid' : ''}`}
                placeholder="Digite seu nome"
                aria-describedby="name-error"
              />
              {errors.name && (
                <small id="name-error" className="p-error block mt-1">
                  {errors.name}
                </small>
              )}
            </div>

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
              <label htmlFor="gender" className="block text-black font-semibold mb-2">
                Gênero
              </label>
              <Dropdown
                id="gender"
                value={formData.gender}
                options={genderOptions}
                onChange={handleDropdownChange}
                className={`w-full ${errors.gender ? 'p-invalid' : ''}`}
                placeholder="Selecione seu gênero"
                aria-describedby="gender-error"
              />
              {errors.gender && (
                <small id="gender-error" className="p-error block mt-1">
                  {errors.gender}
                </small>
              )}
            </div>

            <div className="field">
              <label htmlFor="age" className="block text-black font-semibold mb-2">
                Idade
              </label>
              <InputNumber
                id="age"
                value={formData.age}
                onValueChange={handleAgeChange}
                className={`w-full ${errors.age ? 'p-invalid' : ''}`}
                placeholder="Digite sua idade"
                aria-describedby="age-error"
                min={13}
                max={120}
                showButtons
                buttonLayout="horizontal"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
              />
              {errors.age && (
                <small id="age-error" className="p-error block mt-1">
                  {errors.age}
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
                placeholder="Crie uma senha"
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
              label={isLoading ? 'Criando Conta...' : 'Registrar'}
              icon={isLoading ? 'pi pi-spinner pi-spin' : 'pi pi-user-plus'}
              className="bg-black border-none login-button"
              disabled={isLoading}
            />
          </form>

          <div className="text-center mt-4">
            <p className="text-black-alpha-80">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="text-black font-semibold hover:underline"
              >
                Entre aqui
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
