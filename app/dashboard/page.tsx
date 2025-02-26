import React from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-white to-primary-50 p-4">
      <header className="flex justify-between items-center mb-8 pt-4">
        <Logo size="md" className="text-gradient" />
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">Welcome, User</div>
          <Link 
            href="/auth/login" 
            className="text-sm text-primary-600 hover:text-primary-800 hover:underline transition-colors"
          >
            Sign Out
          </Link>
        </div>
      </header>

      <Container maxWidth="full">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gradient">Dashboard</h1>
          <p className="text-gray-600">
            Send international payments with ease
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main CTA - Takes up 1/3 of the screen on large displays */}
          <div className="lg:col-span-1">
            <div className="container-card h-full flex flex-col items-center p-6 md:p-8 shadow-md border-t-4 border-primary-500 transition-all duration-300 hover:shadow-lg">
              <h2 className="text-xl font-medium mb-4 text-primary-700">Quick Actions</h2>
              <Link href="/payment" className="w-full mt-auto">
                <Button 
                  size="lg" 
                  fullWidth 
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover-lift group transition-all"
                >
                  <span className="flex items-center justify-center">
                    Send International Payment
                    <svg 
                      className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" 
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
            </div>
          </div>

          {/* Transaction History - Takes up 2/3 of the screen on large displays */}
          <div className="lg:col-span-3">
            <div className="container-card h-full shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-primary-700 border-b pb-2">Recent Transactions</h2>
                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-800">
                  View All
                </Button>
              </div>

              {mockTransactions.length > 0 ? (
                <div className="divide-y">
                  {mockTransactions.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors rounded-md px-2"
                    >
                      <div className="mb-2 sm:mb-0">
                        <p className="font-medium text-base sm:text-base">{transaction.recipient}</p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                        <span className="font-medium text-base sm:text-base text-primary-700">{transaction.amount}</span>
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
} 