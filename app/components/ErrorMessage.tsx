import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
  withIcon?: boolean;
}

export default function ErrorMessage({
  message,
  className = '',
  withIcon = true,
}: ErrorMessageProps) {
  return (
    <div className={`bg-gray-50 border-l-4 border-black p-4 my-3 ${className}`} role="alert">
      <div className="flex">
        {withIcon && (
          <div className="flex-shrink-0 mr-3">
            <svg
              className="h-5 w-5 text-black"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-1-5a1 1 0 112 0v1a1 1 0 11-2 0v-1zm0-5a1 1 0 112 0v2a1 1 0 11-2 0V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-800">{message}</p>
        </div>
      </div>
    </div>
  );
} 