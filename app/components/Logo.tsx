import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  hideLinkBehavior?: boolean;
}

export default function Logo({ 
  size = 'md', 
  className = '',
  hideLinkBehavior = false
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const logoContent = (
    <span className={`font-bold ${sizeClasses[size]} ${className}`} aria-label="Ohh.tc Logo">
      Ohh.tc
    </span>
  );

  if (hideLinkBehavior) {
    return logoContent;
  }

  return (
    <Link href="/dashboard" className="focus:outline-none focus:ring-2 focus:ring-black rounded-sm">
      {logoContent}
    </Link>
  );
} 