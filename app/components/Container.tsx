import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  padding?: boolean;
  variant?: 'default' | 'card' | 'outlined';
}

const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'md',
  className = '',
  padding = true,
  variant = 'default',
}) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'xs':
        return 'max-w-xs';
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case 'full':
        return 'max-w-full';
      default:
        return 'max-w-md';
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'card':
        return 'bg-white border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800 rounded-lg';
      case 'outlined':
        return 'border border-gray-200 rounded-lg dark:border-gray-700';
      default:
        return '';
    }
  };

  return (
    <div 
      className={twMerge(
        'w-full mx-auto',
        getMaxWidthClass(),
        getVariantClass(),
        padding ? 'px-4 sm:px-6 py-4 sm:py-6' : '',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container; 