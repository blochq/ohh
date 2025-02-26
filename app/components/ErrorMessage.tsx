import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  className = '',
}) => {
  return (
    <div 
      className={twMerge(
        'rounded-md bg-error-50 p-4 border border-error-100',
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-error-500" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-error-800">{title}</h3>
          <div className="mt-1 text-sm text-error-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage; 