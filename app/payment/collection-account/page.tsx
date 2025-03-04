'use client';

import React, { useState, useEffect } from 'react';
import Container from '../../components/Container';
import Button from '../../components/Button';
import { paymentService } from '../../lib/api/services';
import { CollectionAccountResponse, ConversionResponse } from '../../lib/api/types';
import { useRouter } from 'next/navigation';

export default function CollectionAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<CollectionAccountResponse['data'] | null>(null);
  const [conversionData, setConversionData] = useState<ConversionResponse['data'] | null>(null);
  
  useEffect(() => {
    // Get conversion data from session storage
    const storedData = sessionStorage.getItem('conversionData');
    if (!storedData) {
      router.push('/payment');
      return;
    }
    
    setConversionData(JSON.parse(storedData) as ConversionResponse['data']);
    
    // Request collection account
    const getCollectionAccount = async () => {
      try {
        // Default provider name - this should be configured based on your requirements
        // Using 'bank' as a more likely provider name for bank transfers
        const providerName = 'bank';
        
        if (!conversionData) {
          throw new Error('Conversion data not found');
        }
        
        console.log(`Requesting collection account for provider: ${providerName}, amount: ${conversionData.sourceAmount}`);
        
        const response = await paymentService.requestCollectionAccount(providerName, conversionData.sourceAmount);
        
        console.log('Collection account response:', response);
        
        if (!response || !response.data) {
          throw new Error('Invalid response format from the server');
        }
        
        setAccountData(response.data);
        
        // Store account data for the next step
        sessionStorage.setItem('accountData', JSON.stringify(response.data));
      } catch (err: unknown) {
        console.error('Error getting collection account:', err);
        
        // Provide a more specific error message if possible
        let errorMessage = 'Failed to get collection account. Please try again.';
        
        if (err instanceof Error) {
          // Check for specific error messages
          if (err.message.includes('404')) {
            errorMessage = 'The collection account service is currently unavailable. Please try again later.';
          } else if (err.message.includes('JSON')) {
            errorMessage = 'There was an issue with the server response. Please contact support.';
          } else if (err.message === 'Conversion data not found') {
            errorMessage = 'Payment information not found. Please start the payment process again.';
            // Redirect back to payment page after a short delay
            setTimeout(() => router.push('/payment'), 3000);
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    getCollectionAccount();
  }, [router]);
  
  const handleContinue = () => {
    router.push('/payment/verify');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-black dark:border-white mx-auto"></div>
          <p className="mt-4 text-brand-black dark:text-white">Generating payment details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
 

      <Container maxWidth="full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gradient">Make Your Payment</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Transfer funds to the account details below
          </p>
        </div>
        
        {error && (
          <div className="bg-error-100 text-error-700 p-4 rounded-md mb-6 dark:bg-error-700 dark:bg-opacity-20 dark:text-error-500">
            {error}
          </div>
        )}
        
        <div className="container-card border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 shadow-md">
          {accountData && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-800">
                <h3 className="font-medium mb-4 text-brand-black dark:text-white">Payment Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">You&apos;re sending</p>
                    <p className="text-xl font-bold text-brand-black dark:text-white">
                      ${conversionData?.sourceAmount.toFixed(2)} {conversionData?.sourceCurrency}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Recipient gets</p>
                    <p className="text-xl font-bold text-brand-black dark:text-white">
                      ${conversionData?.destinationAmount.toFixed(2)} {conversionData?.destinationCurrency}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Exchange rate</p>
                    <p className="text-brand-black dark:text-white">
                      1 {conversionData?.sourceCurrency} = {conversionData?.rate.toFixed(4)} {conversionData?.destinationCurrency}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Fee</p>
                    <p className="text-brand-black dark:text-white">
                      ${conversionData?.fee.toFixed(2)} {conversionData?.sourceCurrency}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4 text-brand-black dark:text-white">Bank Transfer Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span className="text-gray-500 dark:text-gray-400">Bank Name</span>
                    <span className="font-medium text-brand-black dark:text-white">{accountData.bankName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span className="text-gray-500 dark:text-gray-400">Account Number</span>
                    <div className="flex items-center">
                      <span className="font-medium text-brand-black dark:text-white mr-2">{accountData.accountNumber}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(accountData.accountNumber)}
                        className="text-primary-600 hover:text-primary-800 dark:text-white dark:hover:text-gray-300"
                        aria-label="Copy account number to clipboard"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span className="text-gray-500 dark:text-gray-400">Account Name</span>
                    <div className="flex items-center">
                      <span className="font-medium text-brand-black dark:text-white mr-2">{accountData.accountName}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(accountData.accountName)}
                        className="text-primary-600 hover:text-primary-800 dark:text-white dark:hover:text-gray-300"
                        aria-label="Copy account name to clipboard"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <span className="text-gray-500 dark:text-gray-400">Reference</span>
                    <div className="flex items-center">
                      <span className="font-medium text-brand-black dark:text-white mr-2">{accountData.reference}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(accountData.reference)}
                        className="text-primary-600 hover:text-primary-800 dark:text-white dark:hover:text-gray-300"
                        aria-label="Copy reference to clipboard"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleContinue}
            size="lg"
            className="bg-brand-blue text-white hover:bg-brand-blue-dark shadow-md"
          >
            Continue to Verification
          </Button>
        </div>
      </Container>
    </div>
  );
} 