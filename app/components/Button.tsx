import React, { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leadingIcon,
  trailingIcon,
  className,
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-black text-white hover:bg-gray-800 focus:ring-gray-700 dark:bg-white dark:text-brand-black dark:hover:bg-gray-100 dark:focus:ring-gray-300 shadow-sm';
      case 'secondary':
        return 'bg-white text-brand-black border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 shadow-sm';
      case 'ghost':
        return 'bg-transparent text-brand-gray hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800';
      default:
        return 'bg-brand-black text-white hover:bg-gray-800 focus:ring-gray-700 dark:bg-white dark:text-brand-black dark:hover:bg-gray-100 dark:focus:ring-gray-300 shadow-sm';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-3 py-1.5 rounded';
      case 'md':
        return 'text-sm px-4 py-2 rounded-md';
      case 'lg':
        return 'text-base px-5 py-2.5 rounded-md';
      default:
        return 'text-sm px-4 py-2 rounded-md';
    }
  };

  const baseClasses = 'font-medium inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-target';
  const widthClasses = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : 'hover-lift';

  return (
    <button
      className={twMerge(
        baseClasses,
        getVariantClasses(),
        getSizeClasses(),
        widthClasses,
        disabledClasses,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && leadingIcon && <span className="mr-2">{leadingIcon}</span>}
      <span>{children}</span>
      {!isLoading && trailingIcon && <span className="ml-2">{trailingIcon}</span>}
    </button>
  );
};

export default Button; 