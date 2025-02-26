'use client';

import React from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import Link from 'next/link';
import ThemeToggle from '../../components/ThemeToggle';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center p-4 bg-white dark:bg-black">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-black dark:text-white tracking-tight">Welcome back</h1>
          <p className="text-brand-gray dark:text-white text-center mt-2 max-w-sm">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="container-card border-1 border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700">
          <form className="space-y-6">
            <Input
              label="Username"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className=' bg-white dark:bg-brand-black'
              placeholder="Enter your username"
            />

            <div>
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password" 
                required
                className=' bg-white dark:bg-brand-black'
                placeholder="Enter your password"
              />
              <div className="flex justify-end mt-2">
                <Link
                  href="#"
                  className="text-sm text-brand-blue-gray hover:text-brand-gray transition-colors duration-150 dark:text-white dark:hover:text-brand-gray"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                size="lg"
                className="mt-6 py-3 bg-white dark:bg-black dark:hover:bg-black text-brand-gray dark:text-white hover:bg-white border border-black dark:border dark:border-white  "
              >
                Sign In
              </Button>
            </div>
            
            <div className="pt-4 text-center text-sm text-brand-gray dark:text-white">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="#" className="text-brand-blue-gray hover:text-brand-gray hover:underline dark:text-white dark:hover:text-brand-gray">
                  Contact administrator
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-brand-gray dark:text-gray-600">
            &copy; {new Date().getFullYear()} Ohh.tc • All rights reserved
          </p>
        </div>
      </div>
    </main>
  );
} 