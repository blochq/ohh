'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import TransactionDetailClient from './TransactionDetailClient';


export default function TransactionDetailPage() {
  const { id } = useParams();
  
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <TransactionDetailClient id={id as string} />
    </div>
  );
} 