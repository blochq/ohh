'use client';

import React, { InputHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { formFieldVariants } from '../lib/utils/transitions';

interface AnimatedFormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  delay?: number;
}

export default function AnimatedFormField({
  label,
  error,
  helperText,
  icon,
  delay = 0,
  className = '',
  id,
  ...props
}: AnimatedFormFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  const inputClasses = `
    input-field py-3 text-base shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-white w-full
    ${error ? 'border-error-500 dark:border-error-500' : ''}
    ${icon ? 'pl-10' : ''}
    ${className}
  `;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formFieldVariants}
      transition={{ delay }}
    >
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
        {label}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p 
          className="mt-1 text-sm text-error-600 dark:text-error-500"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </motion.div>
  );
}

// Animated select field component
interface AnimatedSelectFieldProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  helperText?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  delay?: number;
}

export function AnimatedSelectField({
  label,
  options,
  error,
  helperText,
  delay = 0,
  className = '',
  id,
  onChange,
  ...props
}: AnimatedSelectFieldProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  const selectClasses = `
    input-field py-3 text-base shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-white w-full
    ${error ? 'border-error-500 dark:border-error-500' : ''}
    ${className}
  `;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formFieldVariants}
      transition={{ delay }}
    >
      <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
        {label}
      </label>
      
      <select
        id={selectId}
        className={selectClasses}
        onChange={onChange}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <motion.p 
          className="mt-1 text-sm text-error-600 dark:text-error-500"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </motion.div>
  );
} 