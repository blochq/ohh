'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import { transactionService } from '../lib/api/services';
import { Transaction } from '../lib/api/types';

interface DashboardStats {
  totalAmount: number;
  transactionCount: number;
  percentageIncrease: number;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalAmount: 0,
    transactionCount: 0,
    percentageIncrease: 0
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await transactionService.getAllTransactions(1, 5);
        setTransactions(response.data.transactions);
        
        // Calculate stats
        if (response.data.transactions.length > 0) {
          const total = response.data.transactions.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
          setStats({
            totalAmount: total,
            transactionCount: response.data.transactions.length,
            percentageIncrease: 8.3 // This would ideally be calculated from historical data
          });
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
        setError(errorMessage);
        console.error('Error fetching transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Page title and description */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-brand-black dark:text-white tracking-tight">Dashboard</h1>
        <p className="text-brand-gray dark:text-gray-300">
          Send international payments with ease
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-1">
          <div className="grid grid-cols-1 gap-4">
            <div className="container-card hover:border-gray-300 dark:hover:border-gray-700">
              <span className="data-label">Total Transfers</span>
              <div className="data-value-large mt-1">
                {isLoading ? 'Loading...' : formatCurrency(stats.totalAmount)}
              </div>
              <div className="text-sm text-success-700 dark:text-success-500 flex items-center mt-2">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span>{stats.percentageIncrease}% increase</span>
              </div>
            </div>
            
            <div className="container-card hover:border-gray-300 dark:hover:border-gray-700">
              <span className="data-label">Recent Activity</span>
              <div className="data-value mt-1">
                {isLoading ? 'Loading...' : `${stats.transactionCount} transfers this month`}
              </div>
            </div>
            
            <div className="container-card hover:border-gray-300 dark:hover:border-gray-700">
              <h2 className="text-base font-bold text-brand-black dark:text-white mb-3">Quick Actions</h2>
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
              <Link href="/transactions">
                <Button 
                  variant="secondary" 
                  size="md" 
                  fullWidth
                  className="mb-2 dark:text-white hover:bg-white hover:text-black dark:hover:text-white dark:bg-black border border-white dark:border dark:border-black"
                >
                  View History
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-3">
          <div className="container-card h-full hover:border-gray-300 dark:hover:border-gray-700">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-bold text-brand-black dark:text-white">Recent Transactions</h2>
              <Link href="/transactions">
                <Button 
                  variant="text" 
                  size="sm" 
                  className="text-brand-blue-gray hover:text-brand-gray dark:text-gray-400 dark:hover:text-gray-300"
                >
                  View All
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-black dark:border-white mx-auto"></div>
                <p className="mt-2 text-brand-gray dark:text-gray-400">Loading transactions...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center text-error-700 dark:text-error-500">
                <p>{error}</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="table-container border-none">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell text-left">Recipient</th>
                      <th className="table-header-cell text-left">Date</th>
                      <th className="table-header-cell text-right">Amount</th>
                      <th className="table-header-cell text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                      <Link href={`/transactions/${transaction.id}`} key={transaction.id}>
                        <tr className="table-row cursor-pointer">
                          <td className="table-cell font-medium">
                            {transaction.beneficiary?.beneficiaryName || 'Unknown Recipient'}
                          </td>
                          <td className="table-cell text-brand-gray dark:text-gray-400">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="table-cell text-right font-medium">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="table-cell text-right">
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
                            </span>
                          </td>
                        </tr>
                      </Link>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-brand-gray dark:text-gray-400">
                <p>No transactions yet</p>
                <Link href="/payment" className="mt-4 inline-block">
                  <Button size="sm">Send your first payment</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 