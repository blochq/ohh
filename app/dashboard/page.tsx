'use client';

import React from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';

interface Transaction {
  id: string;
  date: string;
  amount: string;
  recipient: string;
  status: 'completed' | 'pending' | 'failed';
}

// Mock transaction data - in a real app, this would come from an API
const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-02-25',
    amount: '$1,200.00',
    recipient: 'John Doe',
    status: 'completed',
  },
  {
    id: '2',
    date: '2024-02-23',
    amount: '$500.00',
    recipient: 'Jane Smith',
    status: 'completed',
  },
  {
    id: '3',
    date: '2024-02-20',
    amount: '$2,300.00',
    recipient: 'Mike Johnson',
    status: 'pending',
  },
];

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-white dark:bg-black p-4">
      <header className="flex justify-between items-center mb-8 pt-4">
        <Logo size="md" />
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="text-sm text-brand-gray dark:text-gray-300">Welcome, User</div>
          <Link 
            href="/auth/login" 
            className="text-sm text-brand-blue-gray hover:text-brand-gray transition-colors dark:text-gray-400 dark:hover:text-white"
          >
            Sign Out
          </Link>
        </div>
      </header>

      <Container maxWidth="full">
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
                <div className="data-value-large mt-1">$3,900.00</div>
                <div className="text-sm text-success-700 dark:text-success-500 flex items-center mt-2">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span>8.3% increase</span>
                </div>
              </div>
              
              <div className="container-card hover:border-gray-300 dark:hover:border-gray-700">
                <span className="data-label">Recent Activity</span>
                <div className="data-value mt-1">3 transfers this month</div>
              </div>
              
              <div className="container-card hover:border-gray-300 dark:hover:border-gray-700">
                <h2 className="text-base font-bold text-brand-black dark:text-white mb-3">Quick Actions</h2>
                <Link href="/payment" className="w-full">
                  <Button 
                    size="md" 
                    fullWidth 
                    className="mb-2 hover:bg-brand-blue-gray hover:text-white dark:hover:bg-brand  dark:hover:text-black"
                  >
                    <span className="flex items-center justify-center ">
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
                  className="mb-2 dark:text-white hover:bg-white hover:text-black  dark:hover:text-white dark:bg-black border border-white dark:border dark:border-black"
                >
                  View History
                </Button>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-3">
            <div className="container-card h-full hover:border-gray-300 dark:hover:border-gray-700">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-base font-bold text-brand-black dark:text-white">Recent Transactions</h2>
                <Button variant="ghost" size="sm" className="text-brand-blue-gray hover:text-brand-gray dark:text-gray-400 dark:hover:text-gray-300 dark:text-black dark:bg-white">
                  View All
                </Button>
              </div>

              {mockTransactions.length > 0 ? (
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
                      {mockTransactions.map((transaction) => (
                        <tr 
                          key={transaction.id} 
                          className="table-row"
                        >
                          <td className="table-cell font-medium">
                            {transaction.recipient}
                          </td>
                          <td className="table-cell text-brand-gray dark:text-gray-400">
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="table-cell text-right font-medium">
                            {transaction.amount}
                          </td>
                          <td className="table-cell text-right">
                            <span 
                              className={
                                transaction.status === 'completed' 
                                  ? 'badge badge-green' 
                                  : transaction.status === 'pending' 
                                  ? 'badge badge-yellow' 
                                  : 'badge badge-red'
                              }
                            >
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-brand-gray dark:text-gray-400">
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
} 