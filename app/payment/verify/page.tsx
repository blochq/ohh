'use client';

import React, { useState, useEffect } from 'react';
import Container from '../../components/Container';
import Button from '../../components/Button';
import { paymentService } from '../../lib/api/services';
import { CollectionAccountResponse, ConversionResponse, PaymentVerificationResponse } from '../../lib/api/types';
import { useRouter } from 'next/navigation';

export default function VerifyPaymentPage() {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<CollectionAccountResponse['data'] | null>(null);
  const [conversionData, setConversionData] = useState<ConversionResponse['data'] | null>(null);
  const [verificationData, setVerificationData] = useState<PaymentVerificationResponse['data'] | null>(null);
  
  useEffect(() => {

    const storedAccountData = sessionStorage.getItem('accountData');
    const storedConversionData = sessionStorage.getItem('conversionData');
    
    if (!storedAccountData || !storedConversionData) {
      router.push('/payment');
      return;
    }
    
    setAccountData(JSON.parse(storedAccountData) as CollectionAccountResponse['data']);
    setConversionData(JSON.parse(storedConversionData) as ConversionResponse['data']);
  }, [router]);
  
  const handleVerifyPayment = async () => {
    if (!accountData || !conversionData) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      console.log(`Verifying payment with reference: ${accountData.reference}, amount: ${conversionData.sourceAmount}`);
      
      const response = await paymentService.verifyPayment(accountData.reference, conversionData.sourceAmount);
      
      console.log('Payment verification response:', response);
      
      if (!response || !response.data) {
        throw new Error('Invalid response format from the server');
      }
      
      setVerificationData(response.data);
      
      if (response.data.verified) {
        console.log('Payment verified successfully');
        // Store verification data for the next step
        sessionStorage.setItem('verificationData', JSON.stringify(response.data));
        router.push('/payment/beneficiary');
      } else {
        console.log('Payment not verified');
        setError('Payment not verified yet. Please make sure you have completed the transfer and try again.');
      }
    } catch (err: unknown) {
      console.error('Error verifying payment:', err);
      
      // Provide a more specific error message if possible
      let errorMessage = 'Failed to verify payment. Please try again.';
      
      if (err instanceof Error) {
        // Check for specific error messages
        if (err.message.includes('404')) {
          errorMessage = 'The payment verification service is currently unavailable. Please try again later.';
        } else if (err.message.includes('JSON')) {
          errorMessage = 'There was an issue with the server response. Please contact support.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
     
      <Container maxWidth="full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-gradient">Verify Your Payment</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Confirm that you&apos;ve completed the bank transfer
          </p>
        </div>
        
        {error && (
          <div className="bg-error-100 text-error-700 p-4 rounded-md mb-6 dark:bg-error-700 dark:bg-opacity-20 dark:text-error-500">
            {error}
          </div>
        )}
        
        <div className="container-card border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 shadow-md">
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <h3 className="font-medium mb-4 text-brand-black dark:text-white">Payment Status</h3>
              
              {verificationData ? (
                <div className="flex items-center justify-center p-4">
                  {verificationData.verified ? (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-success-100 dark:bg-success-700 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-success-700 dark:text-success-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-brand-black dark:text-white mb-2">Payment Verified!</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Your payment of {verificationData.amount} {verificationData.currency} has been verified.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-warning-100 dark:bg-warning-700 dark:bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-warning-700 dark:text-warning-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-brand-black dark:text-white mb-2">Payment Not Verified</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        We haven&apos;t received your payment yet. Please make sure you&apos;ve completed the transfer.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Click the button below to verify your payment once you&apos;ve completed the bank transfer.
                  </p>
                  <Button
                    onClick={handleVerifyPayment}
                    disabled={isVerifying}
                    className="bg-brand-black text-white dark:bg-white dark:text-brand-black hover:bg-brand-blue-gray hover:text-white dark:hover:bg-brand-blue-gray dark:hover:text-white"
                  >
                    {isVerifying ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-brand-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : 'Verify Payment'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                It may take a few minutes for your payment to be verified after you&apos;ve completed the transfer.
              </p>
              
              {verificationData?.verified && (
                <Button
                  onClick={() => router.push('/payment/beneficiary')}
                  className="bg-brand-black text-white dark:bg-white dark:text-brand-black hover:bg-brand-blue-gray hover:text-white dark:hover:bg-brand-blue-gray dark:hover:text-white"
                >
                  Continue to Next Step
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
} 