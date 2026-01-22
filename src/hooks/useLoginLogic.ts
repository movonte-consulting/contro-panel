import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { API_ENDPOINTS } from '../config/api';

interface LoginFormData {
  username: string;
  password: string;
}

export const useLoginLogic = (onLogin?: (data: LoginFormData) => void) => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { post } = useApi();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, isLoading]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await post(API_ENDPOINTS.LOGIN, {
        username: formData.username.trim(),
        password: formData.password
      }, { requireAuth: false });

      if (response.success) {
        login(response.data.token, response.data.user);
        
        setSuccessMessage(response.message || 'Login successful! Redirecting...');
        
        if (onLogin) {
          onLogin(formData);
        }
        
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        setErrorMessage(response.error || 'Login failed');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    showPassword,
    isLoading,
    errorMessage,
    successMessage,
    handleInputChange,
    handleSubmit,
    togglePassword
  };
};