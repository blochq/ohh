import React from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center p-4 bg-gradient-to-br from-white to-primary-50">
      <div className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-full bg-white shadow-md mb-4">
            <Logo size="lg" className="text-gradient" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gradient">Sign In</h1>
          <p className="text-gray-600 text-center mt-2 max-w-sm">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="container-card shadow-lg border-t-4 border-primary-500 transition-all duration-300 hover:shadow-xl">
          <form className="space-y-6">
            <Input
              label="Username"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
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
                placeholder="Enter your password"
              />
              <div className="flex justify-end mt-2">
                <Link
                  href="#"
                  className="text-sm text-primary-600 hover:text-primary-800 transition-colors duration-150"
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
                className="mt-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover-lift"
              >
                Sign In
              </Button>
            </div>
            
            <div className="pt-4 text-center text-sm text-gray-600">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="#" className="text-primary-600 hover:text-primary-800 hover:underline">
                  Contact administrator
                </Link>
              </p>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Ohh.tc • All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
} 