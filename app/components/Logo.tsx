import React from 'react';
import { twMerge } from 'tailwind-merge';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  withText = true,
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6';
      case 'md':
        return 'h-8 w-8';
      case 'lg':
        return 'h-10 w-10';
      case 'xl':
        return 'h-12 w-12';
      default:
        return 'h-8 w-8';
    }
  };

  return (
    <div className="flex items-center">
      <div className={twMerge(getSizeClass(), 'relative rounded-full', className)}>
        {/* Simple O logo mark */}
        <div className="absolute inset-0 bg-brand-blue-gray rounded-full opacity-20 dark:opacity-30"></div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={twMerge('text-brand-black dark:text-white', className)}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
      </div>
      
      {withText && (
        <div className="ml-2 font-bold">
          <span className="text-xl tracking-tight text-brand-black dark:text-white">Ohh.tc</span>
        </div>
      )}
    </div>
  );
};

export default Logo; 