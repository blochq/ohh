import React from 'react';
import { twMerge } from 'tailwind-merge';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  fullPage = false,
  label = 'Loading...',
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-8 w-8';
      case 'lg':
        return 'h-12 w-12';
      default:
        return 'h-8 w-8';
    }
  };

  const spinnerContent = (
    <>
      <svg
        className={twMerge(
          'animate-spin text-primary-600',
          getSizeClass(),
          className
        )}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && <span className="mt-2 text-sm text-gray-600">{label}</span>}
    </>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-50">
        {spinnerContent}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner; 