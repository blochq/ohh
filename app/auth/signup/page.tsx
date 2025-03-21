'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { createCustomer } from '@/lib/api-calls';
import { SignupFormData, signupSchema } from '@/lib/dto';
import { Input } from '@/components/ui/input';

export default function SignUpPage() {

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      First_name: '',
      Last_name: '',
      Email: '',
      Password: '',
      Customer_type: "Personal",
    }
  });
  
  const { watch } = form;
  const formValues = watch();
  
  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: (response) => {
      console.log("response", response);
      if (response.data?.success) {
        sessionStorage.setItem('userEmail', formValues.Email);
      }
    }
  });
  
  function onSubmit(data: SignupFormData) {
 
    if (!acceptTerms) {
      setTermsError('You must accept the terms and conditions');
      return;
    }
    

    setTermsError(null);
    

    
    mutation.mutate(data);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-md mx-auto container">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gradient">Create Your Account</h1>
          <p className="text-gray-600 dark:text-gray-300">Join thousands of users making global payments</p>
        </div>
        
        <div className="container-card border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 shadow-md p-6">
          {mutation.error && (
            <div className="bg-error-100 text-error-700 p-3 rounded-md mb-6 dark:bg-error-700 dark:bg-opacity-20 dark:text-error-500">
              {mutation.error.message}
            </div>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="First_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="John" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="Last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Doe" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                  name="Email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                name="Password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="••••••••" 
                        type="password"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Terms and conditions with separate state */}
              <div className="flex flex-row items-start space-x-3 space-y-0">
                <Input
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary-light border-gray-300 rounded dark:border-gray-700 dark:bg-gray-900"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  aria-label="Accept Terms and Conditions"
                />
                <div className="space-y-1 leading-none">
                  <label className="font-medium text-gray-700 dark:text-gray-300">
                    I agree to the <a href="#" className="text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light">Terms of Service</a> and <a href="#" className="text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light">Privacy Policy</a>
                  </label>
                  {termsError && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {termsError}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full mt-2 text-base py-5"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-brand-blue hover:text-brand-blue-dark dark:text-brand-blue-light">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 