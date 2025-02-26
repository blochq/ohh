import React from 'react';
import Container from '../components/Container';
import Button from '../components/Button';
import Logo from '../components/Logo';
import Link from 'next/link';

export default function ConfirmationPage() {
  // Mock transaction data - in a real app, this would come from state management or API
  const transactionDetails = {
    id: 'TRX123456789',
    date: new Date().toISOString(),
    amount: 1000,
    exchangeRate: 1550,
    nairaAmount: 1550000,
    recipientName: 'John Doe',
    bankName: 'Chase Bank',
    accountNumber: '****5678',
    estimatedDelivery: '1-2 business days',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-success-100 p-4">
      <header className="flex justify-between items-center mb-8 pt-4">
        <Logo size="md" className="text-gradient" />
        <Link 
          href="/dashboard" 
          className="text-sm text-primary-600 hover:text-primary-800 hover:underline transition-colors"
        >
          Go to Dashboard
        </Link>
      </header>

      <Container maxWidth="lg">
        {/* Success Animation */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-success-500 to-primary-600 mb-6 shadow-lg">
            <svg 
              className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gradient">Payment Successful!</h1>
          <p className="text-gray-600">
            Your international payment has been processed
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Transaction Details Card */}
          <div className="container-card card-success md:col-span-1 shadow-md">
            <h2 className="text-lg font-medium mb-4 text-success-700 border-b pb-2">Transaction Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-medium font-mono badge badge-blue">{transactionDetails.id}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">
                  {new Date(transactionDetails.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Amount Sent</span>
                <span className="font-medium text-primary-700">${transactionDetails.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Exchange Rate</span>
                <span className="font-medium">₦{transactionDetails.exchangeRate.toLocaleString()} / $1</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Naira Paid</span>
                <span className="font-medium text-primary-700">₦{transactionDetails.nairaAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Recipient</span>
                <span className="font-medium">{transactionDetails.recipientName}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Bank</span>
                <span className="font-medium">{transactionDetails.bankName}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Account Number</span>
                <span className="font-medium">{transactionDetails.accountNumber}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estimated Delivery</span>
                <span className="font-medium badge badge-green">{transactionDetails.estimatedDelivery}</span>
              </div>
            </div>
          </div>
          
          {/* Receipt Options */}
          <div className="md:col-span-1 flex flex-col">
            <div className="container-card h-full flex flex-col shadow-md">
              <h2 className="text-lg font-medium mb-4 text-primary-700 border-b pb-2">Receipt</h2>
              
              <div className="space-y-4 flex-grow">
                <Button 
                  variant="secondary" 
                  fullWidth
                  className="flex items-center justify-center hover-lift shadow-sm"
                >
                  <svg 
                    className="w-5 h-5 mr-2 text-primary-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                    />
                  </svg>
                  Download Receipt
                </Button>
                
                <Button 
                  variant="secondary" 
                  fullWidth
                  className="flex items-center justify-center hover-lift shadow-sm"
                >
                  <svg 
                    className="w-5 h-5 mr-2 text-primary-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                  Email Receipt
                </Button>
              </div>
              
              <div className="mt-auto pt-6">
                <Link href="/payment">
                  <Button 
                    fullWidth 
                    size="lg"
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md hover-lift group transition-all"
                  >
                    <span className="flex items-center justify-center">
                      Make Another Payment
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
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Thank you for choosing <span className="text-primary-600 font-medium">Ohh.tc</span> for your international payments.
          </p>
        </div>
      </Container>
    </div>
  );
} 