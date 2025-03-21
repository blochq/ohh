'use client';

import { useParams } from 'next/navigation';
import TransactionDetailClient from './TransactionDetailClient';

// This is the recommended pattern for Next.js 15+ with App Router
export default function TransactionDetailPage() {
  const { id } = useParams();
  return (
    <div>
      <TransactionDetailClient id={id as string} />
    </div>
  );
} 