'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedLayout from '../../components/AnimatedLayout';
import AnimatedButton from '../../components/AnimatedButton';
import AnimatedFormField from '../../components/AnimatedFormField';
import { containerVariants, itemVariants } from '../../lib/utils/transitions';
import authService, { RegisterUserData } from '../../lib/api/services/auth';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterUserData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
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
    
    try {
      // Register the user
      const response = await authService.registerUser(formData);
      
      if (response.success) {
        // Store email in session storage for verification page
        sessionStorage.setItem('userEmail', formData.email);
        
        // Redirect to email verification page
        router.push('/auth/verify-email');
      } else {
        setServerError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedLayout 
      title="Create Your Account" 
      subtitle="Join thousands of users making global payments"
      maxWidth="sm"
    >
      <motion.div 
        className="container-card border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 shadow-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {serverError && (
          <motion.div 
            className="bg-error-100 text-error-700 p-3 rounded-md mb-6 dark:bg-error-700 dark:bg-opacity-20 dark:text-error-500"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {serverError}
          </motion.div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <AnimatedFormField
                label="First Name"
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                delay={0.1}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <AnimatedFormField
                label="Last Name"
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                delay={0.2}
              />
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <AnimatedFormField
              label="Email Address"
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              delay={0.3}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <AnimatedFormField
              label="Password"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helperText="Password must be at least 8 characters long"
              delay={0.4}
            />
          </motion.div>
          
          <motion.div 
            className="flex items-start"
            variants={itemVariants}
          >
            <div className="flex items-center h-5">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                className="h-4 w-4 text-brand-blue focus:ring-brand-blue-light border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
                checked={formData.acceptTerms}
                onChange={handleChange}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptTerms" className="font-medium text-gray-700 dark:text-gray-300">
                I agree to the <a href="#" className="text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light">Terms of Service</a> and <a href="#" className="text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light">Privacy Policy</a>
              </label>
              {errors.acceptTerms && (
                <motion.p 
                  className="mt-1 text-sm text-error-600 dark:text-error-500"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {errors.acceptTerms}
                </motion.p>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            className="pt-4"
            variants={itemVariants}
          >
            <AnimatedButton
              type="submit"
              fullWidth
              size="lg"
              className="mt-2"
              disabled={isLoading}
              isLoading={isLoading}
              loadingText="Creating Account..."
            >
              Create Account
            </AnimatedButton>
          </motion.div>
        </form>
        
        <motion.div 
          className="mt-6 text-center"
          variants={itemVariants}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </AnimatedLayout>
  );
} 