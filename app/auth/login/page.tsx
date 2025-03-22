'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { login } from '../../../lib/api-calls';
import { loginSchema, type LoginFormData } from '../../../lib/dto';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { IValidationError } from '@/lib/models';
import { useSession } from '@/context/session-context';


export default function LoginPage() {
  const router = useRouter();
  const { refreshSession } = useSession();

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
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-md mx-auto min-h-screen">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gradient">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-300">Sign in to your account</p>
        </div>
        
        <div className="container-card min-h-xl border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 shadow-md p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="john.doe@example.com" 
                        type="email" 
                        {...field}
                      />
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-sm text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full mt-2 bg-brand-black text-white dark:bg-white dark:text-brand-black hover:bg-brand-blue-gray hover:text-white dark:hover:bg-brand-blue-gray dark:hover:text-white shadow-md"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
} 