'use client';

import React, { useState, useEffect } from 'react';
import Container from '../../components/Container';
import Button from '../../components/Button';
import Logo from '../../../components/Logo';
import Link from 'next/link';
import ThemeToggle from '../../../components/ThemeToggle';
import { transactionService } from '../../../lib/api/services';
import { Transaction } from '../../../lib/api/types';
import { useRouter } from 'next/navigation';

interface TransactionDetailClientProps {
  id: string;
}

export default function TransactionDetailClient({ id }: TransactionDetailClientProps) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await transactionService.getTransaction(id);
        setTransaction(response.data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load transaction details';
        setError(errorMessage);
        console.error('Error fetching transaction:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  const refreshStatus = async () => {
    if (!transaction) return;
    
    setStatusLoading(true);
    try {
      const response = await transactionService.getTransactionStatus(id);
      setTransaction(prev => prev ? { ...prev, status: response.data.status } : null);
    } catch (err: unknown) {
      console.error('Error refreshing status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black p-4">
      <header className="flex justify-between items-center mb-8 pt-4">
        <Logo size="md" />
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link 
            href="/transactions" 
            className="text-sm text-brand-blue-gray hover:text-brand-gray transition-colors dark:text-gray-400 dark:hover:text-white"
          >
            All Transactions
          </Link>
          <Link 
            href="/dashboard" 
            className="text-sm text-brand-blue-gray hover:text-brand-gray transition-colors dark:text-gray-400 dark:hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <Container maxWidth="full">
        <div className="mb-6">
          <Link 
            href="/transactions" 
            className="text-sm text-brand-blue-gray hover:text-brand-gray flex items-center dark:text-gray-400 dark:hover:text-white"
          >
            <svg 
              className="w-4 h-4 mr-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back to Transactions
          </Link>
        </div>

        <div className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-brand-black dark:text-white tracking-tight">
            Transaction Details
          </h1>
          <p className="text-brand-gray dark:text-gray-300">
            View the details of your payment
          </p>
        </div>

        {isLoading ? (
          <div className="container-card py-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-black dark:border-white mx-auto"></div>
            <p className="mt-4 text-brand-gray dark:text-gray-400">Loading transaction details...</p>
          </div>
        ) : error ? (
          <div className="container-card py-12 text-center text-error-700 dark:text-error-500">
            <p>{error}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-4"
              onClick={() => router.push('/transactions')}
            >
              Back to Transactions
            </Button>
          </div>
        ) : transaction ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="container-card hover:border-gray-300 dark:hover:border-gray-700">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-brand-black dark:text-white">Payment Summary</h2>
                    <p className="text-brand-gray dark:text-gray-400 text-sm mt-1">
                      Reference: {transaction.reference}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span 
                      className={
                        transaction.status === 'completed' 
                          ? 'badge badge-green' 
                          : transaction.status === 'pending' 
                          ? 'badge badge-yellow' 
                          : transaction.status === 'processing'
                          ? 'badge badge-blue'
                          : 'badge badge-red'
                      }
                    >
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      {statusLoading && (
                        <span className="ml-2 inline-block animate-spin h-3 w-3 border-b border-current rounded-full"></span>
                      )}
                    </span>
                    <button 
                      onClick={refreshStatus}
                      disabled={statusLoading}
                      className="ml-2 text-brand-gray hover:text-brand-black dark:text-gray-400 dark:hover:text-white"
                      title="Refresh status"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="text-xl font-bold text-brand-black dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fee</p>
                    <p className="text-xl font-bold text-brand-black dark:text-white">
                      {formatCurrency(transaction.fee)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="text-xl font-bold text-brand-black dark:text-white">
                      {formatCurrency(transaction.totalAmount)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-brand-black dark:text-white">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
                  <h3 className="font-medium mb-4 text-brand-black dark:text-white">Payment Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-brand-gray dark:text-gray-400">Narration</span>
                      <span className="text-brand-black dark:text-white">{transaction.narration}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-brand-gray dark:text-gray-400">Beneficiary ID</span>
                      <span className="text-brand-black dark:text-white">{transaction.beneficiaryId}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-brand-gray dark:text-gray-400">Created At</span>
                      <span className="text-brand-black dark:text-white">{formatDate(transaction.createdAt)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-brand-gray dark:text-gray-400">Updated At</span>
                      <span className="text-brand-black dark:text-white">{formatDate(transaction.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="container-card hover:border-gray-300 dark:hover:border-gray-700">
                <h3 className="font-medium mb-4 text-brand-black dark:text-white">Quick Actions</h3>
                <Link href="/payment" className="w-full">
                  <Button 
                    size="md" 
                    fullWidth 
                    className="mb-2 bg-brand-black text-white dark:bg-white dark:text-brand-black hover:bg-brand-blue-gray hover:text-white dark:hover:bg-brand-blue-gray dark:hover:text-white"
                  >
                    <span className="flex items-center justify-center">
                      Send Payment
                      <svg 
                        className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M14 5l7 7m0 0l-7 7m7-7H3" 
                        />
                      </svg>
                    </span>
                  </Button>
                </Link>
                <Button 
                  variant="secondary" 
                  size="md" 
                  fullWidth
                  className="mb-2 dark:text-white hover:bg-white hover:text-black dark:hover:text-white dark:bg-black border border-white dark:border dark:border-black"
                  onClick={() => router.push('/transactions')}
                >
                  View History
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-brand-gray dark:text-gray-400">
            <p>No transactions found</p>
            <Link href="/payment" className="mt-4 inline-block">
              <Button size="sm">Send your first payment</Button>
            </Link>
          </div>
        )}
      </Container>
    </main>
  );
} 