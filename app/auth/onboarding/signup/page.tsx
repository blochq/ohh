'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { signUpStageOne } from '@/lib/api-calls';
import { signUpStageOneSchema } from '@/lib/dto';
import { z } from 'zod';
import { toast } from 'sonner';
import Image from 'next/image';
// import Image from 'next/image'; // Can be re-added if an image is used in the right panel

type SignUpFormData = z.infer<typeof signUpStageOneSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpStageOneSchema),
    defaultValues: {
      FIRST_NAME: '',
      LAST_NAME: '',
      EMAIL: '',
      PHONE: '',
      PASSWORD: '',
      BUSINESS_NAME: '',
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
      const response = await signUpStageOne(data);
      if (response.error) {
        if (response.validationErrors && response.validationErrors.length > 0) {
          const errorMessages = response.validationErrors.map(err => `${err.field}: ${err.message}`).join('; ');
          throw new Error(`Validation failed: ${errorMessages}`);
        } else {
          throw new Error((response.error as Error).message || 'Failed to sign up.');
        }
      }
      if (!response.data) { // Assuming response.data contains the success payload
        throw new Error("Sign up successful but no data received.");
      }
      return response.data; // Contains token, user/business ID, etc.
    },
    onSuccess: (data) => {
      toast.success('Sign up successful! Proceeding to next step.');
      // TODO: Store the token and any relevant IDs from 'data'
      // For example:
      // if (data.token) sessionStorage.setItem('onboardingToken', data.token);
      // if (data.businessId) sessionStorage.setItem('onboardingBusinessId', data.businessId);
      console.log('Sign up success data:', data); // Acknowledge data
      router.push('/auth/onboarding/kyb');
    },
    onError: (error: Error) => {
      setError(error.message);
      toast.error(`Sign up failed: ${error.message}`);
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    setError(null);
    signUpMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-0 md:p-4">
      <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto   md:shadow-2xl rounded-lg overflow-hidden lg:min-h-[90vh]">
        {/* Left Column: Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 bg-white dark:bg-black ">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Create Your Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Start your journey with us.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="FIRST_NAME"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black dark:text-white">First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your first name" {...field} className="border-gray-300 dark:border-gray-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="LAST_NAME"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black dark:text-white">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your last name" {...field} className="border-gray-300 dark:border-gray-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="EMAIL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} className="border-gray-300 dark:border-gray-700" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="PHONE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} className="border-gray-300 dark:border-gray-700" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="PASSWORD"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} className="border-gray-300 dark:border-gray-700" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="BUSINESS_NAME"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black dark:text-white">Business Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your business name" {...field} className="border-gray-300 dark:border-gray-700" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-black text-white dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 rounded-lg py-3"
                disabled={signUpMutation.isPending}
              >
                {signUpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Up...
                  </>
                ) : (
                  'Sign Up & Continue'
                )}
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Ao continuar, você concorda com os{' '}
            <a href="/terms" className="font-medium text-black dark:text-white hover:underline">
              Termos de serviço
            </a>{' '}
            e{' '}
            <a href="/privacy" className="font-medium text-black dark:text-white hover:underline">
              Políticas de privacidade
            </a>.
          </p>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/auth/login" className="font-medium text-black dark:text-white hover:underline">
              Log in
            </a>
          </p>
        </div>

      
        <div className="hidden md:flex md:w-1/2 flex-col justify-center items-start relative text-white">
         
        
           <Image 
             src="/images/signup-image.png" 
             alt="Signup Image" 
             width={500}
             height={500}
           />
        
        </div>
      </div>
    </div>
  );
} 