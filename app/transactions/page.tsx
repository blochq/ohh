'use client';

import React, { useState, useEffect } from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import Link from 'next/link';
import { transactionService } from '../lib/api/services';
import { Transaction } from '../lib/api/types';
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit] = useState<number>(10);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await transactionService.getAllTransactions(page, limit);
        setTransactions(response.data.transactions);
        
        // Calculate total pages
        const total = response.data.meta.total;
        setTotalPages(Math.ceil(total / limit));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions';
        setError(errorMessage);
        console.error('Error fetching transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [page, limit]);

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

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black p-4">


      <Container maxWidth="full">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-brand-black dark:text-white tracking-tight">Transaction History</h1>
            <p className="text-brand-gray dark:text-gray-300">
              View all your international payments
            </p>
          </div>
          <Link href="/payment">
            <Button 
              size="md" 
              className="bg-brand-black text-white dark:bg-white dark:text-brand-black hover:bg-brand-blue-gray hover:text-white dark:hover:bg-brand-blue-gray dark:hover:text-white"
            >
              New Payment
            </Button>
          </Link>
        </div>

        <div className="container-card hover:border-gray-300 dark:hover:border-gray-700">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-black dark:border-white mx-auto"></div>
              <p className="mt-4 text-brand-gray dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-error-700 dark:text-error-500">
              <p>{error}</p>
              <Button 
                variant="text" 
                size="sm" 
                className="mt-4"
                onClick={() => setIsLoading(true)}
              >
                Retry
              </Button>
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="table-container">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell text-left">Recipient</th>
                      <th className="table-header-cell text-left">Date</th>
                      <th className="table-header-cell text-left">Reference</th>
                      <th className="table-header-cell text-right">Amount</th>
                      <th className="table-header-cell text-right">Status</th>
                      <th className="table-header-cell text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                      <tr 
                        key={transaction.id} 
                        className="table-row"
                      >
                        <td className="table-cell font-medium">
                          {transaction.beneficiary?.beneficiaryName || 'Unknown Recipient'}
                        </td>
                        <td className="table-cell text-brand-gray dark:text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="table-cell text-brand-gray dark:text-gray-400">
                          {transaction.reference.substring(0, 8)}...
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
                        <td className="table-cell text-right">
                          <Button 
                            variant="text" 
                            size="sm"
                            className="text-brand-blue-gray hover:text-brand-gray dark:text-gray-400 dark:hover:text-white"
                            onClick={() => router.push(`/transactions/${transaction.id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))} 
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-brand-gray dark:text-gray-400">
                  Showing page {page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    disabled={page === 1}
                    onClick={handlePreviousPage}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    disabled={page === totalPages}
                    onClick={handleNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-brand-gray dark:text-gray-400">
              <p>No transactions found</p>
              <Link href="/payment" className="mt-4 inline-block">
                <Button size="sm">Send your first payment</Button>
              </Link>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
} 