'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { twMerge } from 'tailwind-merge';
import { useSession } from '@/context/session-context';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith('/auth');
  const { userName } = useSession();
  
  return (
    <header className={twMerge("relative z-10", className)}>
      <div className="mx-auto px-4 py-3 max-w-7xl backdrop-blur-sm bg-white/70 dark:bg-black/70 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center">
          <Link 
            href="/dashboard" 
            className="flex items-center group transition-all duration-300 hover:scale-105"
          >
            <div className="bg-black text-white dark:bg-white dark:text-black p-2 rounded-md mr-2 group-hover:shadow-lg transition-all duration-300 group-hover:rotate-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 group-hover:rotate-12">
                <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" fill="currentColor" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">Ohh.tc</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {!isAuthPage && (
              <nav className="hidden md:flex items-center space-x-6 mr-4">
                <Link 
                  href="/dashboard" 
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/dashboard' 
                      ? 'text-black dark:text-white' 
                      : 'text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/transactions" 
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith('/transactions') 
                      ? 'text-black dark:text-white' 
                      : 'text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Transactions
                </Link>
                <Link 
                  href="/beneficiary" 
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith('/beneficiary') 
                      ? 'text-black dark:text-white' 
                      : 'text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Beneficiaries
                </Link>
                <Link 
                  href="/payment" 
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith('/payment') 
                      ? 'text-black dark:text-white' 
                      : 'text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Send Money
                </Link>
                <Link 
                  href="/profile" 
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith('/profile') 
                      ? 'text-black dark:text-white' 
                      : 'text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Profile
                </Link>
              </nav>
            )}
            
            {!isAuthPage && (
              <div className="hidden md:flex items-center mr-4">
                <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 mr-4">Welcome, {userName}</div>
                <Link 
                  href="/auth/login" 
                  className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                >
                  Sign Out
                </Link>
              </div>
            )}
            
            <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 