'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { login } from '../../../lib/api-calls';
import { loginSchema, type LoginFormData } from '../../../lib/dto';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { IValidationError } from '@/lib/models';
import { useSession } from '@/context/session-context';


export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => login(data),
    onSuccess: (response) => {
      if (response.data?.success) {
        toast.success('Login successful! ');

        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userEmail', response.data.data.email);
        sessionStorage.setItem('userName', response.data.data.full_name);
        sessionStorage.setItem('userId', response.data.data._id);
        sessionStorage.setItem('userType', response.data.data.user_type);
        sessionStorage.setItem('organizationId', response.data.data.organization_id);
        
        console.log(response.data.data);

        refreshSession();
        
        router.push('/dashboard');
      } else if (response.validationErrors) {
        response.validationErrors.forEach((error :IValidationError) => {
          form.setError(error.field as keyof LoginFormData, {
            message: error.message,
          });
        });
      } else if (response.error) {
        toast.error(response.error.message || 'Login failed. Please try again.');
      }
    },
    onError: () => {
      toast.error('An unexpected error occurred. Please try again.');
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center relative overflow-hidden">
   
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-gray-200 dark:bg-gray-800 opacity-30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[30%] w-[40%] h-[30%] bg-gray-100 dark:bg-gray-900 opacity-30 rounded-full blur-3xl"></div>
      </div>
      
    
      <div className="absolute top-8 left-12  items-center hidden md:flex">
        <div className="bg-black text-white dark:bg-white dark:text-black p-2 rounded-md mr-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" fill="currentColor" />
          </svg>
        </div>
        <span className="text-2xl font-bold text-black dark:text-white">Ohh.tc</span>
      </div>
      
     
      <div className="w-full max-w-md bg-white dark:bg-gray-900 md:backdrop-blur-sm rounded-3xl md:shadow-xl p-8 relative z-10 md:border md:border-gray-200 dark:border-gray-800">
        {/* Sign in icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full shadow-md">
            <LogIn className="h-6 w-6 text-black dark:text-white" />
          </div>
        </div>
        
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">
            Sign in with email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
           Make International Payments with ease
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                      <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <Input 
                        placeholder="Email" 
                        type="email" 
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                      <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <Input 
                        placeholder="Password" 
                        type={showPassword ? "text" : "password"}
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white"
                        {...field}
                      />
                      <button 
                        type="button"
                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full py-6 mt-4 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing In...' : 'Get Started'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 