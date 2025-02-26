import React from 'react';
import Container from '../../components/Container';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import Link from 'next/link';

export default function PaymentResultPage() {
  // Mock data - in a real app, this would come from state management or API
  const paymentDetails = {
    usdAmount: 1000,
    exchangeRate: 1550,
    nairaAmount: 1550000,
    blocAccount: {
      bankName: 'Guaranty Trust Bank',
      accountName: 'Bloc FX Limited',
      accountNumber: '0123456789',
    },
    expiryTime: '30 minutes',
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <header className="flex justify-between items-center mb-8 pt-4">
        <Logo size="md" className="text-gradient" />
        <Link 
          href="/payment" 
          className="text-sm text-primary-600 hover:text-primary-800 hover:underline flex items-center transition-colors"
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
          Back to Payment
        </Link>
      </header>

      <Container maxWidth="full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 dark:text-white">Naira Deposit Details</h1>
          <p className="text-gray-600 dark:text-white">
            Please make your Naira deposit within {paymentDetails.expiryTime}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Exchange Rate Card */}
          <div className="container-card md:col-span-1 shadow-md">
            <h2 className="text-lg font-medium mb-4 text-primary-700 border-b pb-2 dark:text-white  ">Exchange Rate Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-brand-gray dark:text-white">You&apos;re sending:</span>
                <span className="font-medium text-lg text-primary-700">${paymentDetails.usdAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-brand-gray dark:text-white">Exchange rate:</span>
                <span className="font-medium">₦{paymentDetails.exchangeRate.toLocaleString()} / $1</span>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-brand-gray dark:text-white font-medium">Naira deposit amount:</span>
                  <span className="font-semibold text-xl text-primary-700">₦{paymentDetails.nairaAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bank Details Card */}
          <div className="container-card md:col-span-1 card-accent shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-primary-700 border-b pb-2 dark:text-white">Bloc Account Details</h2>
              <div className="badge badge-blue">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-1"></span>
                  <span>Active</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-brand-gray dark:text-white mb-1">Bank Name</p>
                <p className="font-medium">{paymentDetails.blocAccount.bankName}</p>
              </div>
              
              <div>
                <p className="text-sm text-brand-gray dark:text-white mb-1">Account Name</p>
                <p className="font-medium">{paymentDetails.blocAccount.accountName}</p>
              </div>
              
              <div className="bg-primary-50 p-3 rounded-md shadow-sm">
                <p className="text-sm text-brand-gray dark:text-white mb-1">Account Number</p>
                <div className="flex justify-between items-center">
                  <p className="font-medium tracking-wider">{paymentDetails.blocAccount.accountNumber}</p>
                  <button 
                    className="text-primary-600 hover:text-primary-800 focus:outline-none transition-colors"
                    aria-label="Copy account number"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Deposit Instructions */}
        <div className="container-card mb-8 shadow-md">
          <h2 className="text-lg font-medium mb-4 text-primary-700 border-b pb-2 dark:text-white">Next Steps</h2>
          
          <ol className="space-y-4 text-sm md:text-base">
            <li className="flex">
               <div className="flex-shrink-0 flex h-6 w-6 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 text-white items-center justify-center mr-3 mt-0.5 shadow-sm">
                <span>1</span>
              </div>
              <p>
                Make a transfer of <span className="font-medium text-primary-700">₦{paymentDetails.nairaAmount.toLocaleString()}</span> to the Bloc account details above.
              </p>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 flex h-6 w-6 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 text-white items-center justify-center mr-3 mt-0.5 shadow-sm">
                <span>2</span>
              </div>
              <p>
                After making your payment, click on the &quot;I&apos;ve Made Payment&quot; button below.
              </p>
            </li>
            <li className="flex">
              <div className="flex-shrink-0 flex h-6 w-6 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 text-white items-center justify-center mr-3 mt-0.5 shadow-sm">
                <span>3</span>
              </div>
              <p>
                Enter the recipient&apos;s bank account details on the next screen.
              </p>
            </li>
          </ol>
        </div>
        
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <Link href="/recipient" className="md:flex-1">
            <Button 
              fullWidth 
              size="lg"
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover-lift shadow-md"
            >
              I&apos;ve Made Payment
            </Button>
          </Link>
          <div className="md:flex-1">
            <Button 
              variant="secondary" 
              fullWidth
              className="hover-lift shadow-sm"
            >
              Save For Later
            </Button>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            This rate expires in <span className="text-primary-600 font-medium">{paymentDetails.expiryTime}</span>.
          </p>
        </div>
      </Container>
    </div>
  );
} 