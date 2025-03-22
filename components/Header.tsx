'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { twMerge } from 'tailwind-merge';
import Logo from './Logo';
import { useSession } from '@/context/session-context';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith('/auth');
  const {userType,  userName} = useSession();
  
  return (
    <header className={twMerge("flex justify-between items-center mb-8 pt-4", className)}>
      <Logo size="md" className="text-gradient" />
      
      <div className="flex items-center space-x-4">
        {!isAuthPage && (
          <nav className="hidden md:flex items-center space-x-6 mr-4">
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/dashboard' 
                  ? 'text-brand-blue dark:text-brand-blue-light' 
                  : 'text-gray-600 hover:text-brand-blue dark:text-gray-300 dark:hover:text-brand-blue-light'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/transactions" 
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith('/transactions') 
                  ? 'text-brand-blue dark:text-brand-blue-light' 
                  : 'text-gray-600 hover:text-brand-blue dark:text-gray-300 dark:hover:text-brand-blue-light'
              }`}
            >
              Transactions
            </Link>
            <Link 
              href="/recipient" 
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith('/recipient') 
                  ? 'text-brand-blue dark:text-brand-blue-light' 
                  : 'text-gray-600 hover:text-brand-blue dark:text-gray-300 dark:hover:text-brand-blue-light'
              }`}
            >
              Recipients
            </Link>
            <Link 
              href="/payment" 
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith('/payment') 
                  ? 'text-brand-blue dark:text-brand-blue-light' 
                  : 'text-gray-600 hover:text-brand-blue dark:text-gray-300 dark:hover:text-brand-blue-light'
              }`}
            >
              Send Money
            </Link>
            {userType === 'user' || userType === 'owner' && (
            <Link 
              href="/user-management" 
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith('/user-management') 
                  ? 'text-brand-blue dark:text-brand-blue-light' 
                  : 'text-gray-600 hover:text-brand-blue dark:text-gray-300 dark:hover:text-brand-blue-light'
              }`}
            >
              Manage Users
            </Link>
            )}
          </nav>
        )}
        
        {!isAuthPage && (
          <div className="hidden md:flex items-center mr-4">
            <div className="text-sm text-brand-gray dark:text-gray-300 mr-4">Welcome, {userName}</div>
            <Link 
              href="/auth/login" 
              className="text-sm text-brand-blue-gray hover:text-brand-gray transition-colors dark:text-gray-400 dark:hover:text-white"
            >
              
              Sign Out
            </Link>
          </div>
        )}
        
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header; 