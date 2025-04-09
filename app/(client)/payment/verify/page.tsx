'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePaymentContext } from '@/context/payment-context';
import { useQuery } from '@tanstack/react-query';
import { verifyPayment } from '@/lib/api-calls';
import { verifyPaymentSchema } from '@/lib/dto';
import { z } from 'zod';
import { getAuthToken } from '@/lib/helper-function';

export default function VerifyPaymentPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  
  const {
    accountData,
    conversionData,
    verificationData,
    setVerificationData,
    updateActivity
  } = usePaymentContext();
  
  useEffect(() => {
    if (!accountData || !conversionData) {
      router.push('/payment');
      return;
    }
    
  }, [router, accountData, conversionData]);


  useQuery({
    queryKey: ['verifyPayment', accountData?.reference, verificationAttempts],
    queryFn: async () => {
      if (!accountData || !conversionData) {
        throw new Error('Missing account or conversion data');
      }
      
      updateActivity();
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const input: z.infer<typeof verifyPaymentSchema> = {
        reference: accountData.reference,
        amount: conversionData.amount,
        token
      };
      
      const response = await verifyPayment(input);
      
      if (response.error) {
        setError(response.error.message);
        throw new Error(response.error.message);
      }
      
      if (response.data?.success) {
        setVerificationData(response.data);
        setError(null);
        toast.success('Payment verified successfully');
        router.push('/beneficiary');
        return response.data;
      } else {
      
        if (verificationAttempts < 10) {
          setTimeout(() => {
            setVerificationAttempts(prev => prev + 1);
          }, 5000); 
        }
        setError('Payment not verified yet. We\'ll continue checking automatically.');
        throw new Error('Payment not verified yet');
      }
    },
    enabled: !!accountData && !!conversionData && verificationAttempts < 10,
    retry: 0, 
    refetchOnWindowFocus: false,
    
  });


  useEffect(() => {
    if (accountData && conversionData && !verificationData?.success) {
      setVerificationAttempts(1);
    }
  }, [accountData, conversionData, verificationData]);
  
  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-100 bg-clip-text text-transparent">
            Verifying Your Payment
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Please wait while we confirm your transfer
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>
              Automatically checking your payment status
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {verificationData?.success ? (
              <div className="flex flex-col items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-500" />
                  </div>
                  <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Payment Verified!</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your payment of {conversionData?.amount} {conversionData?.sourceCurrency} has been verified.
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Redirecting you to the next step...
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Loader2 className="h-8 w-8 text-gray-500 dark:text-gray-400 animate-spin" />
                  </div>
                  <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Verifying Payment</h4>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    We&apos;re checking to see if your payment has been received. This might take a few moments. 
                    Please don&apos;t close this window.
                  </p>
                  
                  <div className="mt-8 w-full max-w-md mx-auto">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-black dark:bg-white animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
              It may take a few minutes for your payment to be verified after you&apos;ve completed the transfer.
            </p>
            
            {verificationData?.success && (
              <Button
                onClick={() => {
                  updateActivity();
                  router.push('/beneficiary');
                }}
                className="w-full md:w-auto mx-auto"
              >
                Continue to Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card className="border-l-4 border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg">Important</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Please ensure you&apos;ve made the payment to the correct account. If verification is taking longer than expected, 
              please check that you included the correct reference number with your transfer.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 