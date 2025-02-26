import React, { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    helperText, 
    error, 
    leftIcon, 
    rightIcon, 
    className, 
    fullWidth = true,
    ...props 
  }, ref) => {
    const baseInputClasses = `
      bg-white 
      border 
      rounded-md 
      shadow-sm
      px-3 
      py-2 
      text-brand-black
      placeholder-gray-400
      transition-colors
      duration-200
      focus:outline-none 
      focus:ring-1 
      focus:border-brand-black
      focus:ring-brand-black
      dark:bg-gray-800
      dark:border-gray-700
      dark:text-white
      dark:placeholder-gray-500
      dark:focus:border-white
      dark:focus:ring-white
      ${leftIcon ? 'pl-9' : ''}
      ${rightIcon ? 'pr-9' : ''}
    `;

    const widthClasses = fullWidth ? 'w-full' : '';
    const errorClasses = error 
      ? 'border-error-500 text-error-700 focus:border-error-500 focus:ring-error-500 dark:border-error-500 dark:focus:border-error-500 dark:focus:ring-error-500' 
      : 'border-gray-200 dark:border-gray-700';
    const disabledClasses = props.disabled 
      ? 'bg-gray-50 text-gray-500 cursor-not-allowed dark:bg-gray-900 dark:text-gray-400' 
      : '';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-brand-black dark:text-white mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={twMerge(
              baseInputClasses,
              widthClasses,
              errorClasses,
              disabledClasses,
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <p className={`mt-1 text-sm ${error ? 'text-error-500 dark:text-error-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 