'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '../../components/Container';
import Button from '../../components/Button';
import { authService } from '../../lib/api/services';

// Define the LoginData interface since it's not exported from services
interface LoginData {
  email: string;
  password: string;
}

interface LoginFormData extends LoginData {
  rememberMe: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setServerError(null);
    setSuccessMessage(null);
    
    try {
      const response = await authService.login(formData.email, formData.password);
      
      // Check if login was successful
      if (response.success && response.token) {
        // Show success message
        setSuccessMessage('Login successful! Redirecting to dashboard...');
        
        // Redirect to dashboard after a short delay to show the success message
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setServerError(response.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <Container maxWidth="sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gradient">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign in to your account</p>
        </div>
        
        <div className="container-card border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 shadow-md">
          {serverError && (
            <div className="bg-error-100 text-error-700 p-3 rounded-md mb-6 dark:bg-error-700 dark:bg-opacity-20 dark:text-error-500">
              {serverError}
            </div>
          )}
          
          {successMessage && (
            <div className="bg-success-100 text-success-700 p-3 rounded-md mb-6 dark:bg-success-700 dark:bg-opacity-20 dark:text-success-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`input-field py-3 text-base shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-white w-full ${
                  errors.email ? 'border-error-500 dark:border-error-500' : ''
                }`}
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-500">{errors.email}</p>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                className={`input-field py-3 text-base shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-white w-full ${
                  errors.password ? 'border-error-500 dark:border-error-500' : ''
                }`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-500">{errors.password}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="h-4 w-4 text-brand-blue focus:ring-brand-blue-light border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                fullWidth
                size="lg"
                className="mt-2 bg-brand-black text-white dark:bg-white dark:text-brand-black hover:bg-brand-blue-gray hover:text-white dark:hover:bg-brand-blue-gray dark:hover:text-white shadow-md"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
} 